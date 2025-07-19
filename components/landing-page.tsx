"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Zap, Rocket, Code2, Settings, GitBranch } from "lucide-react"

interface LandingPageProps {
  onStartChat: (prompt: string) => void
}

const GREETING_MESSAGES = [
  "What would you like to ship?",
  "How can I help today?",
  "Ready to build something amazing?",
  "What Harness configuration do you need?",
  "Let's deploy something great!",
  "How can I help with your DevOps workflow?"
]

const EXAMPLE_PROMPTS = [
  {
    icon: GitBranch,
    title: "Create a CI/CD pipeline",
    description: "Build a complete deployment pipeline for your application",
    prompt: "Create a CI/CD pipeline for a Node.js application with build, test, and deployment stages"
  },
  {
    icon: Code2,
    title: "Generate a service configuration",
    description: "Set up service definitions and manifests",
    prompt: "Create a Kubernetes service configuration for a microservice application"
  },
  {
    icon: Settings,
    title: "Configure environments",
    description: "Set up staging and production environments",
    prompt: "Create environment configurations for staging and production with proper resource limits"
  },
  {
    icon: Zap,
    title: "Set up connectors",
    description: "Connect to cloud providers and repositories",
    prompt: "Create connector configurations for AWS and GitHub integration"
  }
]

export function LandingPage({ onStartChat }: LandingPageProps) {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  // Rotate greeting messages
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentGreeting((prev) => (prev + 1) % GREETING_MESSAGES.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onStartChat(inputValue.trim())
    }
  }

  const handleExampleClick = (prompt: string) => {
    onStartChat(prompt)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen p-8">
      <div className="max-w-4xl w-full mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Canary</h1>
          </div>
          
          {/* Rotating Greeting */}
          <div className="h-20 flex items-center justify-center">
            <h2 
              className={`text-4xl md:text-6xl font-light bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {GREETING_MESSAGES[currentGreeting]}
            </h2>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
            Your AI assistant for Harness platform operations. Generate pipelines, services, 
            environments, and infrastructure configurations with natural language.
          </p>
        </div>

        {/* Main Input */}
        <form onSubmit={handleSubmit} className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me to create a pipeline, service configuration, or anything else..."
              className="w-full h-16 pl-6 pr-16 text-lg bg-white dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20 shadow-lg shadow-gray-900/5 dark:shadow-none transition-all"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white rounded-xl h-11 px-5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Popular:</span>
            {["Pipeline", "Service", "Environment", "Connector"].map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() => setInputValue(`Create a new ${item.toLowerCase()}`)}
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-950/20 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-cyan-800/30"
              >
                {item}
              </Button>
            ))}
          </div>
        </form>

        {/* Example Prompts */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.prompt)}
              className="group p-6 bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 text-left transition-all duration-200 hover:transform hover:scale-[1.02] hover:shadow-lg shadow-gray-900/5 dark:shadow-none"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-xl flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-blue-600/20 dark:group-hover:from-cyan-500/30 dark:group-hover:to-blue-600/30 transition-all border border-blue-200/50 dark:border-cyan-500/20">
                  <example.icon className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-blue-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              </div>
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <Code2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">Harness Native</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-medium">Production Ready</span>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-500">
            Powered by Google Gemini 2.0 • Built for Harness Platform
          </div>
        </div>
      </div>
    </div>
  )
}