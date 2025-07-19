import yaml from 'js-yaml'

export type HarnessYamlType = 'pipeline' | 'connector' | 'service' | 'environment' | 'infrastructure'

export interface HarnessYamlInfo {
  type: HarnessYamlType
  name?: string
  identifier?: string
  isValid: boolean
  yamlContent: string
}

export function detectHarnessYamlType(yamlContent: string): HarnessYamlInfo | null {
  try {
    const parsed = yaml.load(yamlContent) as any
    
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    // Check for Harness pipeline
    if (parsed.pipeline) {
      return {
        type: 'pipeline',
        name: parsed.pipeline.name,
        identifier: parsed.pipeline.identifier,
        isValid: true,
        yamlContent
      }
    }

    // Check for Harness connector
    if (parsed.connector) {
      return {
        type: 'connector',
        name: parsed.connector.name,
        identifier: parsed.connector.identifier,
        isValid: true,
        yamlContent
      }
    }

    // Check for Harness service
    if (parsed.service) {
      return {
        type: 'service',
        name: parsed.service.name,
        identifier: parsed.service.identifier,
        isValid: true,
        yamlContent
      }
    }

    // Check for Harness environment
    if (parsed.environment) {
      return {
        type: 'environment',
        name: parsed.environment.name,
        identifier: parsed.environment.identifier,
        isValid: true,
        yamlContent
      }
    }

    // Check for Harness infrastructure
    if (parsed.infrastructure) {
      return {
        type: 'infrastructure',
        name: parsed.infrastructure.name,
        identifier: parsed.infrastructure.identifier,
        isValid: true,
        yamlContent
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing YAML:', error)
    return null
  }
}

export function extractYamlFromMarkdown(content: string): string[] {
  const yamlBlocks: string[] = []
  const yamlRegex = /```(?:yaml|yml)\n([\s\S]*?)\n```/g
  let match

  while ((match = yamlRegex.exec(content)) !== null) {
    yamlBlocks.push(match[1])
  }

  return yamlBlocks
}

export function detectHarnessYamlsInContent(content: string): HarnessYamlInfo[] {
  const yamlBlocks = extractYamlFromMarkdown(content)
  const harnessYamls: HarnessYamlInfo[] = []

  for (const yamlBlock of yamlBlocks) {
    const yamlInfo = detectHarnessYamlType(yamlBlock)
    if (yamlInfo) {
      harnessYamls.push(yamlInfo)
    }
  }

  return harnessYamls
}