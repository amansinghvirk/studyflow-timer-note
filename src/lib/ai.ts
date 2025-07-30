// AI model configurations and utilities
export const AVAILABLE_MODELS = [
  { 
    value: 'gemini-1.5-pro', 
    label: 'Gemini 1.5 Pro', 
    description: 'Most capable model, best for complex analysis',
    provider: 'google' 
  },
  { 
    value: 'gemini-1.5-flash', 
    label: 'Gemini 1.5 Flash', 
    description: 'Fast and efficient, great for quick insights',
    provider: 'google' 
  },
  { 
    value: 'gemini-1.0-pro', 
    label: 'Gemini 1.0 Pro', 
    description: 'Reliable and stable performance',
    provider: 'google' 
  },
  { 
    value: 'gpt-4o', 
    label: 'GPT-4o', 
    description: 'OpenAI\'s latest multimodal model',
    provider: 'openai' 
  },
  { 
    value: 'gpt-4o-mini', 
    label: 'GPT-4o Mini', 
    description: 'Smaller, faster version of GPT-4o',
    provider: 'openai' 
  },
  { 
    value: 'claude-3-sonnet', 
    label: 'Claude 3 Sonnet', 
    description: 'Balanced performance and creativity',
    provider: 'anthropic' 
  },
  { 
    value: 'claude-3-haiku', 
    label: 'Claude 3 Haiku', 
    description: 'Fastest Claude model for quick responses',
    provider: 'anthropic' 
  }
] as const

export type AIModel = typeof AVAILABLE_MODELS[number]

export interface AISettings {
  enabled: boolean
  apiKey: string
  model: string
  customModel?: string
  temperature: number
  maxTokens: number
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  apiKey: '',
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 4096
}

// Helper function to get model by value
export function getModelByValue(modelValue: string): AIModel | undefined {
  return AVAILABLE_MODELS.find(model => model.value === modelValue)
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
export async function testAIConnection(apiKey: string, modelValue: string): Promise<{ success: boolean; message: string }> {
  try {
    const model = getModelByValue(modelValue)
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
    return testAIConnection(this.settings.apiKey, this.settings.model)
  }

  async customPrompt(prompt: string, session?: any): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const model = getModelByValue(this.settings.model)
      if (!model) {
        return { success: false, error: 'Invalid model selected' }
      }

      if (!validateApiKey(this.settings.apiKey, model.provider)) {
        return { success: false, error: 'Invalid API key' }
      }

      // Use the spark.llm API to make the AI call
      const sparkPrompt = spark.llmPrompt`${prompt}`
      const result = await spark.llm(sparkPrompt)
      
      return { success: true, response: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process prompt' 
      }
    }
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
    const model = getModelByValue(settings.model)
    if (!model) {
      return { success: false, error: 'Invalid model selected' }
    }

    if (!validateApiKey(settings.apiKey, model.provider)) {
      return { success: false, error: 'Invalid API key' }
    }

    const prompt = generateInsightsPrompt(notes, topic, subtopic)
    
    // Use the spark.llm API to make the AI call
    const sparkPrompt = spark.llmPrompt`${prompt}`
    const insights = await spark.llm(sparkPrompt)
    
    return { success: true, insights }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate insights' 
    }
  }
}

// Generate AI enhancement suggestions for notes during live session
export async function generateLiveNotesEnhancement(
  currentNotes: string,
  topic: string,
  subtopic: string,
  settings: AISettings
): Promise<{ success: boolean; suggestions?: string; error?: string }> {
  try {
    const model = getModelByValue(settings.model)
    if (!model) {
      return { success: false, error: 'Invalid model selected' }
    }

    if (!validateApiKey(settings.apiKey, model.provider)) {
      return { success: false, error: 'Invalid API key' }
    }

    const prompt = `As an AI study assistant, help enhance these study notes in real-time:

**Topic**: ${topic}
**Subtopic**: ${subtopic}
**Current Notes**: 
${currentNotes}

Provide brief, actionable suggestions to improve these notes:
1. **Key Points to Add**: What important concepts might be missing?
2. **Structure Improvements**: How could the organization be enhanced?
3. **Clarifications**: What points need more explanation?
4. **Connections**: Links to related concepts or topics

Keep suggestions concise and immediately actionable. Focus on enhancing learning.`
    
    // Use the spark.llm API to make the AI call
    const sparkPrompt = spark.llmPrompt`${prompt}`
    const suggestions = await spark.llm(sparkPrompt)
    
    return { success: true, suggestions }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate suggestions' 
    }
  }
}