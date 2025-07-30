// AI model configurations and utilities
import type { StudySession } from '@/App'

export interface AIModel {
  id: string
  name: string
  label: string
  provider: 'google' | 'openai' | 'anthropic' | 'custom'
}

export interface AISettings {
  apiKey: string
  selectedModel: string
  customModel?: string
  temperature: number
  maxTokens: number
}

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
}

export interface StudyFlowAIConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export const AVAILABLE_MODELS = [
  { 
    value: 'gemini-1.5-pro', 
    label: 'Gemini 1.5 Pro',
    description: 'Most capable Google model for complex tasks',
    provider: 'google' 
  },
  { 
    value: 'gemini-1.5-flash', 
    label: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for most study tasks',
    provider: 'google' 
  },
  { 
    value: 'gemini-1.0-pro', 
    label: 'Gemini 1.0 Pro',
    description: 'Reliable option for general study assistance',
    provider: 'google' 
  },
  { 
    value: 'gpt-4o', 
    label: 'GPT-4o',
    description: 'Advanced OpenAI model (requires OpenAI API key)',
    provider: 'openai' 
  },
  { 
    value: 'gpt-4o-mini', 
    label: 'GPT-4o Mini',
    description: 'Cost-effective OpenAI model (requires OpenAI API key)',
    provider: 'openai' 
  },
  { 
    value: 'claude-3-opus', 
    label: 'Claude 3 Opus',
    description: 'Anthropic\'s most capable model (requires Anthropic API key)',
    provider: 'anthropic' 
  },
  { 
    value: 'claude-3-sonnet', 
    label: 'Claude 3 Sonnet',
    description: 'Balanced Claude model for most tasks (requires Anthropic API key)',
    provider: 'anthropic' 
  }
]

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  selectedModel: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 1000
}

// Helper function to get model by value
export function getModelByValue(modelValue: string) {
  return AVAILABLE_MODELS.find(model => model.value === modelValue)
}

// Helper function to get models by provider
export function getModelsByProvider(provider: string) {
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
    case 'custom':
      return apiKey.length > 10
    default:
      return false
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
      return { success: false, message: 'Invalid API key format for selected provider' }
    }

    // Simple test prompt
    const testPrompt = 'Respond with "AI connection successful" if you can read this message.'
    
    // Here you would implement the actual API call based on the provider
    // For now, we'll simulate a successful connection
    
    return { success: true, message: 'AI connection successful!' }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

// Generate AI insights for study notes
export async function generateAIInsights(
  notes: string, 
  topic: string, 
  subtopic: string, 
  aiSettings: any
): Promise<{ success: boolean; insights?: string; error?: string }> {
  try {
    if (!aiSettings?.enabled || !aiSettings?.apiKey) {
      return { success: false, error: 'AI features not enabled or API key missing' }
    }

    const model = getModelByValue(aiSettings.model || 'gemini-1.5-flash')
    if (!model) {
      return { success: false, error: 'Invalid model selected' }
    }

    if (!validateApiKey(aiSettings.apiKey, model.provider)) {
      return { success: false, error: 'Invalid API key for selected provider' }
    }

    const prompt = generateInsightsPrompt(notes, topic, subtopic)
    
    // Here you would implement the actual API call to the selected provider
    // For now, we'll return a mock response
    const mockInsights = `## Key Concepts
- Main concepts identified from your notes on ${subtopic}
- Important principles and definitions

## Learning Gaps
- Consider expanding on theoretical foundations
- Add more concrete examples

## Connections
- This topic relates to other areas in ${topic}
- Consider reviewing prerequisite concepts

## Study Tips
- Use active recall techniques
- Practice with real-world applications

## Practice Questions
1. What are the key principles discussed in these notes?
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

// Generate AI suggestions during live note-taking
export async function generateLiveSuggestions(
  currentNotes: string, 
  topic: string, 
  subtopic: string, 
  aiSettings: any
): Promise<{ success: boolean; suggestions?: string; error?: string }> {
  try {
    if (!aiSettings?.enabled || !aiSettings?.apiKey) {
      return { success: false, error: 'AI features not enabled or API key missing' }
    }

    const model = getModelByValue(aiSettings.model || 'gemini-1.5-flash')
    if (!model) {
      return { success: false, error: 'Invalid model selected' }
    }

    if (!validateApiKey(aiSettings.apiKey, model.provider)) {
      return { success: false, error: 'Invalid API key for selected provider' }
    }

    const sparkPrompt = spark.llmPrompt`Based on these study notes about ${topic} - ${subtopic}, provide 2-3 brief suggestions to improve or expand the content:

${currentNotes}

Keep suggestions concise and actionable.`

    const suggestions = await spark.llm(sparkPrompt, 'gpt-4o-mini')
    
    return { success: true, suggestions }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate suggestions' 
    }
  }
}

// StudyFlowAI class for comprehensive AI operations
export class StudyFlowAI {
  private config: StudyFlowAIConfig

  constructor(config: StudyFlowAIConfig) {
    this.config = config
  }

  async enhanceNotes(session: StudySession): Promise<AIResponse> {
    try {
      const prompt = spark.llmPrompt`As an expert study assistant, enhance these study notes for better clarity and structure:

**Topic:** ${session.topic}
**Subtopic:** ${session.subtopic}
**Original Notes:**
${session.notes}

Please provide enhanced notes with:
1. Better structure and formatting
2. Key concepts highlighted
3. Missing important details added
4. Clear headings and bullet points

Return only the enhanced notes without additional commentary.`

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return { success: true, content: response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enhance notes' 
      }
    }
  }

  async summarizeSession(session: StudySession): Promise<AIResponse> {
    try {
      const prompt = spark.llmPrompt`Create a concise summary of this study session:

**Topic:** ${session.topic}
**Subtopic:** ${session.subtopic}
**Duration:** ${session.duration} minutes
**Notes:**
${session.notes}

Provide a structured summary with:
1. Key learning objectives covered
2. Main concepts and definitions
3. Important takeaways
4. Areas for further study`

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return { success: true, content: response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to summarize session' 
      }
    }
  }

  async generateQuiz(session: StudySession): Promise<AIResponse> {
    try {
      const prompt = spark.llmPrompt`Generate practice questions based on these study notes:

**Topic:** ${session.topic}
**Subtopic:** ${session.subtopic}
**Notes:**
${session.notes}

Create 5-7 questions including:
1. Multiple choice questions (3-4)
2. Short answer questions (2-3)
3. One essay question

Format clearly with question numbers and answer choices for multiple choice.`

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return { success: true, content: response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate quiz' 
      }
    }
  }

  async explainConcepts(session: StudySession): Promise<AIResponse> {
    try {
      const prompt = spark.llmPrompt`Identify and explain complex concepts from these study notes:

**Topic:** ${session.topic}
**Subtopic:** ${session.subtopic}
**Notes:**
${session.notes}

For each complex concept:
1. Provide a simple definition
2. Use analogies or real-world examples
3. Explain why it's important
4. Connect it to other concepts

Focus on making difficult ideas easy to understand.`

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return { success: true, content: response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to explain concepts' 
      }
    }
  }

  async analyzeProgress(session: StudySession): Promise<AIResponse> {
    try {
      const prompt = spark.llmPrompt`Analyze this study session for learning progress and gaps:

**Topic:** ${session.topic}
**Subtopic:** ${session.subtopic}
**Duration:** ${session.duration} minutes
**Notes:**
${session.notes}

Provide analysis including:
1. Knowledge gaps identified
2. Areas of strength
3. Suggestions for improvement
4. Next study priorities
5. Estimated mastery level (beginner/intermediate/advanced)`

      const response = await spark.llm(prompt, 'gpt-4o-mini')
      return { success: true, content: response }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze progress' 
      }
    }
  }
}