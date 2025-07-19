"use client"

import { useState, useEffect } from "react"
import { YamlCanvas } from "./yaml-canvas"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YamlPanelProps {
  yamlData?: {
    title: string
    description: string
    yaml: string
    metadata?: any
  } | null
  isVisible: boolean
  onClose: () => void
}

export function YamlPanel({ yamlData, isVisible, onClose }: YamlPanelProps) {
  if (!isVisible) return null

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Configuration</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {yamlData ? (
          <div className="h-full">
            <YamlCanvas
              title={yamlData.title}
              description={yamlData.description}
              yaml={yamlData.yaml}
              metadata={yamlData.metadata}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <Code2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No Configuration Available
              </h3>
              <p className="text-gray-500 text-sm">
                Ask Canary to generate a Harness configuration to see it here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}