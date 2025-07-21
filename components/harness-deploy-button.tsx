"use client"

import { useState, memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react"
import { HarnessYamlInfo } from "@/lib/yaml-detector"
import { createHarnessClient, DeploymentResult } from "@/lib/harness-api"
import { toast } from "sonner"

interface HarnessDeployButtonProps {
  yamlInfo: HarnessYamlInfo
}

export const HarnessDeployButton = memo(function HarnessDeployButton({ yamlInfo }: HarnessDeployButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null)
  
  // Form state - ensure defaults match Harness patterns
  const [identifier, setIdentifier] = useState(() => {
    const id = yamlInfo.identifier || ""
    // Clean identifier to match Harness pattern: ^[a-zA-Z_][0-9a-zA-Z_$]{0,127}$
    return id.replace(/[^a-zA-Z0-9_$]/g, '_').substring(0, 127) || "pipeline_1"
  })
  const [name, setName] = useState(() => {
    const nm = yamlInfo.name || ""
    // Clean name to match Harness pattern: ^[a-zA-Z_][0-9a-zA-Z-_ ]{0,127}$
    return nm.substring(0, 127) || "My Pipeline"
  })
  const [description, setDescription] = useState("")
  const [environmentId, setEnvironmentId] = useState("")
  const [type, setType] = useState("")

  const handleDeploy = useCallback(async () => {
    if (!identifier || !name) {
      toast.error("Identifier and name are required")
      return
    }

    const client = createHarnessClient()
    if (!client) {
      toast.error("Harness configuration incomplete. Please set your API keys in environment variables.")
      return
    }

    setIsDeploying(true)
    setDeploymentResult(null)

    try {
      let result: DeploymentResult

      switch (yamlInfo.type) {
        case 'pipeline':
          result = await client.deployPipeline(yamlInfo.yamlContent, identifier, name, description)
          break
        case 'connector':
          result = await client.deployConnector(yamlInfo.yamlContent, identifier, name, description, type || 'GitHttp')
          break
        case 'service':
          result = await client.deployService(yamlInfo.yamlContent, identifier, name, description)
          break
        case 'environment':
          result = await client.deployEnvironment(yamlInfo.yamlContent, identifier, name, description, type || 'Production')
          break
        case 'infrastructure':
          if (!environmentId) {
            toast.error("Environment ID is required for infrastructure deployment")
            setIsDeploying(false)
            return
          }
          result = await client.deployInfrastructure(yamlInfo.yamlContent, identifier, name, environmentId, description, type || 'KubernetesDirect')
          break
        default:
          throw new Error(`Unsupported YAML type: ${yamlInfo.type}`)
      }

      setDeploymentResult(result)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      const result: DeploymentResult = {
        success: false,
        message: errorMessage,
        identifier
      }
      setDeploymentResult(result)
      toast.error(errorMessage)
    } finally {
      setIsDeploying(false)
    }
  }, [identifier, name, yamlInfo, description, type, environmentId])

  const typeOptions = useMemo(() => {
    switch (yamlInfo.type) {
      case 'connector':
        return [
          { value: 'GitHttp', label: 'Git HTTP' },
          { value: 'GitSsh', label: 'Git SSH' },
          { value: 'Artifactory', label: 'Artifactory' },
          { value: 'AzureClientSecretKey', label: 'Azure Client Secret' },
        ]
      case 'environment':
        return [
          { value: 'Production', label: 'Production' },
          { value: 'PreProduction', label: 'Pre-Production' },
          { value: 'Development', label: 'Development' },
          { value: 'Testing', label: 'Testing' },
        ]
      case 'infrastructure':
        return [
          { value: 'KubernetesDirect', label: 'Kubernetes Direct' },
          { value: 'KubernetesGcp', label: 'Kubernetes GCP' },
          { value: 'KubernetesAws', label: 'Kubernetes AWS' },
          { value: 'KubernetesAzure', label: 'Kubernetes Azure' },
        ]
      default:
        return []
    }
  }, [yamlInfo.type])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg font-medium"
        >
          <Upload className="h-4 w-4 mr-2" />
          Deploy to Harness
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] gap-0 p-0 bg-white border-gray-200">
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Deploy {yamlInfo.type} to Harness
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Configure the deployment settings for your {yamlInfo.type}. This will create the resource in your Harness account.
          </DialogDescription>
        </DialogHeader>
        
        {!deploymentResult ? (
          <div className="px-6 py-5 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-900">
                Identifier *
              </Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => {
                  // Clean input to match Harness pattern
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_$]/g, '_').substring(0, 127)
                  setIdentifier(cleaned)
                }}
                placeholder="unique_identifier"
                className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500">Letters, numbers, _, $ only. Must start with letter or _</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-900">
                Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.substring(0, 127))}
                placeholder="Display Name"
                className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500">Max 127 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                className="bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-colors"
              />
            </div>

            {typeOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-900">
                  Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 transition-colors">
                    <SelectValue placeholder={`Select ${yamlInfo.type} type`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-lg">
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-gray-50 focus:bg-gray-50">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {yamlInfo.type === 'infrastructure' && (
              <div className="space-y-2">
                <Label htmlFor="environmentId" className="text-sm font-medium text-gray-900">
                  Environment ID *
                </Label>
                <Input
                  id="environmentId"
                  value={environmentId}
                  onChange={(e) => setEnvironmentId(e.target.value)}
                  placeholder="environment_identifier"
                  className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className={`flex items-start gap-4 p-5 rounded-xl border ${
              deploymentResult.success 
                ? 'bg-green-50 border-green-200 text-green-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              {deploymentResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">
                  {deploymentResult.success ? 'Deployment Successful' : 'Deployment Failed'}
                </p>
                <p className="text-sm mt-2 leading-relaxed opacity-90">{deploymentResult.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {!deploymentResult ? (
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying || !identifier || !name}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm disabled:opacity-50 transition-colors"
              >
                {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeploying ? 'Deploying...' : 'Deploy to Harness'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})