"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ChatSidebar } from "@/components/chat-sidebar"
import { NewProjectModal } from "@/components/new-project-modal"
import { YamlPanel } from "@/components/yaml-panel"
import { chatStorage, Chat, Project } from "@/lib/chat-storage"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const chatId = params.chatId as string
  const initialPrompt = searchParams.get('prompt')
  
  const [chat, setChat] = useState<Chat | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [yamlPanelData, setYamlPanelData] = useState<any>(null)
  const [showYamlPanel, setShowYamlPanel] = useState(false)

  // Load chat and project data
  useEffect(() => {
    if (chatId) {
      const loadedChat = chatStorage.getChat(chatId)
      setChat(loadedChat)
      
      if (loadedChat?.projectId) {
        const project = chatStorage.getProject(loadedChat.projectId)
        setCurrentProject(project)
      } else {
        setCurrentProject(null)
      }
    }
  }, [chatId])

  const handleChatSelect = useCallback((newChatId: string) => {
    router.push(`/chat/${newChatId}`)
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

  const handleCloseChat = useCallback(() => {
    router.push('/')
  }, [router])

  const handleYamlGenerated = useCallback((yamlData: any) => {
    setYamlPanelData(yamlData)
    setShowYamlPanel(true)
  }, [])

  const handleCloseYamlPanel = useCallback(() => {
    setShowYamlPanel(false)
  }, [])

  if (!chat) {
    return (
      <div className="flex h-screen bg-gray-950">
        <ChatSidebar
          currentChatId={chatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Chat Not Found</h1>
            <p className="text-gray-400 mb-6">The chat you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/')} className="bg-cyan-600 hover:bg-cyan-700">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <ChatSidebar
        currentChatId={chatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onNewProject={handleNewProject}
      />
      
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Navigation Header */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              {currentProject && (
                <>
                  <span className="text-gray-600">/</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/project/${currentProject.id}`)}
                    className="text-gray-400 hover:text-white"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: currentProject.color }}
                    />
                    {currentProject.name}
                  </Button>
                  <span className="text-gray-600">/</span>
                  <span className="text-gray-400">Chat</span>
                </>
              )}
            </div>
          </div>

          <ChatInterface
            chatId={chatId}
            onClose={handleCloseChat}
            initialPrompt={initialPrompt}
            currentProject={currentProject}
            onYamlGenerated={handleYamlGenerated}
            onInitialPromptUsed={() => {
              // Remove prompt from URL after use
              router.replace(`/chat/${chatId}`)
            }}
          />
        </div>
        
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