"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send } from "lucide-react"
import { GitBranch, Settings, Database, DollarSign, BarChart3, BookOpen } from "lucide-react"

interface MainContentProps {
  onNewChat: (promptOrAction?: string) => void
}

export function MainContent({ onNewChat }: MainContentProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (inputValue.trim()) {
      onNewChat(inputValue)
    }
  }

  const quickActions = [
    { icon: GitBranch, label: "Create Pipeline", action: "pipeline" },
    { icon: Settings, label: "Create Service", action: "service" },
    { icon: Database, label: "Setup Environment", action: "environment" },
    { icon: DollarSign, label: "Add Connector", action: "connector" },
    { icon: BarChart3, label: "Cost Analysis", action: "cost" },
    { icon: BookOpen, label: "Harness Docs", action: "docs" },
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-teal-400 rounded flex items-center justify-center">
                <span className="text-black font-bold text-xs">C</span>
              </div>
              <span className="font-semibold">Canary</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Feedback
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center">
              <span className="text-black font-semibold text-sm">P</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          What can I help you build with Harness?
        </h1>

        {/* Input Area */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Canary to create pipelines, analyze costs, setup services..."
              className="w-full h-14 pl-4 pr-20 bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-lg rounded-xl"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg h-10 w-10"
                onClick={handleSend}
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12 w-full max-w-4xl">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-cyan-600 text-gray-300 hover:text-white text-center"
              onClick={() => onNewChat(action.action)}
            >
              <action.icon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
