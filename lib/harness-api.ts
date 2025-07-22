export interface HarnessConfig {
  apiKey: string
  accountId: string
  orgId: string
  projectId: string
  baseUrl?: string
}

export interface DeploymentResult {
  success: boolean
  message: string
  identifier?: string
  details?: any
}

export class HarnessApiClient {
  private config: HarnessConfig
  private baseUrl: string

  constructor(config: HarnessConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://app.harness.io'
  }

  private async makeDeployRequest(deployData: any): Promise<any> {
    try {
      const response = await fetch('/api/harness/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Deploy API error response:', errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || `HTTP ${response.status}`)
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Harness deployment request failed:', error)
      throw error
    }
  }

  async deployPipeline(yamlContent: string, identifier: string, name: string, description?: string): Promise<DeploymentResult> {
    try {
      const result = await this.makeDeployRequest({
        type: 'pipeline',
        yamlContent,
        identifier,
        name,
        description
      })
      
      return result
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`,
        identifier
      }
    }
  }

  async deployConnector(yamlContent: string, identifier: string, name: string, description?: string, connectorType: string = 'GitHttp'): Promise<DeploymentResult> {
    try {
      const result = await this.makeDeployRequest({
        type: 'connector',
        yamlContent,
        identifier,
        name,
        description,
        connectorType
      })
      
      return result
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy connector: ${error instanceof Error ? error.message : 'Unknown error'}`,
        identifier
      }
    }
  }

  async deployService(yamlContent: string, identifier: string, name: string, description?: string): Promise<DeploymentResult> {
    try {
      const result = await this.makeDeployRequest({
        type: 'service',
        yamlContent,
        identifier,
        name,
        description
      })
      
      return result
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        identifier
      }
    }
  }

  async deployEnvironment(yamlContent: string, identifier: string, name: string, description?: string, envType: string = 'Production'): Promise<DeploymentResult> {
    try {
      const result = await this.makeDeployRequest({
        type: 'environment',
        yamlContent,
        identifier,
        name,
        description,
        envType
      })
      
      return result
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy environment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        identifier
      }
    }
  }

  async deployInfrastructure(yamlContent: string, identifier: string, name: string, environmentId: string, description?: string, infraType: string = 'KubernetesDirect'): Promise<DeploymentResult> {
    try {
      const result = await this.makeDeployRequest({
        type: 'infrastructure',
        yamlContent,
        identifier,
        name,
        description,
        environmentId,
        infraType
      })
      
      return result
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy infrastructure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        identifier
      }
    }
  }
}

export function createHarnessClient(): HarnessApiClient | null {
  const apiKey = process.env.NEXT_PUBLIC_HARNESS_API_KEY
  const accountId = process.env.NEXT_PUBLIC_HARNESS_ACCOUNT_ID
  const orgId = process.env.NEXT_PUBLIC_HARNESS_ORG_ID
  const projectId = process.env.NEXT_PUBLIC_HARNESS_PROJECT_ID

  if (!apiKey || !accountId || !orgId || !projectId) {
    console.warn('Harness configuration incomplete. Please set all required environment variables.')
    return null
  }

  return new HarnessApiClient({
    apiKey,
    accountId,
    orgId,
    projectId
  })
}
