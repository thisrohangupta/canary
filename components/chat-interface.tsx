"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Share, RotateCcw, X, Send } from "lucide-react"
import { HarnessResponseCard } from "./harness-response-card"

interface ChatInterfaceProps {
  chatId: string
  onClose: () => void
  initialPrompt?: string | null
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  responseType?: string
  data?: any
}

export function ChatInterface({ chatId, onClose, initialPrompt }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const sendMessage = (prompt: string) => {
    if (!prompt.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: prompt,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsGenerating(true)

    const actionType =
      chatId.includes("new-") && chatId.includes("-chat") ? chatId.replace("new-", "").replace("-chat", "") : undefined

    setTimeout(() => {
      const response = generateDeployableYAML(prompt, actionType)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        responseType: response.type,
        data: response.data,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsGenerating(false)
    }, 1500)
  }

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      sendMessage(initialPrompt)
    }
  }, [initialPrompt])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const generateDeployableYAML = (query: string, actionType?: string) => {
    const lowerQuery = query.toLowerCase()
    const type =
      actionType ||
      (lowerQuery.includes("pipeline") && "pipeline") ||
      (lowerQuery.includes("service") && "service") ||
      (lowerQuery.includes("environment") && "environment") ||
      (lowerQuery.includes("connector") && "connector") ||
      (lowerQuery.includes("cost") && "cost") ||
      (lowerQuery.includes("dashboard") && "dashboard") ||
      (lowerQuery.includes("docs") && "docs") ||
      "general"

    switch (type) {
      case "pipeline":
        return {
          content: "I'll create a deployable CI/CD pipeline. Here's the YAML configuration:",
          type: "pipeline",
          data: {
            pipelineName: "Production Deployment Pipeline",
            stages: ["Build", "Test", "Security Scan", "Deploy"],
            yaml: `pipeline:
  name: Production Deployment Pipeline
  identifier: prod_deployment_pipeline
  projectIdentifier: default_project
  orgIdentifier: default
  tags: {}
  stages:
    - stage:
        name: Build
        identifier: build
        description: ""
        type: CI
        spec:
          cloneCodebase: true
          platform:
            os: Linux
            arch: Amd64
          runtime:
            type: Cloud
            spec: {}
          execution:
            steps:
              - step:
                  type: Run
                  name: Build Application
                  identifier: build_app
                  spec:
                    shell: Bash
                    command: |-
                      echo "Building application..."
                      npm install
                      npm run build
    - stage:
        name: Deploy
        identifier: deploy
        description: ""
        type: Deployment
        spec:
          deploymentType: Kubernetes
          service:
            serviceRef: myapp_service
          environment:
            environmentRef: production
            deployToAll: false
            infrastructureDefinitions:
              - identifier: k8s_infra
          execution:
            steps:
              - step:
                  type: K8sRollingDeploy
                  name: Rolling Deployment
                  identifier: rolling_deploy
                  spec:
                    skipDryRun: false`,
            previewUrl: "/harness-ui-preview/pipeline",
          },
        }
      case "service":
        return {
          content: "I'll create a new Harness service configuration. Here is the YAML:",
          type: "service",
          data: {
            serviceName: "my-microservice",
            serviceType: "Kubernetes",
            artifacts: ["Docker Image"],
            yaml: `service:
  name: my-microservice
  identifier: my_microservice
  serviceDefinition:
    spec:
      manifests:
        - manifest:
            identifier: k8s_manifest
            type: K8sManifest
            spec:
              store:
                type: Git
                spec:
                  connectorRef: github_connector
                  gitFetchType: Branch
                  paths:
                    - k8s/
                  repoName: my-app-repo
                  branch: main
              skipResourceVersioning: false
      artifacts:
        primary:
          primaryArtifactRef: docker_image
          sources:
            - spec:
                connectorRef: docker_hub_connector
                imagePath: myorg/myapp
                tag: <+input>
              identifier: docker_image
              type: DockerRegistry
    type: Kubernetes`,
            previewUrl: "/harness-ui-preview/service",
          },
        }
      case "cost":
        return {
          content: "I'll create a cost analysis perspective for you. Here's your CCM configuration:",
          type: "cost",
          data: {
            perspectiveName: "Multi-Cloud Cost Analysis",
            totalCost: "$12,450",
            savings: "$3,200",
            recommendations: 5,
          },
        }
      case "dashboard":
        return {
          content: "I'll create a custom monitoring dashboard for you:",
          type: "dashboard",
          data: {
            dashboardName: "Application Performance Dashboard",
            widgets: ["CPU Usage", "Memory Usage", "Request Rate", "Error Rate"],
          },
        }
      case "docs":
        return {
          content: "Based on the Harness documentation, here's what I found:",
          type: "docs",
          data: {
            topic: "Pipeline Creation",
            sections: ["Getting Started", "Pipeline Configuration", "Stage Types", "Best Practices"],
          },
        }
      case "environment":
        return {
          content:
            "I'll create an environment configuration for your deployments. This YAML is ready to deploy to Harness:",
          type: "environment",
          data: {
            environmentName: "production",
            environmentType: "Production",
            yaml: `environment:
    name: production
    identifier: production
    description: "Production environment for application deployment"
    tags:
      env: "prod"
      team: "platform"
    type: Production
    orgIdentifier: default
    projectIdentifier: default_project
    variables:
      - name: ENVIRONMENT
        type: String
        value: production
      - name: REPLICAS
        type: String
        value: "3"
    overrides:
      manifests:
        - manifest:
            identifier: values_override
            type: Values
            spec:
              store:
                type: Git
                spec:
                  connectorRef: github_connector
                  gitFetchType: Branch
                  paths:
                    - "values/prod-values.yaml"
                  repoName: my-app-config
                  branch: main`,
            previewUrl: "/harness-ui-preview/environment",
          },
        }
      case "connector":
        return {
          content: "I'll create a connector configuration to integrate with your cloud provider. Here is the YAML:",
          type: "infrastructure", // Connectors are part of infrastructure
          data: {
            resourceType: "AWS Connector",
            environment: "All Environments",
            secrets: ["aws_access_key", "aws_secret_key"],
            yaml: `connector:
    name: aws-production-connector
    identifier: aws_production_connector
    description: "AWS connector for production workloads"
    orgIdentifier: default
    projectIdentifier: default_project
    type: Aws
    spec:
      credential:
        type: ManualConfig
        spec:
          accessKey: <+secrets.getValue("aws_access_key")>
          secretKey: <+secrets.getValue("aws_secret_key")>
      region: us-east-1
      executeOnDelegate: true
      delegateSelectors:
        - "production-delegate"`,
            previewUrl: "/harness-ui-preview/connector",
          },
        }
      default:
        return {
          content: "I can help with Harness pipelines, services, and more. What would you like to do?",
          type: "general",
          data: null,
        }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg">{chatId.replace("new-", "").replace("-chat", "")}</h1>
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
                className={`max-w-3xl rounded-lg p-4 ${
                  message.type === "user" ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                <p className="mb-2 whitespace-pre-wrap">{message.content}</p>
                {message.responseType && message.data && (
                  <HarnessResponseCard responseType={message.responseType} data={message.data} />
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4 max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 ml-2">Canary is thinking...</span>
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
              onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
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
                disabled={!inputValue.trim() || isGenerating}
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
