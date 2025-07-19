"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Download,
  GitBranch,
  Server,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface HarnessResponseCardProps {
  responseType: string
  data: any
}

export function HarnessResponseCard({ responseType, data }: HarnessResponseCardProps) {
  if (responseType === "pipeline") {
    const stages = Array.isArray(data?.stages) ? data.stages : []
    return (
      <Card className="mt-4 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-gray-900">Pipeline Configuration</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => navigator.clipboard.writeText(data.yaml || '')}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy YAML
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{data.pipelineName || 'Pipeline'}</h4>
              <div className="flex gap-2">
                {stages.map((stage: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
            {data.yaml && (
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 max-h-48 overflow-y-auto border">
                <pre className="whitespace-pre-wrap">{data.yaml}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "service") {
    const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : []
    return (
      <Card className="mt-4 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              <CardTitle className="text-gray-900">Service Configuration</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => navigator.clipboard.writeText(data.yaml || '')}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy YAML
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{data.serviceName || 'Service'}</h4>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {data.serviceType || 'Service'}
              </Badge>
            </div>
            {artifacts.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Artifacts:</div>
                {artifacts.map((artifact: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-gray-300 text-gray-700 mr-2 mb-1">
                    {artifact}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Service ready for deployment</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "environment") {
    return (
      <Card className="mt-4 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-gray-900">Environment Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{data.environmentName || 'Environment'}</h4>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {data.environmentType || 'Environment'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-800">Environment configured successfully</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "connector") {
    return (
      <Card className="mt-4 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-gray-900">Connector Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{data.connectorName || 'Connector'}</h4>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {data.connectorType || 'Connector'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">Connector ready for use</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle error responses
  if (responseType === "rate_limit_error") {
    return (
      <Card className="mt-4 bg-red-50 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Rate Limit Exceeded</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800 mb-3">
                You've reached your daily limit of 50 requests for the Gemini API free tier.
              </div>
              <div className="space-y-2 text-sm text-red-700">
                <div>• Quota resets in: <span className="font-medium">24 hours</span></div>
                <div>• Current limit: <span className="font-medium">50 requests/day</span></div>
                <div>• Plan: <span className="font-medium">Free Tier</span></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
                onClick={() => window.open(data?.upgradeUrl || 'https://ai.google.dev/', '_blank')}
              >
                Upgrade Plan
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => window.open(data?.docsUrl || 'https://ai.google.dev/gemini-api/docs/rate-limits', '_blank')}
              >
                View Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "api_key_error") {
    return (
      <Card className="mt-4 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900">API Key Configuration Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800 mb-3">
                Your Gemini API key is not properly configured.
              </div>
              <div className="space-y-2 text-sm text-yellow-700">
                <div>1. Create a <code className="bg-yellow-200 px-1 rounded">env.local</code> file</div>
                <div>2. Add: <code className="bg-yellow-200 px-1 rounded">NEXT_PUBLIC_GEMINI_API_KEY=your_key</code></div>
                <div>3. Restart your development server</div>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
              onClick={() => window.open(data?.setupUrl || 'https://ai.google.dev/', '_blank')}
            >
              Get API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generic fallback for any YAML response that doesn't match specific types
  if (data?.yaml) {
    return (
      <Card className="mt-4 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">Harness Configuration</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => navigator.clipboard.writeText(data.yaml || '')}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy YAML
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{data.title || "Harness Configuration"}</h4>
              <p className="text-sm text-gray-600">{data.description || "Generated configuration ready for deployment"}</p>
            </div>
            {data.yaml && (
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 max-h-48 overflow-y-auto border">
                <pre className="whitespace-pre-wrap">{data.yaml}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}