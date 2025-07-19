"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Copy,
  Download,
  Play,
  GitBranch,
  DollarSign,
  Server,
  BarChart3,
  BookOpen,
  Settings,
  TrendingDown,
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
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-cyan-400">Pipeline Created</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">{data.pipelineName}</h4>
              <div className="flex gap-2">
                {stages.map((stage: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-400">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="bg-gray-950 rounded p-4 font-mono text-sm text-gray-300 max-h-48 overflow-y-auto">
              <pre>{data.yaml}</pre>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "cost") {
    return (
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <CardTitle className="text-green-400">Cost Analysis Perspective</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.totalCost}</div>
                <div className="text-sm text-gray-400">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{data.savings}</div>
                <div className="text-sm text-gray-400">Potential Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{data.recommendations}</div>
                <div className="text-sm text-gray-400">Recommendations</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cost Optimization</span>
                <span className="text-white">74%</span>
              </div>
              <Progress value={74} className="h-2" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded">
              <TrendingDown className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">26% cost reduction possible with recommended changes</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "service") {
    const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : []
    return (
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-blue-400">Service Configuration</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">{data.serviceName}</h4>
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400">
                {data.serviceType}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Artifacts:</div>
              {artifacts.map((artifact: string, index: number) => (
                <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 mr-2">
                  {artifact}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-700 rounded">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Service ready for deployment</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "dashboard") {
    const widgets = Array.isArray(data?.widgets) ? data.widgets : []
    return (
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-purple-400">Custom Dashboard</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium text-white">{data.dashboardName}</h4>
            <div className="grid grid-cols-2 gap-2">
              {widgets.map((widget: string, index: number) => (
                <div key={index} className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="text-sm font-medium text-white">{widget}</div>
                  <div className="text-xs text-gray-400 mt-1">Real-time monitoring</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "docs") {
    const sections = Array.isArray(data?.sections) ? data.sections : []
    return (
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-orange-400">Documentation</CardTitle>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium text-white">{data.topic}</h4>
            <div className="space-y-2">
              {sections.map((section: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300 hover:text-white">{section}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responseType === "infrastructure") {
    const secrets = Array.isArray(data?.secrets) ? data.secrets : []
    return (
      <Card className="mt-4 bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-yellow-400">Infrastructure Setup</CardTitle>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4 mr-1" />
            Copy YAML
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          {data.previewUrl && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Preview UI
            </Button>
          )}
        </div>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">{data.resourceType}</h4>
              <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400">
                {data.environment}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Configured Secrets:</div>
              {secrets.map((secret: string, index: number) => (
                <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 mr-2">
                  {secret}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Verify connector configuration before use</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                <Play className="h-4 w-4 mr-1" />
                Deploy to Harness
              </Button>
              {data.previewUrl && (
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                  Preview Changes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
