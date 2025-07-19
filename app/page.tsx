"use client"

import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/landing-page"
import { ChatSidebar } from "@/components/chat-sidebar"
import { NewProjectModal } from "@/components/new-project-modal"
import { chatStorage } from "@/lib/chat-storage"
import { useState, useCallback } from "react"

export default function HomePage() {
  const router = useRouter()
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const handleStartChat = useCallback((prompt: string) => {
    // Create new chat and navigate to it
    const newChat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    chatStorage.saveChat(newChat)
    
    // Navigate to the chat with the initial prompt
    router.push(`/chat/${newChat.id}?prompt=${encodeURIComponent(prompt)}`)
  }, [router])

  const handleChatSelect = useCallback((chatId: string) => {
    router.push(`/chat/${chatId}`)
  }, [router])

  const handleNewChat = useCallback((actionType?: string, projectId?: string) => {
    const newChat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      projectId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      actionType
    }

    chatStorage.saveChat(newChat)
    
    if (projectId) {
      chatStorage.addChatToProject(projectId, newChat.id)
      router.push(`/project/${projectId}/chat/${newChat.id}`)
    } else {
      router.push(`/chat/${newChat.id}`)
    }
  }, [router])

  const handleNewProject = useCallback(() => {
    setShowNewProjectModal(true)
  }, [])

  const handleProjectCreated = useCallback((projectId: string) => {
    router.push(`/project/${projectId}`)
  }, [router])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <ChatSidebar
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <LandingPage onStartChat={handleStartChat} />
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
