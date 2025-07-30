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
4. Critical points to remember
5. Areas for further study`
  },
  {
    id: 'generate-questions',
    name: 'Generate Study Questions',
    description: 'Create practice questions based on study notes',
    category: 'generation',
    prompt: `Based on the following study notes, please generate a comprehensive set of practice questions that will help reinforce learning. Include:

1. Multiple choice questions (4-5 options each)
2. Short answer questions
3. True/false questions
4. Essay/discussion questions

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please create questions that cover key concepts, test understanding, and encourage deeper thinking about the material.`
  },
  {
    id: 'explain-concepts',
    name: 'Explain Complex Concepts',
    description: 'Break down complex ideas into simpler explanations',
    category: 'analysis',
    prompt: `Please identify the most complex concepts in these study notes and provide clear, simplified explanations. For each complex concept, include:

1. A simple definition in plain language
2. Real-world examples or analogies
3. Why this concept is important
4. How it relates to other concepts in the topic

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Make the explanations accessible and easy to understand for someone learning this material for the first time.`
  },
  {
    id: 'create-study-plan',
    name: 'Create Study Plan',
    description: 'Generate a structured study plan based on the notes',
    category: 'generation',
    prompt: `Based on these study notes, create a comprehensive study plan that will help effectively learn and retain this material. Include:

1. Learning objectives
2. Recommended study sequence
3. Time allocation suggestions
4. Review schedule
5. Practice activities
6. Assessment methods

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide a practical, actionable study plan that can be followed over multiple study sessions.`
  }
]

/**
 * Replace placeholders in a prompt template with actual values
 */
export function replacePromptPlaceholders(
  prompt: string, 
  replacements: Record<string, string>
): string {
  let result = prompt
  
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return result
}

/**
 * Get a prompt by ID
 */
export function getPromptById(id: string): AIPrompt | undefined {
  return DEFAULT_PROMPTS.find(prompt => prompt.id === id)
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: AIPrompt['category']): AIPrompt[] {
  return DEFAULT_PROMPTS.filter(prompt => prompt.category === category)
}

/**
 * Get all available prompt categories
 */
export function getPromptCategories(): AIPrompt['category'][] {
  return ['enhancement', 'analysis', 'generation', 'summary']
}