"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatInterface } from "./chat-interface"
import { ChatSidebar } from "./chat-sidebar"
import { NewProjectModal } from "./new-project-modal"
import { YamlPanel } from "./yaml-panel"
import { LandingPage } from "./landing-page"
import { chatStorage, Chat, Project } from "@/lib/chat-storage"

export function ChatApp() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [yamlPanelData, setYamlPanelData] = useState<any>(null)
  const [showYamlPanel, setShowYamlPanel] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  // Load current chat when chatId changes
  useEffect(() => {
    if (currentChatId) {
      const chat = chatStorage.getChat(currentChatId)
      setCurrentChat(chat)
      
      // Load project if chat belongs to one
      if (chat?.projectId) {
        const project = chatStorage.getProject(chat.projectId)
        setCurrentProject(project)
      } else {
        setCurrentProject(null)
      }
    } else {
      setCurrentChat(null)
      setCurrentProject(null)
    }
  }, [currentChatId])

  const handleChatSelect = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
    setInitialPrompt(null) // Clear initial prompt when selecting existing chat
  }, [])

  const handleNewChat = useCallback((actionType?: string, projectId?: string) => {
    const newChat: Chat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      projectId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      actionType
    }

    chatStorage.saveChat(newChat)
    
    // Add to project if specified
    if (projectId) {
      chatStorage.addChatToProject(projectId, newChat.id)
    }

    setInitialPrompt(null) // Clear any initial prompt
    setCurrentChatId(newChat.id)
  }, [])

  const handleStartChatWithPrompt = useCallback((prompt: string) => {
    const newChat: Chat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    chatStorage.saveChat(newChat)
    setInitialPrompt(prompt)
    setCurrentChatId(newChat.id)
  }, [])

  const handleNewProject = useCallback(() => {
    setShowNewProjectModal(true)
  }, [])

  const handleProjectCreated = useCallback((projectId: string) => {
    // Optionally create a new chat in the project
    handleNewChat(undefined, projectId)
  }, [handleNewChat])

  const handleCloseChat = useCallback(() => {
    setCurrentChatId(null)
  }, [])

  const handleYamlGenerated = useCallback((yamlData: any) => {
    setYamlPanelData(yamlData)
    setShowYamlPanel(true)
  }, [])

  const handleCloseYamlPanel = useCallback(() => {
    setShowYamlPanel(false)
  }, [])

  // Don't auto-create chats - show landing page instead
  // Users can manually select existing chats from sidebar

  return (
    <div className="flex h-screen bg-gray-950">
      <ChatSidebar
        currentChatId={currentChatId || undefined}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onNewProject={handleNewProject}
      />
      
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {currentChatId && currentChat ? (
            <ChatInterface
              key={currentChatId} // Force re-render when chat changes
              chatId={currentChatId}
              onClose={handleCloseChat}
              initialPrompt={initialPrompt}
              currentProject={currentProject}
              onYamlGenerated={handleYamlGenerated}
              onInitialPromptUsed={() => setInitialPrompt(null)}
            />
          ) : (
            <LandingPage onStartChat={handleStartChatWithPrompt} />
          )}
        </div>
        
        {/* Right Panel for YAML */}
        <YamlPanel
          yamlData={yamlPanelData}
          isVisible={showYamlPanel}
          onClose={handleCloseYamlPanel}
        />
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}