import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is required")
}

const genAI = new GoogleGenerativeAI(apiKey)

export interface GeneratedResponse {
  content: string
  type: string
  data?: any
  usedWebSearch?: boolean
  thoughts?: string[]
}

// Helper function to detect if query needs web search
function needsWebSearch(prompt: string): boolean {
  const webSearchKeywords = [
    'latest', 'recent', 'current', 'new', 'update', 'version', 'release',
    'kubernetes', 'docker', 'helm', 'terraform', 'aws', 'azure', 'gcp',
    'security vulnerability', 'cve', 'best practices', 'benchmark',
    'monitoring', 'prometheus', 'grafana', 'observability',
    'ci/cd', 'pipeline', 'deployment', 'devops tools',
    'go version', 'node version', 'javascript framework',
    'what is', 'how to', 'tutorial', 'guide', 'documentation'
  ]
  
  const lowerPrompt = prompt.toLowerCase()
  return webSearchKeywords.some(keyword => lowerPrompt.includes(keyword))
}

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

export async function generateWithGemini(
  prompt: string, 
  actionType?: string, 
  conversationHistory: ConversationMessage[] = [],
  projectContext: ConversationMessage[] = []
): Promise<GeneratedResponse> {
  try {
    const shouldUseWebSearch = needsWebSearch(prompt)
    
    // Configure model with optional web search
    const modelConfig: any = { model: "gemini-2.0-flash-exp" }
    const generateConfig: any = {}
    
    if (shouldUseWebSearch) {
      generateConfig.tools = [{ google_search: {} }]
    }
    
    const model = genAI.getGenerativeModel(modelConfig)

    const systemPrompt = `You are Canary, an AI assistant specialized in the Harness Platform. You help DevOps teams create, configure, and optimize Harness resources and workflows.

Your expertise is focused EXCLUSIVELY on Harness platform:
- Harness CI/CD Pipelines (Build, Deploy, Custom stages)
- Harness Services (Kubernetes, Native Helm, Docker, etc.)
- Harness Environments (Production, Staging, Development)
- Harness Connectors (Cloud providers, Git, Docker registries, etc.)
- Harness Infrastructure Definitions and Provisioners
- Harness Secrets Management and Variables
- Harness Triggers, Input Sets, and Templates
- Harness Cost Management (CCM) and Cloud Asset Management
- Harness Security Testing Orchestration (STO)
- Harness Feature Flags (FF) and Chaos Engineering (CE)
- Harness GitOps and CD workflows

IMPORTANT CONSTRAINTS:
- Only respond to queries about Harness platform resources, configurations, and documentation
- Generate ONLY Harness-specific YAML configurations
- For non-Harness questions, politely redirect to Harness platform topics
- Use official Harness documentation and best practices

Available Harness resource types: pipeline, service, environment, connector, infrastructure, template, trigger, inputset, cost, dashboard, docs, general

Current request type: ${actionType || "general"}

Guidelines for Harness YAML generation:
- Generate valid Harness YAML configurations following official schema
- Include realistic Harness identifiers, names, and configurations  
- For pipelines: Include Harness-specific stages (CI, CD, Approval, etc.)
- For services: Include Harness service definitions with artifacts and manifests
- For environments: Include Harness environment configurations with infrastructure
- For connectors: Include Harness connector configurations for cloud providers, Git, etc.
- Use Harness expressions, variables, and built-in functions where appropriate
- Include proper Harness tags, governance, and RBAC considerations
- Follow Harness naming conventions and best practices

Response Instructions:
- FIRST: Show your thinking process by starting with <thinking> tags containing your step-by-step reasoning
- CONTEXT AWARENESS: Consider both project context and conversation history to provide relevant, contextual responses
- PROJECT CONTEXT: If working within a project, reference and build upon previous configurations from other chats in the same project
- CONVERSATION CONTEXT: Build upon the current chat's conversation flow
- Reference earlier messages or project discussions if the user is asking for modifications or follow-ups
- For Harness YAML configurations: Provide a well-formatted explanation followed by the YAML
- For general Harness questions: Provide helpful information about Harness platform
- For non-Harness questions: Politely redirect to Harness topics
- Always use proper markdown formatting with headers, lists, and code blocks
- Make responses informative and professional like Claude or ChatGPT would

Example format:
<thinking>
Let me think about this Harness pipeline request...
1. The user wants a CI/CD pipeline for a Node.js application
2. I should include build, test, and deploy stages
3. Need to consider Harness-specific syntax and best practices
4. Should include proper service and environment references
</thinking>

[Your actual response here...]`

    // Build project context
    let projectContextStr = ""
    if (projectContext.length > 0) {
      projectContextStr = "\n\nProject Context (Recent discussions in this project):\n"
      projectContext.slice(-10).forEach((msg) => { // Keep last 10 project messages
        const content = msg.content.length > 200 ? msg.content.slice(0, 200) + "..." : msg.content
        projectContextStr += `${msg.role === "user" ? "Human" : "Canary"}: ${content}\n\n`
      })
    }

    // Build conversation context
    let conversationContext = ""
    if (conversationHistory.length > 0) {
      conversationContext = "\n\nCurrent Chat History:\n"
      conversationHistory.slice(-6).forEach((msg, index) => { // Keep last 6 messages for context
        conversationContext += `${msg.role === "user" ? "Human" : "Canary"}: ${msg.content}\n\n`
      })
    }
    
    const fullPrompt = `${systemPrompt}${projectContextStr}${conversationContext}\n\nCurrent User Request: ${prompt}`
    
    console.log("Sending prompt to Gemini 2.0:", fullPrompt.substring(0, 200) + "...")
    console.log("Using web search:", shouldUseWebSearch)
    
    const result = shouldUseWebSearch 
      ? await model.generateContent(fullPrompt, generateConfig)
      : await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    console.log("Gemini 2.0 raw response:", text)

    // Process the response as natural text (not JSON)
    console.log("Gemini 2.0 response received:", text.substring(0, 200) + "...")
    
    // Extract thinking content if present
    const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
    let thoughts: string[] = []
    let cleanContent = text
    
    if (thinkingMatch) {
      const thinkingContent = thinkingMatch[1].trim()
      // Split thinking into individual thoughts (by lines or numbered items)
      thoughts = thinkingContent
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, ''))
      
      // Remove thinking tags from content
      cleanContent = text.replace(/<thinking>[\s\S]*?<\/thinking>\s*/g, '').trim()
    }
    
    // Check if the response contains YAML code blocks
    const yamlMatches = cleanContent.match(/```yaml\n([\s\S]*?)\n```/g)
    
    if (yamlMatches && yamlMatches.length > 0) {
      // Extract YAML content
      const yamlContent = yamlMatches[0].replace(/```yaml\n/, '').replace(/\n```/, '')
      
      // Try to detect the type from the YAML content or use actionType
      let detectedType = actionType || "configuration"
      let resourceType = "Configuration"
      
      // Detect Harness resource type from YAML content
      if (yamlContent.includes("kind: pipeline") || yamlContent.includes("type: ci") || yamlContent.includes("stages:")) {
        detectedType = "pipeline"
        resourceType = "Pipeline"
      } else if (yamlContent.includes("kind: service") || yamlContent.includes("serviceDefinition")) {
        detectedType = "service" 
        resourceType = "Service"
      } else if (yamlContent.includes("kind: environment") || yamlContent.includes("environmentRef")) {
        detectedType = "environment"
        resourceType = "Environment"
      } else if (yamlContent.includes("kind: connector") || yamlContent.includes("connectorRef")) {
        detectedType = "connector"
        resourceType = "Connector"
      }
      
      return {
        content: cleanContent, // Clean content without thinking tags
        type: detectedType,
        data: {
          title: `Harness ${resourceType}`,
          description: `Generated Harness ${resourceType.toLowerCase()} configuration`,
          yaml: yamlContent,
          metadata: {
            harnessVersion: "Latest",
            resourceType: `Harness ${resourceType}`,
            category: detectedType === "pipeline" ? "CI/CD" : "Platform"
          }
        },
        thoughts: thoughts,
        usedWebSearch: shouldUseWebSearch
      }
    } else {
      // Regular text response without YAML
      return {
        content: cleanContent,
        type: "general",
        thoughts: thoughts,
        usedWebSearch: shouldUseWebSearch
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    
    // Check if it's a rate limit error (429)
    if (error instanceof Error && error.message.includes('[429]')) {
      return {
        content: "🚫 **Daily Rate Limit Reached**\n\nYou have hit your daily rate limit for the Gemini API. This happens when you've exceeded the free tier quota of 50 requests per day.\n\n**What you can do:**\n\n• **Wait until tomorrow** - Your quota will reset in 24 hours\n• **Upgrade your plan** - Visit [Google AI Studio](https://ai.google.dev/) to increase your quota\n• **Use fewer requests** - Try to be more specific with your questions to make each request count\n\n**Rate Limit Details:**\n- Free tier: 50 requests per day\n- The limit resets every 24 hours\n- Consider upgrading to a paid plan for higher limits\n\nFor more information about rate limits, visit the [Gemini API documentation](https://ai.google.dev/gemini-api/docs/rate-limits).",
        type: "rate_limit_error",
        data: {
          title: "Rate Limit Exceeded",
          description: "Daily Gemini API quota reached",
          retryAfter: "24 hours",
          upgradeUrl: "https://ai.google.dev/",
          docsUrl: "https://ai.google.dev/gemini-api/docs/rate-limits"
        },
        usedWebSearch: false
      }
    }
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('API key')) {
      return {
        content: "🔑 **API Key Configuration Error**\n\nPlease check that your Gemini API key is correctly configured in `.env.local`.\n\n**Steps to fix:**\n\n1. Create a `.env.local` file in your project root\n2. Add: `NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here`\n3. Restart your development server\n\nGet your API key from [Google AI Studio](https://ai.google.dev/).",
        type: "api_key_error",
        data: {
          title: "API Key Missing",
          description: "Gemini API key not configured",
          setupUrl: "https://ai.google.dev/"
        },
        usedWebSearch: false
      }
    }
    
    // Check if it's a quota/billing error
    if (error instanceof Error && error.message.includes('quota') || error instanceof Error && error.message.includes('billing')) {
      return {
        content: "💳 **Quota or Billing Issue**\n\nThere's an issue with your Gemini API quota or billing setup.\n\n**Common causes:**\n\n• **Free tier limits exceeded** - You may have hit daily/monthly limits\n• **Billing not enabled** - Some features require a billing account\n• **Payment method issues** - Check your payment method in Google Cloud Console\n\n**What to do:**\n\n1. Check your [Google Cloud Console](https://console.cloud.google.com/) billing\n2. Review your API usage and quotas\n3. Consider upgrading your plan if needed\n\nFor more details, visit the [Gemini API pricing page](https://ai.google.dev/gemini-api/docs/rate-limits).",
        type: "quota_error", 
        data: {
          title: "Quota/Billing Issue",
          description: "Check your Google Cloud billing and quotas",
          billingUrl: "https://console.cloud.google.com/billing",
          pricingUrl: "https://ai.google.dev/gemini-api/docs/rate-limits"
        },
        usedWebSearch: false
      }
    }
    
    // Check if it's a network/connection error
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection'))) {
      return {
        content: "🌐 **Connection Error**\n\nUnable to connect to the Gemini API. This could be a temporary network issue.\n\n**Try these steps:**\n\n• Check your internet connection\n• Wait a moment and try again\n• Check if there are any ongoing Google AI service outages\n\nIf the problem persists, the Gemini API may be experiencing temporary issues.",
        type: "network_error",
        data: {
          title: "Connection Failed",
          description: "Unable to reach Gemini API"
        },
        usedWebSearch: false
      }
    }
    
    // Generic error fallback
    return {
      content: `⚠️ **Something went wrong**\n\nI encountered an unexpected error while processing your request.\n\n**Error details:**\n\`${error instanceof Error ? error.message : 'Unknown error'}\`\n\n**What you can try:**\n\n• Wait a moment and try again\n• Check your internet connection\n• Verify your API key configuration\n• If the problem persists, there may be a temporary service issue`,
      type: "error", 
      data: {
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        errorType: "generic"
      },
      usedWebSearch: false
    }
  }
}