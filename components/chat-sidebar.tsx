"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  MessageSquare, 
  Folder, 
  Search, 
  MoreHorizontal,
  FolderPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  Trash2,
  Home,
  Rocket,
  GitBranch,
  Building2,
  DollarSign,
  AlertTriangle,
  Flag,
  Shield
} from "lucide-react"
import { chatStorage, Chat, Project, PROJECT_COLORS } from "@/lib/chat-storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatSidebarProps {
  currentChatId?: string
  onChatSelect: (chatId: string) => void
  onNewChat: (actionType?: string, projectId?: string) => void
  onNewProject: () => void
}

export function ChatSidebar({ currentChatId, onChatSelect, onNewChat, onNewProject }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<Chat[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Load data from storage
  useEffect(() => {
    const loadData = () => {
      setChats(chatStorage.getAllChats())
      setProjects(chatStorage.getAllProjects())
    }

    loadData()

    // Listen for storage changes (if multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'canary_chats' || e.key === 'canary_projects') {
        loadData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const unassignedChats = filteredChats.filter(chat => !chat.projectId)

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this chat?')) {
      chatStorage.deleteChat(chatId)
      setChats(chatStorage.getAllChats())
      if (currentChatId === chatId) {
        onNewChat()
      }
    }
  }

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this project? Chats will be moved to unassigned.')) {
      chatStorage.deleteProject(projectId)
      setProjects(chatStorage.getAllProjects())
      setChats(chatStorage.getAllChats())
    }
  }

  const formatChatTitle = (chat: Chat): string => {
    if (chat.title !== 'New Chat') return chat.title
    if (chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(m => m.type === 'user')
      if (firstUserMessage) {
        return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      }
    }
    return chat.actionType ? `New ${chat.actionType} Chat` : 'New Chat'
  }

  const formatTime = (date: Date | string): string => {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown'
    }
    
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

  return (
    <div className="w-80 min-w-64 max-w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Clean Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Simple Canary Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl border border-blue-200">
            <Rocket className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-semibold text-gray-900">Canary</h1>
          </div>
        </div>

        {/* Home Button */}
        {pathname !== '/' && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-gray-900 w-full justify-start hover:bg-gray-50 h-9 px-3 font-medium"
            >
              <Home className="h-4 w-4 mr-3" />
              Home
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-8 w-8 p-0"
              onClick={onNewProject}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-3 text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onNewChat()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  General Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('pipeline')} className="text-sm">
                  <GitBranch className="h-4 w-4 mr-2 text-blue-600" />
                  CI/CD Pipeline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('service')} className="text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                  IDP Service
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('ccm')} className="text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  CCM Cost Optimization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('incident')} className="text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  IR Incident Response
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('environment')} className="text-sm">
                  Environment Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewChat('connector')} className="text-sm">
                  Connector Configuration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="pl-10 h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-300 focus:ring-0 rounded-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Projects */}
          {projects.map(project => {
            const projectChats = filteredChats.filter(chat => chat.projectId === project.id)
            const isExpanded = expandedProjects.has(project.id)
            
            return (
              <div key={project.id} className="space-y-1">
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                  onClick={(e) => {
                    if (e.detail === 2) {
                      // Double click - navigate to project
                      router.push(`/project/${project.id}`)
                    } else {
                      // Single click - toggle expansion
                      toggleProjectExpansion(project.id)
                    }
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <Folder className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 truncate flex-1">
                    {project.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {projectChats.length}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/project/${project.id}`)}>
                        <Folder className="h-4 w-4 mr-2" />
                        Open Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNewChat(undefined, project.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat in Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project Chats */}
                {isExpanded && projectChats.map(chat => (
                  <div
                    key={chat.id}
                    className={`ml-8 p-3 rounded-lg cursor-pointer group transition-colors ${
                      currentChatId === chat.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (chat.projectId) {
                        router.push(`/project/${chat.projectId}/chat/${chat.id}`)
                      } else {
                        router.push(`/chat/${chat.id}`)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className={`text-sm font-medium leading-tight ${
                          currentChatId === chat.id ? 'text-white' : 'text-gray-900'
                        } break-words whitespace-normal`}>
                          {formatChatTitle(chat)}
                        </p>
                        <p className={`text-xs mt-1 ${
                          currentChatId === chat.id ? 'text-gray-300' : 'text-gray-500'
                        } break-words whitespace-normal`}>
                          {formatTime(chat.updatedAt)} • {chat.messages.length} messages
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`opacity-0 group-hover:opacity-100 h-6 w-6 p-0 flex-shrink-0 hover:bg-red-50 hover:text-red-600 ${
                          currentChatId === chat.id ? 'text-gray-400 hover:text-red-400' : 'text-gray-400'
                        }`}
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Unassigned Chats */}
          {unassignedChats.length > 0 && (
            <div className="space-y-1">
              {projects.length > 0 && (
                <div className="flex items-center gap-2 p-3 mt-4">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2">Recent Chats</span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              )}
              {unassignedChats.slice(0, 15).map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer group transition-colors ${
                    currentChatId === chat.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (chat.projectId) {
                      router.push(`/project/${chat.projectId}/chat/${chat.id}`)
                    } else {
                      router.push(`/chat/${chat.id}`)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className={`text-sm font-medium leading-tight ${
                        currentChatId === chat.id ? 'text-white' : 'text-gray-900'
                      } break-words whitespace-normal`}>
                        {formatChatTitle(chat)}
                      </p>
                      <p className={`text-xs mt-1 ${
                        currentChatId === chat.id ? 'text-gray-300' : 'text-gray-500'
                      } break-words whitespace-normal`}>
                        {formatTime(chat.updatedAt)} • {chat.messages.length} messages
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`opacity-0 group-hover:opacity-100 h-6 w-6 p-0 flex-shrink-0 hover:bg-red-50 hover:text-red-600 ${
                        currentChatId === chat.id ? 'text-gray-400 hover:text-red-400' : 'text-gray-400'
                      }`}
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredChats.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-900 text-sm font-medium mb-1">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </p>
              <p className="text-gray-500 text-xs">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}