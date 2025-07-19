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
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen p-8">
      <div className="max-w-4xl w-full mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Canary</h1>
          </div>
          
          {/* Rotating Greeting */}
          <div className="h-16 flex items-center justify-center">
            <h2 
              className={`text-4xl md:text-5xl font-light text-gray-100 transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {GREETING_MESSAGES[currentGreeting]}
            </h2>
          </div>
          
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
            Your AI assistant for Harness platform operations. Generate pipelines, services, 
            environments, and more with natural language.
          </p>
        </div>

        {/* Main Input */}
        <form onSubmit={handleSubmit} className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me to create a pipeline, service configuration, or anything else..."
              className="w-full h-14 pl-6 pr-16 text-lg bg-gray-800/80 backdrop-blur-sm border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl h-10 px-4 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="text-sm text-gray-500">Try:</span>
            {["Pipeline", "Service", "Environment", "Connector"].map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() => setInputValue(`Create a new ${item.toLowerCase()}`)}
                className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-all"
              >
                {item}
              </Button>
            ))}
          </div>
        </form>

        {/* Example Prompts */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.prompt)}
              className="group p-6 bg-gray-800/40 hover:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600 text-left transition-all duration-200 hover:transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                  <example.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-2 group-hover:text-cyan-400 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-green-500" />
              <span>Harness Native</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Production Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}