/**
 * CANARY CHAT INTERFACE
 * 
 * This is the main chat component of the Canary application - an AI-powered assistant
 * specialized for Harness platform operations. It provides:
 * 
 * 1. Real-time chat with Google Gemini 2.0 AI
 * 2. YAML file upload and analysis capabilities  
 * 3. Automatic detection of Harness configurations (pipelines, services, etc.)
 * 4. One-click deployment to Harness platform via API
 * 5. Persistent chat history with browser storage
 * 6. Project-based organization of conversations
 * 
 * Key Features Demonstrated:
 * - AI-powered DevOps assistance
 * - File processing and analysis
 * - API integrations (Gemini AI + Harness)
 * - Real-time UI updates
 * - Professional chat interface
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Share, RotateCcw, X, Send, Search, MessageCircle, Code2 } from "lucide-react"

// Core functionality imports
import { generateWithGemini } from "@/lib/gemini"
import { chatStorage, Chat, Project, ChatMessage } from "@/lib/chat-storage"
import { detectHarnessYamlsInContent } from "@/lib/yaml-detector"

// UI Components for rendering different types of content
import { MarkdownRenderer } from "./markdown-renderer"
import { ThinkingStream } from "./thinking-stream"
import { HarnessResponseCard } from "./harness-response-card"
import { HarnessDeployButton } from "./harness-deploy-button"

// Props interface - defines what data this component needs
interface ChatInterfaceProps {
  chatId: string                           // Unique identifier for this chat session
  onClose: () => void                      // Function to call when user closes chat
  initialPrompt?: string | null            // Optional starting prompt for new chats
  currentProject?: Project | null          // Project context (if chat is within a project)
  onYamlGenerated?: (yamlData: any) => void // Callback when AI generates YAML configs
  onInitialPromptUsed?: () => void         // Callback when initial prompt is processed
}

// Extended message interface for local state management
interface Message extends ChatMessage {
  // Additional properties for UI state can be added here
}

export function ChatInterface({ 
  chatId, 
  onClose, 
  initialPrompt, 
  currentProject, 
  onYamlGenerated, 
  onInitialPromptUsed 
}: ChatInterfaceProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])           // All messages in current chat
  const [inputValue, setInputValue] = useState("")                 // Current user input
  const [isGenerating, setIsGenerating] = useState(false)          // Whether AI is processing
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([]) // AI thinking process
  
  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<Array<{
    name: string,     // File name (e.g., "pipeline.yaml")
    content: string,  // File content as text
    type: string      // MIME type (e.g., "text/yaml")
  }>>([])
  
  // Refs for DOM elements and counters
  const messageCounterRef = useRef(0)            // Counter for unique message IDs
  const fileInputRef = useRef<HTMLInputElement>(null) // Hidden file input element
  const scrollAreaRef = useRef<HTMLDivElement>(null)  // Chat scroll container
  const processingRef = useRef(false)            // Prevents duplicate API calls
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  // Generate unique message IDs
  const generateId = useCallback(() => {
    const id = `msg-${chatId}-${messageCounterRef.current}-${Date.now()}`
    messageCounterRef.current += 1
    return id
  }, [chatId])
  
  // ============================================================================
  // CHAT LOADING & PERSISTENCE
  // ============================================================================
  
  // Load existing chat messages when component mounts or chatId changes
  useEffect(() => {
    messageCounterRef.current = 0
    const chat = chatStorage.getChat(chatId)
    
    if (chat) {
      // Load existing messages and ensure timestamps are Date objects
      setMessages(chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })))
    } else {
      // New chat - start with empty messages
      setMessages([])
    }
  }, [chatId])
  
  // ============================================================================
  // MAIN CHAT FUNCTIONALITY
  // ============================================================================
  
  // Send message to AI and handle response
  const sendMessage = useCallback(async (prompt: string) => {
    // Prevent multiple simultaneous API calls
    if ((!prompt.trim() && attachedFiles.length === 0) || isGenerating || processingRef.current) {
      return
    }
    
    processingRef.current = true
    
    // Prepare the full prompt including any attached files
    let fullPrompt = prompt
    if (attachedFiles.length > 0) {
      fullPrompt += "\n\n📎 **Attached YAML Files for Analysis:**\n"
      attachedFiles.forEach((file, index) => {
        fullPrompt += `\n### File ${index + 1}: ${file.name}\n\`\`\`yaml\n${file.content}\n\`\`\`\n`
      })
      fullPrompt += "\n**Please analyze these YAML files and provide feedback, suggestions, or answer my question based on their content.**"
    }
    
    // Create user message object
    const userMessage: Message = {
      id: generateId(),
      type: "user",
      content: fullPrompt,
      timestamp: new Date(),
    }
    
    // Update UI immediately with user message
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setAttachedFiles([])
    setIsGenerating(true)
    setCurrentThoughts([])
    
    // Save user message to browser storage
    const chat = chatStorage.getChat(chatId)
    if (chat) {
      chatStorage.saveChat({ ...chat, messages: newMessages })
    }
    
    // Show AI thinking process with progressive updates
    const thinkingSteps = [
      "Analyzing your Harness request...",
      attachedFiles.length > 0 ? "Processing attached YAML files..." : "Determining the best approach...",
      attachedFiles.length > 0 ? "Validating YAML structure..." : "Considering Harness best practices...",
      "Finalizing the response..."
    ]
    
    // Add conversation context for better responses
    if (messages.length > 0) {
      thinkingSteps.unshift("Reviewing conversation history...")
    }
    
    // Display thinking steps progressively
    thinkingSteps.forEach((thought, index) => {
      setTimeout(() => {
        setCurrentThoughts(prev => [...prev, thought])
      }, index * 800) // 800ms delay between each step
    })
    
    // Determine action type for specialized responses
    const actionType = chatId.includes("new-") && chatId.includes("-chat") 
      ? chatId.replace("new-", "").replace("-chat", "") 
      : undefined
    
    // Build conversation history for context
    const conversationHistory = newMessages.map(msg => ({
      role: msg.type === "user" ? "user" as const : "assistant" as const,
      content: msg.content
    }))
    
    // Get project context if this chat is within a project
    let projectContext: any[] = []
    if (currentProject) {
      const projectMessages = chatStorage.getProjectContext(currentProject.id)
      projectContext = projectMessages.map(msg => ({
        role: msg.type === "user" ? "user" as const : "assistant" as const,
        content: msg.content
      }))
    }
    
    try {
      // Call the AI API with full context
      const response = await generateWithGemini(fullPrompt, actionType, conversationHistory, projectContext)
      
      // Create AI response message
      const assistantMessage: Message = {
        id: generateId(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        responseType: response.type,
        data: response.data,
        usedWebSearch: response.usedWebSearch,
        thoughts: response.thoughts,
      }
      
      // Update UI with AI response
      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)
      
      // Notify parent component if YAML was generated
      if (response.data?.yaml && onYamlGenerated) {
        onYamlGenerated(response.data)
      }
      
      // Save AI response to storage and update chat title if needed
      const updatedChat = chatStorage.getChat(chatId)
      if (updatedChat) {
        const chatTitle = updatedChat.title === 'New Chat' && finalMessages.length > 0
          ? prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')
          : updatedChat.title
        
        chatStorage.saveChat({ 
          ...updatedChat, 
          messages: finalMessages,
          title: chatTitle
        })
      }
      
    } catch (error) {
      console.error("Error generating response:", error)
      
      // Show error message to user
      const errorMessage: Message = {
        id: generateId(),
        type: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        responseType: "error",
        data: null,
      }
      setMessages(prev => [...prev, errorMessage])
      
    } finally {
      // Reset UI state
      setIsGenerating(false)
      setCurrentThoughts([])
      processingRef.current = false
    }
  }, [attachedFiles, isGenerating, messages, generateId, chatId, currentProject, onYamlGenerated])
  
  // ============================================================================
  // INITIAL PROMPT HANDLING
  // ============================================================================
  
  // Process initial prompt when component loads
  useEffect(() => {
    if (initialPrompt && messages.length === 0 && !isGenerating) {
      sendMessage(initialPrompt)
      onInitialPromptUsed?.() // Clear the initial prompt from parent
    }
  }, [initialPrompt, messages.length, isGenerating, onInitialPromptUsed, sendMessage])
  
  // ============================================================================
  // AUTO-SCROLL FUNCTIONALITY
  // ============================================================================
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])
  
  // ============================================================================
  // FILE UPLOAD FUNCTIONALITY
  // ============================================================================
  
  // Trigger file picker
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])
  
  // Process selected files
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    
    Array.from(files).forEach(file => {
      // Only allow YAML files
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
        alert('Only .yaml and .yml files are supported')
        return
      }
      
      // Read file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setAttachedFiles(prev => [
          ...prev,
          {
            name: file.name,
            content: content,
            type: file.type || 'text/yaml'
          }
        ])
      }
      reader.readAsText(file)
    })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])
  
  // Remove attached file
  const removeAttachedFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])
  
  // ============================================================================
  // RENDER UI
  // ============================================================================
  
  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      
      {/* ============================================= */}
      {/* HEADER BAR - Clean Light Mode */}
      {/* ============================================= */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          
          {/* Left side - Close button and simple branding */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              {/* Simple Canary Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <h1 className="font-semibold text-lg text-gray-900">Canary</h1>
                </div>
              </div>
              
              {/* Project indicator (if in project context) */}
              {currentProject && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentProject.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{currentProject.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - Clean action buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 px-3 hidden sm:flex"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 px-3"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      {/* ============================================= */}
      {/* MESSAGES AREA */}
      {/* ============================================= */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-8 bg-gray-50" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-8 w-full">
          
          {/* Render each message */}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={message.type === "user" 
                ? "bg-gray-900 text-white max-w-2xl w-fit ml-auto rounded-xl px-5 py-3 shadow-sm" 
                : "w-full"
              }>
                
                {/* USER MESSAGE */}
                {message.type === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                ) : (
                  /* AI MESSAGE */
                  <div className="w-full space-y-6">
                    
                    {/* Context indicators */}
                    {(message.usedWebSearch || messages.indexOf(message) > 0 || currentProject) && (
                      <div className="flex flex-wrap gap-2">
                        {message.usedWebSearch && (
                          <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                            <Search className="h-3 w-3" />
                            <span className="font-medium">Enhanced with web search</span>
                          </div>
                        )}
                        
                        {messages.indexOf(message) > 0 && (
                          <div className="inline-flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                            <MessageCircle className="h-3 w-3" />
                            <span className="font-medium">Using conversation context</span>
                          </div>
                        )}
                        
                        {currentProject && (
                          <div className="inline-flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: currentProject.color }}
                            />
                            <span className="font-medium">Using {currentProject.name} project context</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* AI thinking process */}
                    {message.thoughts && message.thoughts.length > 0 && (
                      <ThinkingStream
                        thoughts={message.thoughts}
                        isThinking={false}
                        isComplete={true}
                      />
                    )}
                    
                    {/* Main message content */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <MarkdownRenderer content={message.content} />
                      
                      {/* YAML Detection & Deploy Buttons */}
                      {!message.data?.yaml && (() => {
                        const harnessYamls = detectHarnessYamlsInContent(message.content)
                        if (harnessYamls.length > 0) {
                          return (
                            <div className="mt-6 space-y-4">
                              <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                                <Code2 className="h-3 w-3" />
                                <span className="font-medium">Harness configuration detected</span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {harnessYamls.map((yamlInfo, index) => (
                                  <HarnessDeployButton key={index} yamlInfo={yamlInfo} />
                                ))}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })()}
                      
                      {/* Structured YAML responses */}
                      {message.data?.yaml && (
                        <>
                          <div className="mt-4 inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                            <Code2 className="h-3 w-3" />
                            <span className="font-medium">Configuration available in right panel</span>
                          </div>
                          <div className="mt-4">
                            <HarnessResponseCard responseType={message.responseType || 'general'} data={message.data} />
                          </div>
                        </>
                      )}
                      
                      {/* Other response types */}
                      {message.responseType && 
                       message.data && 
                       !message.data.yaml &&
                       message.responseType !== "general" && (
                        <div className="mt-4">
                          <HarnessResponseCard responseType={message.responseType || 'general'} data={message.data} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading state while AI is generating */}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="w-full space-y-6">
                {/* Live thinking stream */}
                <ThinkingStream
                  thoughts={currentThoughts}
                  isThinking={true}
                  isComplete={false}
                />
                
                {/* Typing indicator */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Canary is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* ============================================= */}
      {/* INPUT AREA */}
      {/* ============================================= */}
      <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Attached files display */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-900">{file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      onClick={() => removeAttachedFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {attachedFiles.length} YAML file{attachedFiles.length > 1 ? 's' : ''} attached
              </p>
            </div>
          )}
          
          {/* Input field with controls */}
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isGenerating && !processingRef.current) {
                  e.preventDefault()
                  sendMessage(inputValue)
                }
              }}
              placeholder="Ask about CI/CD pipelines, IDP services, CCM cost optimization, IR incident workflows, or any Harness configurations... (Attach .yaml/.yml files with 📎)"
              className="w-full h-12 sm:h-14 pl-4 sm:pl-6 pr-20 sm:pr-24 bg-white border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            />
            
            {/* Input controls */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {/* File upload button */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleFileSelect}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Send button */}
              <Button
                size="icon"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-9 w-9 shadow-sm transition-all duration-200 disabled:opacity-50"
                onClick={() => sendMessage(inputValue)}
                disabled={(!inputValue.trim() && attachedFiles.length === 0) || isGenerating || processingRef.current}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced help text */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Generate CI/CD pipelines, IDP services, CCM policies, IR workflows, environments, and infrastructure configurations • Press Enter to send • Attach .yaml/.yml files with 📎
          </div>
        </div>
      </div>
    </div>
  )
}