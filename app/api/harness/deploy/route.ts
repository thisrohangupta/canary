import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, yamlContent, identifier, name, description, environmentId, connectorType, envType, infraType } = await request.json()

    const apiKey = process.env.NEXT_PUBLIC_HARNESS_API_KEY
    const accountId = process.env.NEXT_PUBLIC_HARNESS_ACCOUNT_ID
    const orgId = process.env.NEXT_PUBLIC_HARNESS_ORG_ID
    const projectId = process.env.NEXT_PUBLIC_HARNESS_PROJECT_ID

    if (!apiKey || !accountId || !orgId || !projectId) {
      return NextResponse.json(
        { success: false, message: 'Harness configuration incomplete' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!identifier || !name) {
      return NextResponse.json(
        { success: false, message: 'Identifier and name are required' },
        { status: 400 }
      )
    }

    // Validate identifier pattern (Harness requirement)
    const identifierPattern = /^[a-zA-Z_][0-9a-zA-Z_$]{0,127}$/
    if (!identifierPattern.test(identifier)) {
      return NextResponse.json(
        { success: false, message: 'Identifier must match pattern: ^[a-zA-Z_][0-9a-zA-Z_$]{0,127}$' },
        { status: 400 }
      )
    }

    // Validate name pattern (Harness requirement)
    const namePattern = /^[a-zA-Z_][0-9a-zA-Z-_ ]{0,127}$/
    if (!namePattern.test(name)) {
      return NextResponse.json(
        { success: false, message: 'Name must match pattern: ^[a-zA-Z_][0-9a-zA-Z-_ ]{0,127}$' },
        { status: 400 }
      )
    }

    const baseUrl = 'https://app.harness.io'
    let endpoint: string
    let requestBody: any

    // Build endpoint and request body based on type
    switch (type) {
      case 'pipeline':
        endpoint = `/v1/orgs/${orgId}/projects/${projectId}/pipelines`
        
        // According to the API spec, we need both the metadata AND the YAML
        // Parse the YAML and update identifiers if needed
        let pipelineYaml = yamlContent
        
        console.log('Original YAML content:')
        console.log(yamlContent)
        
        try {
          const yaml = await import('js-yaml')
          const parsed = yaml.load(yamlContent) as any
          
          console.log('Parsed YAML object:', JSON.stringify(parsed, null, 2))
          
          if (parsed && parsed.pipeline) {
            // Update the identifier and name in the YAML to match user input
            parsed.pipeline.identifier = identifier
            parsed.pipeline.name = name
            if (description) {
              parsed.pipeline.description = description
            }
            
            // Ensure the project identifier matches the target project
            parsed.pipeline.projectIdentifier = projectId
            parsed.pipeline.orgIdentifier = orgId
            
            // Remove any hardcoded project references that might conflict
            if (parsed.pipeline.project) {
              delete parsed.pipeline.project
            }
            
            // Fix schema validation issues
            if (parsed.pipeline.stages && Array.isArray(parsed.pipeline.stages)) {
              parsed.pipeline.stages.forEach((stageWrapper: any) => {
                if (stageWrapper.stage) {
                  const stage = stageWrapper.stage
                  
                  // Add missing failureStrategies to all stages
                  if (!stage.failureStrategies) {
                    stage.failureStrategies = [
                      {
                        onFailure: {
                          errors: ["AllErrors"],
                          action: {
                            type: "StageRollback"
                          }
                        }
                      }
                    ]
                  }
                  
                  // Fix CI stage steps
                  if (stage.type === 'CI' && stage.spec?.execution?.steps) {
                    stage.spec.execution.steps.forEach((stepWrapper: any) => {
                      if (stepWrapper.step) {
                        const step = stepWrapper.step
                        // Fix invalid step types
                        if (step.type === 'ShellScript') {
                          step.type = 'Run'  // ShellScript is not valid, should be Run
                        }
                      }
                    })
                  }
                  
                  // Fix Approval stage - add missing execution
                  if (stage.type === 'Approval' && stage.spec && !stage.spec.execution) {
                    stage.spec.execution = {
                      steps: [
                        {
                          step: {
                            identifier: "approval",
                            type: "HarnessApproval",
                            name: "Approval",
                            timeout: "1d",
                            spec: {
                              approvalMessage: "Please review and approve",
                              includePipelineExecutionHistory: true,
                              approvers: {
                                minimumCount: 1,
                                disallowPipelineExecutor: false,
                                userGroups: []
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              })
            }
            
            // Convert back to YAML with proper formatting
            pipelineYaml = yaml.dump(parsed, {
              indent: 2,
              lineWidth: 120,
              noRefs: true,
              sortKeys: false
            })
            
            console.log('Updated YAML content:')
            console.log(pipelineYaml)
          } else {
            console.log('No pipeline object found in YAML, using original content')
          }
        } catch (error) {
          console.error('Error parsing/updating YAML:', error)
          // If parsing fails, use original YAML
          console.log('Using original YAML due to parsing error')
        }
        
        requestBody = {
          identifier,
          name,
          description,
          pipeline_yaml: pipelineYaml
        }
        break

      case 'connector':
        endpoint = `/v1/orgs/${orgId}/projects/${projectId}/connectors`
        // Parse YAML to extract connector spec
        let spec: any = {}
        try {
          const yaml = await import('js-yaml')
          const parsed = yaml.load(yamlContent) as any
          if (parsed?.connector?.spec) {
            spec = parsed.connector.spec
          } else {
            spec = { type: connectorType || 'GitHttp' }
          }
        } catch {
          spec = { type: connectorType || 'GitHttp' }
        }

        requestBody = {
          connector: {
            identifier,
            name,
            description,
            org: orgId,
            project: projectId,
            spec
          }
        }
        break

      case 'service':
        endpoint = `/v1/orgs/${orgId}/projects/${projectId}/services`
        requestBody = {
          identifier,
          name,
          description,
          yaml: yamlContent
        }
        break

      case 'environment':
        endpoint = `/v1/orgs/${orgId}/projects/${projectId}/environments`
        requestBody = {
          identifier,
          name,
          type: envType || 'Production',
          description,
          yaml: yamlContent
        }
        break

      case 'infrastructure':
        if (!environmentId) {
          return NextResponse.json(
            { success: false, message: 'Environment ID is required for infrastructure deployment' },
            { status: 400 }
          )
        }
        endpoint = `/v1/orgs/${orgId}/projects/${projectId}/environments/${environmentId}/infrastructures`
        requestBody = {
          identifier,
          name,
          type: infraType || 'KubernetesDirect',
          yaml: yamlContent,
          description
        }
        break

      default:
        return NextResponse.json(
          { success: false, message: `Unsupported YAML type: ${type}` },
          { status: 400 }
        )
    }

    const url = `${baseUrl}${endpoint}`
    
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Harness-Account': accountId,
    }

    console.log('Harness API Request:')
    console.log('URL:', url)
    console.log('Headers:', headers)
    console.log('Request Body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Harness API error (${response.status}):`, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Harness API error (${response.status}): ${errorText}`,
          details: { status: response.status, body: errorText }
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: `${type} "${name}" deployed successfully`,
      identifier,
      details: result
    })

  } catch (error) {
    console.error('Deploy API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to deploy: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}