"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Maximize2, Minimize2, Check } from "lucide-react"
import dynamic from "next/dynamic"

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then((mod) => mod.Prism), {
  ssr: false
})

import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface YamlCanvasProps {
  title: string
  description: string
  yaml: string
  metadata?: {
    stages?: string[]
    resourceType?: string
    environment?: string
  }
}

export function YamlCanvas({ title, description, yaml, metadata }: YamlCanvasProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`border border-gray-200 rounded-xl bg-white shadow-lg ${
      isExpanded ? "fixed inset-4 z-50" : "w-full"
    } transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {metadata && (
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              {metadata.resourceType && (
                <span>Type: {metadata.resourceType}</span>
              )}
              {metadata.environment && (
                <span>Environment: {metadata.environment}</span>
              )}
              {metadata.stages && metadata.stages.length > 0 && (
                <span>Stages: {metadata.stages.join(", ")}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="ml-2">Download</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span className="ml-2">Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span className="ml-2">Expand</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* YAML Content */}
      <ScrollArea className={isExpanded ? "h-[calc(100vh-8rem)]" : "h-96"}>
        <div className="p-0">
          <SyntaxHighlighter
            language="yaml"
            style={oneLight as any}
            customStyle={{
              margin: 0,
              background: "#fafafa",
              fontSize: "14px",
              lineHeight: "1.6",
              fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace",
            }}
            showLineNumbers={true}
            wrapLines={true}
            lineNumberStyle={{
              color: "#9ca3af",
              backgroundColor: "#f9fafb",
              paddingLeft: "12px",
              paddingRight: "12px",
              borderRight: "1px solid #e5e7eb",
              minWidth: "48px",
            }}
          >
            {yaml}
          </SyntaxHighlighter>
        </div>
      </ScrollArea>

      {/* Footer with metadata */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="font-medium">{yaml.split('\n').length} lines</span>
          <span className="font-medium">YAML Configuration</span>
        </div>
      </div>
    </div>
  )
}