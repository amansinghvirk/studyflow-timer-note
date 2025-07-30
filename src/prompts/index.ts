/**
 * AI Prompts Module
 * 
 * This file contains structured prompts for various AI-powered features
 * that help improve study notes and provide insights.
 */

export interface AIPromptTemplate {
  id: string
  name: string
  description: string
  category: 'enhancement' | 'summary' | 'quiz' | 'explanation' | 'analysis'
  prompt: string
}

export const defaultPrompts: AIPromptTemplate[] = [
  {
    id: 'enhance-notes',
    name: 'Enhance Study Notes',
    description: 'Improve clarity, structure, and add missing key concepts',
    category: 'enhancement',
    prompt: `As an expert study assistant, please analyze and enhance the following study notes. Your goal is to:

1. Improve clarity and readability
2. Add structure with proper headings and bullet points
3. Identify and fill in any knowledge gaps
4. Add relevant examples or analogies where helpful
5. Suggest connections to related concepts
6. Ensure the content is comprehensive yet concise

Original Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide enhanced notes that maintain the original content while making it more structured and comprehensive.`
  },
  {
    id: 'summarize-session',
    name: 'Summarize Session',
    description: 'Create a structured summary of the study session',
    category: 'summary',
    prompt: `Create a comprehensive summary of this study session:

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide a structured summary including:
1. Key learning objectives
2. Main concepts covered
3. Important definitions
4. Key takeaways
5. Areas for further study`
  },
  {
    id: 'generate-quiz',
    name: 'Generate Practice Quiz',
    description: 'Create practice questions based on study notes',
    category: 'quiz',
    prompt: `Based on the following study notes, please generate a comprehensive practice quiz:

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please create:
1. 3-4 Multiple choice questions (with 4 options each)
2. 2-3 Short answer questions
3. 1-2 Essay/discussion questions

Format clearly with question numbers and answer choices for multiple choice.`
  },
  {
    id: 'explain-concepts',
    name: 'Explain Complex Concepts',
    description: 'Break down complex ideas into simpler explanations',
    category: 'explanation',
    prompt: `Please identify the most complex concepts in these study notes and provide clear, simplified explanations:

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

For each complex concept, include:
1. A simple definition in plain language
2. Analogies and real-world examples
3. Step-by-step breakdowns where applicable
4. Common misconceptions to avoid

Focus on making difficult concepts accessible and easy to understand.`
  },
  {
    id: 'analyze-progress',
    name: 'Analyze Learning Progress',
    description: 'Assess knowledge gaps and suggest improvements',
    category: 'analysis',
    prompt: `Please analyze these study notes and provide a learning progress assessment:

Study Notes:
{notes}

Topic: {topic}
Subtopic: {subtopic}

Please provide:
1. Knowledge gaps identified
2. Areas of strength shown in the notes
3. Suggestions for improvement
4. Priority topics for further study
5. Estimated understanding level (beginner/intermediate/advanced)
6. Recommended next steps`
  }
]

export function getPromptById(id: string): AIPromptTemplate | undefined {
  return defaultPrompts.find(prompt => prompt.id === id)
}

export function getPromptsByCategory(category: AIPromptTemplate['category']): AIPromptTemplate[] {
  return defaultPrompts.filter(prompt => prompt.category === category)
}

export function formatPrompt(template: AIPromptTemplate, variables: Record<string, string>): string {
  let formattedPrompt = template.prompt
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    formattedPrompt = formattedPrompt.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return formattedPrompt
}