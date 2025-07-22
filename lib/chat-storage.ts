export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  responseType?: string
  data?: any
  usedWebSearch?: boolean
  thoughts?: string[]
}

export interface Chat {
  id: string
  title: string
  projectId?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  actionType?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  createdAt: Date
  updatedAt: Date
  chatIds: string[]
}

class ChatStorageManager {
  private readonly CHATS_KEY = 'canary_chats'
  private readonly PROJECTS_KEY = 'canary_projects'
  private readonly MAX_CHATS = 30

  // Chat Management
  saveChat(chat: Chat): void {
    const chats = this.getAllChats()
    const existingIndex = chats.findIndex(c => c.id === chat.id)
    
    if (existingIndex >= 0) {
      chats[existingIndex] = { ...chat, updatedAt: new Date() }
    } else {
      chats.unshift({ ...chat, createdAt: new Date(), updatedAt: new Date() })
    }

    // Keep only the last 30 chats
    if (chats.length > this.MAX_CHATS) {
      const removedChats = chats.splice(this.MAX_CHATS)
      // Update projects to remove deleted chat references
      removedChats.forEach(removedChat => {
        if (removedChat.projectId) {
          this.removeChatFromProject(removedChat.projectId, removedChat.id)
        }
      })
    }

    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats, this.dateReplacer))
  }

  getChat(chatId: string): Chat | null {
    const chats = this.getAllChats()
    return chats.find(chat => chat.id === chatId) || null
  }

  getAllChats(): Chat[] {
    const stored = localStorage.getItem(this.CHATS_KEY)
    if (!stored) return []
    
    try {
      const chats = JSON.parse(stored, this.dateReviver)
      // Ensure dates are Date objects
      return chats.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch {
      return []
    }
  }

  deleteChat(chatId: string): void {
    const chats = this.getAllChats().filter(chat => chat.id !== chatId)
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats, this.dateReplacer))
    
    // Remove from project if it belongs to one
    const chat = this.getChat(chatId)
    if (chat?.projectId) {
      this.removeChatFromProject(chat.projectId, chatId)
    }
  }

  getRecentChats(limit: number = 10): Chat[] {
    return this.getAllChats()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit)
  }

  // Project Management
  saveProject(project: Project): void {
    const projects = this.getAllProjects()
    const existingIndex = projects.findIndex(p => p.id === project.id)
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date() }
    } else {
      projects.push({ ...project, createdAt: new Date(), updatedAt: new Date() })
    }

    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects, this.dateReplacer))
  }

  getProject(projectId: string): Project | null {
    const projects = this.getAllProjects()
    return projects.find(project => project.id === projectId) || null
  }

  getAllProjects(): Project[] {
    const stored = localStorage.getItem(this.PROJECTS_KEY)
    if (!stored) return []
    
    try {
      const projects = JSON.parse(stored, this.dateReviver)
      // Ensure dates are Date objects
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      }))
    } catch {
      return []
    }
  }

  deleteProject(projectId: string): void {
    // Move all chats in this project to unassigned
    const chats = this.getAllChats()
    chats.forEach(chat => {
      if (chat.projectId === projectId) {
        this.saveChat({ ...chat, projectId: undefined })
      }
    })

    // Delete the project
    const projects = this.getAllProjects().filter(project => project.id !== projectId)
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects, this.dateReplacer))
  }

  addChatToProject(projectId: string, chatId: string): void {
    const project = this.getProject(projectId)
    const chat = this.getChat(chatId)
    
    if (project && chat) {
      // Remove chat from old project if it has one
      if (chat.projectId && chat.projectId !== projectId) {
        this.removeChatFromProject(chat.projectId, chatId)
      }

      // Add to new project
      if (!project.chatIds.includes(chatId)) {
        project.chatIds.push(chatId)
        this.saveProject(project)
      }

      // Update chat
      this.saveChat({ ...chat, projectId })
    }
  }

  removeChatFromProject(projectId: string, chatId: string): void {
    const project = this.getProject(projectId)
    if (project) {
      project.chatIds = project.chatIds.filter(id => id !== chatId)
      this.saveProject(project)
    }

    const chat = this.getChat(chatId)
    if (chat && chat.projectId === projectId) {
      this.saveChat({ ...chat, projectId: undefined })
    }
  }

  getProjectChats(projectId: string): Chat[] {
    const project = this.getProject(projectId)
    if (!project) return []

    const allChats = this.getAllChats()
    return project.chatIds
      .map(chatId => allChats.find(chat => chat.id === chatId))
      .filter((chat): chat is Chat => chat !== undefined)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  getUnassignedChats(): Chat[] {
    return this.getAllChats().filter(chat => !chat.projectId)
  }

  // Project Context: Get all messages from all chats in a project
  getProjectContext(projectId: string): ChatMessage[] {
    const projectChats = this.getProjectChats(projectId)
    const allMessages: ChatMessage[] = []

    projectChats.forEach(chat => {
      allMessages.push(...chat.messages)
    })

    // Sort by timestamp and return last 20 messages for context
    return allMessages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-20)
  }

  // Utility methods for Date serialization
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() }
    }
    return value
  }

  private dateReviver(key: string, value: any): any {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value)
    }
    return value
  }

  // Generate unique IDs
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const chatStorage = new ChatStorageManager()

// Predefined project colors
export const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1'  // Indigo
]
