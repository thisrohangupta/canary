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

export default function ProjectChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const projectId = params.projectId as string
  const chatId = params.chatId as string
  const initialPrompt = searchParams.get('prompt')
  
  const [chat, setChat] = useState<Chat | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [yamlPanelData, setYamlPanelData] = useState<any>(null)
  const [showYamlPanel, setShowYamlPanel] = useState(false)

  // Load chat and project data
  useEffect(() => {
    if (projectId && chatId) {
      const loadedProject = chatStorage.getProject(projectId)
      const loadedChat = chatStorage.getChat(chatId)
      
      setProject(loadedProject)
      setChat(loadedChat)
      
      // Verify chat belongs to project
      if (loadedChat && loadedChat.projectId !== projectId) {
        // Chat doesn't belong to this project, redirect
        router.push(`/chat/${chatId}`)
        return
      }
    }
  }, [projectId, chatId, router])

  const handleChatSelect = useCallback((newChatId: string) => {
    // Check if the new chat belongs to current project
    const targetChat = chatStorage.getChat(newChatId)
    if (targetChat?.projectId === projectId) {
      router.push(`/project/${projectId}/chat/${newChatId}`)
    } else {
      router.push(`/chat/${newChatId}`)
    }
  }, [router, projectId])

  const handleNewChat = useCallback((actionType?: string, targetProjectId?: string) => {
    const useProjectId = targetProjectId || projectId
    const newChat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      projectId: useProjectId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      actionType
    }

    chatStorage.saveChat(newChat)
    
    if (useProjectId) {
      chatStorage.addChatToProject(useProjectId, newChat.id)
      router.push(`/project/${useProjectId}/chat/${newChat.id}`)
    } else {
      router.push(`/chat/${newChat.id}`)
    }
  }, [router, projectId])

  const handleNewProject = useCallback(() => {
    setShowNewProjectModal(true)
  }, [])

  const handleProjectCreated = useCallback((newProjectId: string) => {
    router.push(`/project/${newProjectId}`)
  }, [router])

  const handleCloseChat = useCallback(() => {
    router.push(`/project/${projectId}`)
  }, [router, projectId])

  const handleYamlGenerated = useCallback((yamlData: any) => {
    setYamlPanelData(yamlData)
    setShowYamlPanel(true)
  }, [])

  const handleCloseYamlPanel = useCallback(() => {
    setShowYamlPanel(false)
  }, [])

  if (!chat || !project) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="hidden lg:block">
          <ChatSidebar
            currentChatId={chatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onNewProject={handleNewProject}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {!project ? "Project Not Found" : "Chat Not Found"}
            </h1>
            <p className="text-gray-600 mb-6">
              {!project 
                ? "The project you're looking for doesn't exist."
                : "The chat you're looking for doesn't exist in this project."
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/')} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-100">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              {project && (
                <Button 
                  onClick={() => router.push(`/project/${projectId}`)}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <ChatSidebar
          currentChatId={chatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />
      </div>
      
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navigation Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              <span className="text-gray-300">/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/project/${projectId}`)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Chat</span>
            </div>
          </div>

          <ChatInterface
            chatId={chatId}
            onClose={handleCloseChat}
            initialPrompt={initialPrompt}
            currentProject={project}
            onYamlGenerated={handleYamlGenerated}
            onInitialPromptUsed={() => {
              // Remove prompt from URL after use
              router.replace(`/project/${projectId}/chat/${chatId}`)
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