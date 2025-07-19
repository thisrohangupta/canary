"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MessageSquarePlus, Search, ChevronDown, Menu, X } from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activeChat: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: (promptOrAction?: string) => void
}

export function Sidebar({ collapsed, onToggleCollapse, activeChat, onChatSelect, onNewChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const recentChats = [
    "Create K8s deployment pipeline",
    "Setup AWS connector and secrets",
    "Cost optimization for dev environment",
    "Custom SLO dashboard creation",
  ]

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNewChat()}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-lg">Canary</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => onNewChat()} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <Collapsible defaultOpen={true} className="mt-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-400 hover:text-white py-2">
            Recents
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {recentChats.map((chat, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-sm hover:bg-gray-800 pl-4 ${
                  activeChat === chat ? "bg-gray-800 text-cyan-400" : "text-gray-300 hover:text-white"
                }`}
                onClick={() => onChatSelect(chat)}
              >
                <span className="truncate">{chat}</span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </ScrollArea>
    </div>
  )
}
