/**
 * AI Prompts Module
 * 
 * This file contains structured prompts for various AI-powered features
 * in the StudyFlow application. Each prompt is designed to work with
 * Google's Gemini models to enhance study notes and provide insights.
 */

export interface AIPrompt {
  id: string
  name: string
  description: string
  category: 'enhancement' | 'analysis' | 'generation' | 'summary'
  prompt: string
}

export const DEFAULT_PROMPTS: AIPrompt[] = [
  {
    id: 'enhance-notes',
    name: 'Enhance Study Notes',
    description: 'Improve the structure and clarity of study notes',
    category: 'enhancement',
    prompt: `Please enhance these study notes by improving their structure, clarity, and comprehensiveness. Add relevant details, examples, and organize the content logically. Maintain the original meaning while making the notes more effective for learning.

Original Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide enhanced notes that maintain the original content while making it more structured and comprehensive.`
  },
  {
    id: 'summarize-session',
    name: 'Summarize Session',
    description: 'Create a concise summary of study session notes',
    category: 'summary',
    prompt: `Please create a concise summary of this study session. Focus on the key points, main concepts, and important takeaways. The summary should be easy to review and help with quick revision.

Original Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide:
1. Key learning objectives
2. Main concepts covered
3. Important definitions
4. Key takeaways`
  },
  {
    id: 'generate-study-plan',
    name: 'Generate Study Plan',
    description: 'Create a study plan based on notes and topic',
    category: 'generation',
    prompt: `Based on these study notes, please generate a comprehensive study plan that includes review schedules, practice exercises, and recommended study sequences.

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide a practical, actionable study plan with specific recommendations.`
  },
  {
    id: 'analyze-knowledge-gaps',
    name: 'Analyze Knowledge Gaps',
    description: 'Identify areas that need more focus',
    category: 'analysis',
    prompt: `Please analyze these study notes to identify potential knowledge gaps, areas that need more detail, and concepts that might benefit from additional examples or explanation.

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide:
1. Identified knowledge gaps
2. Areas needing more detail
3. Suggested additional resources
4. Concepts requiring clarification`
  }
]

/**
 * Replace placeholders in a prompt template with actual values
 */
export function formatPrompt(
  prompt: string, 
  variables: { notes: string; topic: string; subtopic: string }
): string {
  return prompt
    .replace(/{notes}/g, variables.notes)
    .replace(/{topic}/g, variables.topic)
    .replace(/{subtopic}/g, variables.subtopic)
}

/**
 * Get a prompt by its ID
 */
export function getPromptById(id: string): AIPrompt | undefined {
  return DEFAULT_PROMPTS.find(prompt => prompt.id === id)
}

/**
 * Get all available prompt categories
 */
export function getPromptCategories(): AIPrompt['category'][] {
  return Array.from(new Set(DEFAULT_PROMPTS.map(prompt => prompt.category)))
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: AIPrompt['category']): AIPrompt[] {
  return DEFAULT_PROMPTS.filter(prompt => prompt.category === category)
}