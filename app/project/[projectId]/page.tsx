"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { NewProjectModal } from "@/components/new-project-modal"
import { chatStorage, Project, Chat } from "@/lib/chat-storage"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Plus, MessageSquare, Users, Calendar, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [projectChats, setProjectChats] = useState<Chat[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  // Load project and chats
  useEffect(() => {
    if (projectId) {
      const loadedProject = chatStorage.getProject(projectId)
      setProject(loadedProject)
      
      if (loadedProject) {
        const chats = chatStorage.getProjectChats(projectId)
        setProjectChats(chats)
      }
    }
  }, [projectId])

  const handleChatSelect = useCallback((chatId: string) => {
    router.push(`/project/${projectId}/chat/${chatId}`)
  }, [router, projectId])

  const handleNewChat = useCallback((actionType?: string, newProjectId?: string) => {
    const targetProjectId = newProjectId || projectId
    const newChat = {
      id: chatStorage.generateId(),
      title: 'New Chat',
      projectId: targetProjectId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      actionType
    }

    chatStorage.saveChat(newChat)
    chatStorage.addChatToProject(targetProjectId, newChat.id)
    router.push(`/project/${targetProjectId}/chat/${newChat.id}`)
  }, [router, projectId])

  const handleNewProject = useCallback(() => {
    setShowNewProjectModal(true)
  }, [])

  const handleProjectCreated = useCallback((newProjectId: string) => {
    router.push(`/project/${newProjectId}`)
  }, [router])

  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return 'Unknown'
    
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return dateObj.toLocaleDateString()
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-gray-950">
        <ChatSidebar
          onChatSelect={(chatId) => router.push(`/chat/${chatId}`)}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
            <p className="text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
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
        onChatSelect={(chatId) => router.push(`/chat/${chatId}`)}
        onNewChat={handleNewChat}
        onNewProject={handleNewProject}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Navigation Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
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
            <span className="text-gray-600">/</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-white font-medium">{project.name}</span>
            </div>
          </div>
        </div>

        {/* Project Dashboard */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Project Header */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                    {project.description && (
                      <p className="text-gray-400 text-lg mb-4">{project.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{projectChats.length} chats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatTime(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleNewChat()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
            </div>

            {/* Project Chats */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Chats</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNewChat()}
                  className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>

              {projectChats.length > 0 ? (
                <div className="grid gap-4">
                  {projectChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat.id)}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors border border-gray-700 hover:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">
                            {chat.title === 'New Chat' && chat.messages.length > 0
                              ? chat.messages.find(m => m.type === 'user')?.content.slice(0, 60) + '...'
                              : chat.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{chat.messages.length} messages</span>
                            <span>Updated {formatTime(chat.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="text-gray-500">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No chats yet</h3>
                  <p className="text-gray-500 mb-6">Start a conversation in this project</p>
                  <Button
                    onClick={() => handleNewChat()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
