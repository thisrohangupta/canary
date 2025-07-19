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
import { generateWithGemini } from "@/lib/gemini"
import { chatStorage, Chat, Project, ChatMessage } from "@/lib/chat-storage"

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
    if (!prompt.trim() || isGenerating || processingRef.current) return // Prevent sending if already generating

    processingRef.current = true
    
    const userMessage: Message = {
      id: generateId(),
      type: "user",
      content: prompt,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
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
      "Determining the best Harness configuration approach...",
      "Considering Harness best practices and security...",
      "Structuring the YAML configuration...",
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
      const response = await generateWithGemini(prompt, actionType, conversationHistory, projectContext)
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


  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {currentProject && (
              <>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentProject.color }}
                />
                <span className="text-sm text-gray-400">{currentProject.name}</span>
                <span className="text-gray-600">•</span>
              </>
            )}
            <h1 className="font-semibold text-lg">
              {currentProject ? 'Project Chat' : chatId.replace("new-", "").replace("-chat", "")}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Share className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`${
                  message.type === "user" ? "bg-cyan-600 text-white max-w-3xl rounded-lg p-4" : ""
                }`}
              >
                {message.type === "assistant" ? (
                  <div className="w-full space-y-4">
                    <div className="flex gap-2">
                      {message.usedWebSearch && (
                        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-gray-800 rounded-lg p-3">
                          <Search className="h-3 w-3" />
                          <span>Enhanced with web search</span>
                        </div>
                      )}
                      {messages.indexOf(message) > 0 && (
                        <div className="flex items-center gap-2 text-xs text-green-400 bg-gray-800 rounded-lg p-3">
                          <MessageCircle className="h-3 w-3" />
                          <span>Using conversation context</span>
                        </div>
                      )}
                      {currentProject && (
                        <div className="flex items-center gap-2 text-xs text-purple-400 bg-gray-800 rounded-lg p-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: currentProject.color }}
                          />
                          <span>Using {currentProject.name} project context</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Show thinking stream if thoughts are present */}
                    {message.thoughts && message.thoughts.length > 0 && (
                      <ThinkingStream
                        thoughts={message.thoughts}
                        isThinking={false}
                        isComplete={true}
                      />
                    )}
                    
                    {/* All messages display the same way - YAML will be in right panel */}
                    <div className="bg-gray-800 text-gray-100 rounded-lg p-4 max-w-3xl">
                      <MarkdownRenderer content={message.content} />
                      
                      {/* Show indicator for YAML messages */}
                      {message.data?.yaml && (
                        <>
                          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/20 rounded-lg p-2 border border-cyan-800/30">
                            <Code2 className="h-3 w-3" />
                            <span>Configuration available in right panel</span>
                          </div>
                          <div className="mt-4">
                            <HarnessResponseCard responseType={message.responseType} data={message.data} />
                          </div>
                        </>
                      )}
                      
                      {/* Keep the old response card for non-YAML data */}
                      {message.responseType && 
                       message.data && 
                       !message.data.yaml &&
                       message.responseType !== "general" && (
                        <div className="mt-4">
                          <HarnessResponseCard responseType={message.responseType} data={message.data} />
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
              <div className="w-full space-y-4">
                {/* Live thinking stream */}
                <ThinkingStream
                  thoughts={currentThoughts}
                  isThinking={true}
                  isComplete={false}
                />
                
                <div className="bg-gray-800 rounded-lg p-4 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 ml-2">Canary is generating response...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
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
              placeholder="Ask Canary to build, edit, or explain..."
              className="w-full h-12 pl-4 pr-20 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg h-9 w-9"
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isGenerating || processingRef.current}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
