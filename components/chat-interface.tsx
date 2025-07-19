"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Share, RotateCcw, X, Send, Search, MessageCircle, Code2 } from "lucide-react"
import { HarnessResponseCard } from "./harness-response-card"
import { MarkdownRenderer } from "./markdown-renderer"
import { YamlCanvas } from "./yaml-canvas"
import { ThinkingStream } from "./thinking-stream"
import { HarnessDeployButton } from "./harness-deploy-button"
import { generateWithGemini } from "@/lib/gemini"
import { chatStorage, Chat, Project, ChatMessage } from "@/lib/chat-storage"
import { detectHarnessYamlsInContent } from "@/lib/yaml-detector"

interface ChatInterfaceProps {
  chatId: string
  onClose: () => void
  initialPrompt?: string | null
  currentProject?: Project | null
  onYamlGenerated?: (yamlData: any) => void
  onInitialPromptUsed?: () => void
}

// Use the ChatMessage interface from storage, extend it with local-only properties
interface Message extends ChatMessage {
  // Local display properties can be added here if needed
}

export function ChatInterface({ chatId, onClose, initialPrompt, currentProject, onYamlGenerated, onInitialPromptUsed }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentThoughts, setCurrentThoughts] = useState<string[]>([])
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string, content: string, type: string}>>([])
  const messageCounterRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef(false)

  const generateId = useCallback(() => {
    const id = `msg-${chatId}-${messageCounterRef.current}-${Date.now()}`
    messageCounterRef.current += 1
    return id
  }, [chatId])

  // Load chat messages when chatId changes
  useEffect(() => {
    messageCounterRef.current = 0
    const chat = chatStorage.getChat(chatId)
    if (chat) {
      setMessages(chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp) // Ensure dates are Date objects
      })))
    } else {
      setMessages([])
    }
  }, [chatId])

  const sendMessage = async (prompt: string) => {
    if ((!prompt.trim() && attachedFiles.length === 0) || isGenerating || processingRef.current) return // Prevent sending if already generating
    
    // Combine prompt with attached files
    let fullPrompt = prompt
    if (attachedFiles.length > 0) {
      fullPrompt += "\n\n📎 **Attached YAML Files for Analysis:**\n"
      attachedFiles.forEach((file, index) => {
        fullPrompt += `\n### File ${index + 1}: ${file.name}\n\`\`\`yaml\n${file.content}\n\`\`\`\n`
      })
      fullPrompt += "\n**Please analyze these YAML files and provide feedback, suggestions, or answer my question based on their content.**"
    }

    processingRef.current = true
    
    const userMessage: Message = {
      id: generateId(),
      type: "user",
      content: fullPrompt,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setAttachedFiles([])
    setIsGenerating(true)
    setCurrentThoughts([])

    // Save user message to storage
    const chat = chatStorage.getChat(chatId)
    if (chat) {
      chatStorage.saveChat({ ...chat, messages: newMessages })
    }
    
    // Simulate progressive thinking
    const baseThinkingSteps = [
      "Analyzing the Harness request...",
      attachedFiles.length > 0 ? "Processing attached YAML files..." : "Determining the best Harness configuration approach...",
      attachedFiles.length > 0 ? "Validating YAML structure and Harness syntax..." : "Considering Harness best practices and security...",
      attachedFiles.length > 0 ? "Identifying potential improvements and best practices..." : "Structuring the YAML configuration...",
      "Finalizing the response..."
    ]
    
    const thinkingSteps = messages.length > 0 
      ? ["Reviewing conversation history...", ...baseThinkingSteps]
      : baseThinkingSteps
    
    // Add thoughts progressively during generation
    thinkingSteps.forEach((thought, index) => {
      setTimeout(() => {
        setCurrentThoughts(prev => [...prev, thought])
      }, index * 800)
    })

    const actionType =
      chatId.includes("new-") && chatId.includes("-chat") ? chatId.replace("new-", "").replace("-chat", "") : undefined

    // Build conversation history from current messages
    const conversationHistory = newMessages.map(msg => ({
      role: msg.type === "user" ? "user" as const : "assistant" as const,
      content: msg.content
    }))

    // Get project context if in a project
    let projectContext: any[] = []
    if (currentProject) {
      const projectMessages = chatStorage.getProjectContext(currentProject.id)
      projectContext = projectMessages.map(msg => ({
        role: msg.type === "user" ? "user" as const : "assistant" as const,
        content: msg.content
      }))
    }

    try {
      const response = await generateWithGemini(fullPrompt, actionType, conversationHistory, projectContext)
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
      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Notify parent about YAML generation
      if (response.data?.yaml && onYamlGenerated) {
        onYamlGenerated(response.data)
      }

      // Save assistant message to storage
      const updatedChat = chatStorage.getChat(chatId)
      if (updatedChat) {
        // Update chat title if it's still "New Chat"
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
      const errorMessage: Message = {
        id: generateId(),
        type: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        responseType: "error",
        data: null,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      setCurrentThoughts([])
      processingRef.current = false
    }
  }

  useEffect(() => {
    if (initialPrompt && messages.length === 0 && !isGenerating) {
      sendMessage(initialPrompt)
      onInitialPromptUsed?.() // Clear the initial prompt from parent
    }
  }, [initialPrompt, messages.length, isGenerating, onInitialPromptUsed])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      // Check if file is YAML
      if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
        alert('Only .yaml and .yml files are supported')
        return
      }

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
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
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
              {currentProject && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentProject.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">{currentProject.name}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                </>
              )}
              <h1 className="font-semibold text-lg text-gray-900">
                {currentProject ? 'Project Chat' : 'Harness Assistant'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 px-3"
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

      <ScrollArea className="flex-1 px-4 sm:px-6 py-8 bg-gray-50" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-8 w-full">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`${
                  message.type === "user" 
                    ? "bg-gray-900 text-white max-w-2xl w-fit ml-auto rounded-xl px-5 py-3 shadow-sm" 
                    : "w-full"
                }`}
              >
                {message.type === "assistant" ? (
                  <div className="w-full space-y-6">
                    {/* Context badges */}
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
                    
                    {/* Show thinking stream if thoughts are present */}
                    {message.thoughts && message.thoughts.length > 0 && (
                      <ThinkingStream
                        thoughts={message.thoughts}
                        isThinking={false}
                        isComplete={true}
                      />
                    )}
                    
                    {/* Message content */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <MarkdownRenderer content={message.content} />
                      
                      {/* Detect and show deploy buttons for Harness YAML - only if no structured data */}
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
                      
                      {/* Show indicator for YAML messages */}
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
                      
                      {/* Keep the old response card for non-YAML data */}
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
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="w-full space-y-6">
                {/* Live thinking stream */}
                <ThinkingStream
                  thoughts={currentThoughts}
                  isThinking={true}
                  isComplete={false}
                />
                
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

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* Show attached files */}
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
              placeholder="Ask Canary about Harness pipelines, deployments, or configurations... (Attach .yaml/.yml files with the paperclip icon)"
              className="w-full h-12 sm:h-14 pl-4 sm:pl-6 pr-20 sm:pr-24 bg-white border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleFileSelect}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
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
          <div className="mt-3 text-xs text-gray-500 text-center">
            Canary can generate pipelines, services, connectors, environments, and infrastructure configurations for Harness • Press Enter to send • Attach .yaml/.yml files with 📎
          </div>
        </div>
      </div>
    </div>
  )
}
