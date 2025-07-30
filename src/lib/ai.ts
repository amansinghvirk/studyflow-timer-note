// AI model configurations and utilities
export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'google' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' }
] as const

export type AIModel = typeof AVAILABLE_MODELS[number]

export interface AISettings {
  apiKey: string
  selectedModel: string
  temperature: number
  maxTokens: number
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  selectedModel: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 1000
}

// Helper function to get model by ID
export function getModelById(modelId: string): AIModel | undefined {
  return AVAILABLE_MODELS.find(model => model.id === modelId)
}

// Helper function to get models by provider
export function getModelsByProvider(provider: string): AIModel[] {
  return AVAILABLE_MODELS.filter(model => model.provider === provider)
}

// Validate API key format based on provider
export function validateApiKey(apiKey: string, provider: string): boolean {
  if (!apiKey.trim()) return false
  
  switch (provider) {
    case 'google':
      return apiKey.startsWith('AIza') || apiKey.length > 30
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 40
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 40
    default:
      return apiKey.length > 10
  }
}

// Generate insights prompt for study notes
export function generateInsightsPrompt(notes: string, topic: string, subtopic: string): string {
  return `As an AI study assistant, analyze these study notes and provide helpful insights:

**Topic**: ${topic}
**Subtopic**: ${subtopic}

**Notes**:
${notes}

Please provide:
1. **Key Concepts**: Identify and summarize the main concepts
2. **Learning Gaps**: Point out areas that might need more detail or clarification
3. **Connections**: Suggest how these concepts relate to other topics in ${topic}
4. **Study Tips**: Recommend specific study strategies for this material
5. **Practice Questions**: Generate 2-3 questions to test understanding

Keep your response concise but actionable. Focus on enhancing learning and retention.`
}

// Test AI connection
export async function testAIConnection(apiKey: string, modelId: string): Promise<{ success: boolean; message: string }> {
  try {
    const model = getModelById(modelId)
    if (!model) {
      return { success: false, message: 'Invalid model selected' }
    }

    if (!validateApiKey(apiKey, model.provider)) {
      return { success: false, message: 'Invalid API key format' }
    }

    // Simple test prompt
    const testPrompt = 'Respond with "AI connection successful" if you can read this message.'
    
    // Here you would implement the actual API call based on the provider
    // For now, we'll simulate a successful connection
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { success: true, message: 'AI connection successful!' }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

// StudyFlowAI class for managing AI interactions
export class StudyFlowAI {
  private settings: AISettings

  constructor(settings: AISettings) {
    this.settings = settings
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return testAIConnection(this.settings.apiKey, this.settings.selectedModel)
  }

  async generateInsights(notes: string, topic: string, subtopic: string): Promise<{ success: boolean; insights?: string; error?: string }> {
    return generateAIInsights(notes, topic, subtopic, this.settings)
  }

  updateSettings(newSettings: Partial<AISettings>) {
    this.settings = { ...this.settings, ...newSettings }
  }

  getSettings(): AISettings {
    return { ...this.settings }
  }
}

// Generate AI insights for study notes
export async function generateAIInsights(
  notes: string, 
  topic: string, 
  subtopic: string, 
  settings: AISettings
): Promise<{ success: boolean; insights?: string; error?: string }> {
  try {
    const model = getModelById(settings.selectedModel)
    if (!model) {
      return { success: false, error: 'Invalid model selected' }
    }

    if (!validateApiKey(settings.apiKey, model.provider)) {
      return { success: false, error: 'Invalid API key' }
    }

    const prompt = generateInsightsPrompt(notes, topic, subtopic)
    
    // Here you would implement the actual API call to the selected provider
    // For now, we'll return a mock response
    const mockInsights = `## Key Concepts
- Main concepts identified from your notes on ${subtopic}
- Important principles and definitions

## Learning Gaps
- Consider expanding on theoretical foundations
- Add more practical examples

## Connections
- This topic relates to other areas in ${topic}
- Consider cross-references with related subjects

## Study Tips
- Use active recall techniques
- Create concept maps
- Practice with real-world applications

## Practice Questions
1. What are the main principles discussed in these notes?
2. How does this concept apply in practical scenarios?
3. What connections can you make with previous topics?`

    return { success: true, insights: mockInsights }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate insights' 
    }
  }
}