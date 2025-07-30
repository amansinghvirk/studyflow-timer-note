// AI model configurations and utilities
export const AVAILABLE_MODELS = [
    label: 'Gemini 1.5 Pro', 
    provider: 'google' 
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'google' },
    label: 'Gemini 1.5 Flash', 
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { 
    label: 'Gemini 1.0 Pro', 
    provid

    label: 'GPT-4o', 

  { 
  apiKey: string
    provider: 'openai' 
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
export function ge
      return apiKey.startsWith('sk-') && apiKey.length > 40
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 40
  return AVA
      return apiKey.length > 10
  }
}

// Generate insights prompt for study notes
export function generateInsightsPrompt(notes: string, topic: string, subtopic: string): string {
  return `As an AI study assistant, analyze these study notes and provide helpful insights:

**Topic**: ${topic}
      return apiKey.lengt

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
    const model = getModelByValue(model
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
    }
    
    return { success: true, message: 'AI connection successful!' }
  } catch (error) {
  private set
      success: false, 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  a
}

// Generate AI insights for study notes
export async function generateAIInsights(
  notes: string, 
  topic: string, 
  subtopic: string, 
        return { succe
): Promise<{ success: boolean; insights?: string; error?: string }> {
      /
    const model = getModelById(settings.selectedModel)
      
      return { success: false, error: 'Invalid model selected' }
     

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
    const model = getModelByV

    }
- This topic relates to other areas in ${topic}
      return { success: false, error: 'Invalid AP

    const pro
- Use active recall techniques
    const sparkPrompt
- Practice with real-world applications

## Practice Questions
      success: false, 
2. How does this concept apply in practical scenarios?
3. What connections can you make with previous topics?`

    return { success: true, insights: mockInsights }
  } catch (error) {
  topic: stri
      success: false, 
): Promise<{ success: boolean; suggestions?: string; error?: string }> {
    }
   
}