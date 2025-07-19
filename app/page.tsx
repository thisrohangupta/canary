"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { ChatInterface } from "@/components/chat-interface"

export default function CanaryApp() {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  const handleNewChat = (promptOrAction?: string) => {
    if (!promptOrAction) {
      setActiveChat("new-chat")
      setInitialPrompt(null)
      return
    }

    const isAction = ["pipeline", "service", "environment", "connector", "cost", "docs"].includes(promptOrAction)

    if (isAction) {
      const prompt = `Create a new ${promptOrAction}`
      setInitialPrompt(prompt)
      setActiveChat(`new-${promptOrAction}-chat`)
    } else {
      setInitialPrompt(promptOrAction)
      setActiveChat("new-chat")
    }
  }

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    setInitialPrompt(null) // Clear initial prompt when selecting an existing chat
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatInterface
            key={activeChat} // Use key to re-mount component for new chats
            chatId={activeChat}
            onClose={() => setActiveChat(null)}
            initialPrompt={initialPrompt}
          />
        ) : (
          <MainContent onNewChat={handleNewChat} />
        )}
      </div>
    </div>
  )
}
