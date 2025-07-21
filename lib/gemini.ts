export interface GeneratedResponse {
  content: string
  type: string
  data?: any
  usedWebSearch?: boolean
  thoughts?: string[]
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
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        actionType,
        conversationHistory,
        projectContext
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Gemini API error:", error)
    
    // Check if it's a network/connection error
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection'))) {
      return {
        content: "🌐 **Connection Error**\n\nUnable to connect to the Gemini API. This could be a temporary network issue.\n\n**Try these steps:**\n\n• Check your internet connection\n• Wait a moment and try again\n• Check if there are any ongoing service outages\n\nIf the problem persists, the API may be experiencing temporary issues.",
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
      content: `⚠️ **Something went wrong**\n\nI encountered an unexpected error while processing your request.\n\n**Error details:**\n\`${error instanceof Error ? error.message : 'Unknown error'}\`\n\n**What you can try:**\n\n• Wait a moment and try again\n• Check your internet connection\n• If the problem persists, there may be a temporary service issue`,
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