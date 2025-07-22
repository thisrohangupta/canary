/**
 * HARNESS CANARY - AI ASSISTANT LANDING PAGE
 * 
 * Landing page designed to match Harness.io's design system and messaging
 * Incorporates the complete Software Delivery Platform branding including:
 * - CI/CD Pipelines
 * - IDP (Internal Developer Portal) 
 * - CCM (Cloud Cost Management)
 * - IR (Incident Response)
 * - FF (Feature Flags)
 * - STO (Security Testing Orchestration)
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Send, 
  Sparkles, 
  Zap, 
  Rocket, 
  Code2, 
  Settings, 
  GitBranch,
  Shield,
  DollarSign,
  AlertTriangle,
  Flag,
  Users,
  Building2,
  Cloud
} from "lucide-react"

interface LandingPageProps {
  onStartChat: (prompt: string) => void
}

// Harness platform greeting messages
const GREETING_MESSAGES = [
  "Ready to Ship Faster with Harness?",
  "What would you like to deploy today?", 
  "How can I help with your Software Delivery?",
  "Let's build something amazing together!",
  "Ready to accelerate your DevOps pipeline?",
  "What Harness capability do you need?"
]

// Harness platform capabilities with proper branding
const PLATFORM_CAPABILITIES = [
  {
    icon: GitBranch,
    title: "CI/CD Pipelines",
    description: "Build, test, and deploy with intelligent automation",
    prompt: "Create a CI/CD pipeline for a Node.js application with automated testing and deployment to Kubernetes",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
  },
  {
    icon: Building2,
    title: "Internal Developer Portal",
    description: "Centralized platform for developer self-service",
    prompt: "Help me set up an Internal Developer Portal with service catalogs and developer workflows",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
  },
  {
    icon: DollarSign,
    title: "Cloud Cost Management",
    description: "Optimize and govern cloud spending intelligently",
    prompt: "Show me how to set up Cloud Cost Management with budget alerts and cost optimization recommendations",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
  },
  {
    icon: AlertTriangle,
    title: "Incident Response",
    description: "Automated incident detection and resolution",
    prompt: "Create an incident response workflow with automated detection and escalation policies",
    color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
  },
  {
    icon: Flag,
    title: "Feature Flags",
    description: "Safe feature releases and experimentation",
    prompt: "Set up feature flags for gradual rollout and A/B testing of new features",
    color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
  },
  {
    icon: Shield,
    title: "Security Testing",
    description: "Integrated security scanning and governance",
    prompt: "Configure Security Testing Orchestration with SAST, DAST, and container scanning",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
  }
]

export function LandingPage({ onStartChat }: LandingPageProps) {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [inputValue, setInputValue] = useState("")

  // Rotate greeting messages like Harness.io does
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % GREETING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (prompt: string) => {
    if (prompt.trim()) {
      onStartChat(prompt.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(inputValue)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header - Harness Branding */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">Canary</h1>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            AI Assistant for
            <span className="text-blue-600 block">Harness Platform</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Get instant help with CI/CD pipelines, IDP services, CCM cost optimization, 
            IR incident workflows, and infrastructure configurations. AI-powered assistance for your DevOps workflows.
          </p>
        </div>

        {/* AI Chat Input - Modern Harness Style */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 transition-all duration-500">
                  {GREETING_MESSAGES[currentGreeting]}
                </h3>
              </div>
              
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about CI/CD pipelines, IDP services, CCM cost optimization, IR incident workflows, or any Harness configurations..."
                  className="w-full h-14 pl-4 pr-14 text-lg bg-white border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={() => handleSubmit(inputValue)}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-2 h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                <Zap className="inline h-4 w-4 mr-1 text-blue-500" />
                Powered by Gemini 2.0 • AI assistance for Harness platform
              </p>
            </div>
          </div>
        </div>

        {/* Harness Platform Capabilities */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Harness Platform Capabilities
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get AI-powered assistance across all Harness modules. From CI/CD pipelines to IDP services, 
              CCM cost optimization, and IR incident management - streamline your entire software delivery lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon
              return (
                <button
                  key={index}
                  onClick={() => handleSubmit(capability.prompt)}
                  className={`group text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${capability.color}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{capability.title}</h4>
                      <p className="text-sm opacity-80 leading-relaxed">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm font-medium opacity-80 group-hover:opacity-100">
                    Try this module
                    <Send className="ml-2 h-3 w-3" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Platform Integration - Harness Ecosystem */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Integrated with Your Favorite Tools
            </h3>
            <p className="text-gray-600">
              Canary works seamlessly with your existing toolchain and Harness integrations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Kubernetes", icon: "⎈" },
              { name: "AWS", icon: "☁️" },
              { name: "Docker", icon: "🐳" },
              { name: "GitHub", icon: "📱" },
              { name: "Terraform", icon: "🏗️" },
              { name: "Prometheus", icon: "📊" }
            ].map((tool, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-2 text-2xl flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {tool.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{tool.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Harness Style */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Software Delivery?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Streamline your software delivery with AI-powered assistance across CI/CD, IDP, CCM, 
              and IR - covering your entire development, deployment, and operations lifecycle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleSubmit("Show me how to get started with Harness platform")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
              >
                Get Started with AI Assistant
              </Button>
              <Button
                onClick={() => handleSubmit("What are the key benefits of using Harness platform?")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Footer - Simple */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold text-blue-600">Harness</span>
          </p>
        </div>
      </div>
    </div>
  )
}