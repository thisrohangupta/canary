"use client"

import { useEffect, useState } from "react"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThinkingStreamProps {
  thoughts: string[]
  isThinking: boolean
  isComplete: boolean
}

export function ThinkingStream({ thoughts, isThinking, isComplete }: ThinkingStreamProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [displayedThoughts, setDisplayedThoughts] = useState<string[]>([])
  
  // Animate thoughts appearing one by one
  useEffect(() => {
    if (thoughts.length > displayedThoughts.length) {
      const timer = setTimeout(() => {
        setDisplayedThoughts(prev => [...prev, thoughts[prev.length]])
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [thoughts, displayedThoughts])

  if (thoughts.length === 0 && !isThinking) return null

  return (
    <div className="mb-4 border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <Brain 
            className={`h-4 w-4 text-blue-600 ${isThinking ? 'animate-pulse' : ''}`} 
          />
          <span className="text-sm font-medium text-blue-900">
            {isThinking ? "Canary is thinking..." : isComplete ? "Thinking complete" : "Thoughts"}
          </span>
          {displayedThoughts.length > 0 && (
            <span className="text-xs text-blue-600">
              ({displayedThoughts.length} {displayedThoughts.length === 1 ? 'thought' : 'thoughts'})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
          {displayedThoughts.map((thought, index) => (
            <div
              key={index}
              className="text-sm text-blue-800 animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-blue-600 mr-2">•</span>
              {thought}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex items-center gap-2 text-blue-700">
              <span className="text-blue-600">•</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}