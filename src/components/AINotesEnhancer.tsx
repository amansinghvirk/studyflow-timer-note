import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-
import { toast } from 'sonner'

  isOpen: boolean
  notes: string
  subtopic: string
  onSave: (enhancedNotes: string) => voi

  id: string
  description: st
  enabled: boolean

  isOpen, 
  subtopic: string
  settings: AppSettings
  onSave: (enhancedNotes: string) => void
}

interface EnhancementOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

export function AINotesEnhancer({ 
  isOpen, 
  onClose, 
      ena
  topic, 
      id: 'r
  settings, 
      ico
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [enhancedNotes, setEnhancedNotes] = useState('')
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOption[]>([
     
  }
  const enhanceNotes = async (
      toast.error('AI features not configured')
    }
    if (!notes.trim
      

    setProgress(0)

      const enabledOptions = enhancementOptions.filter(option => opt
      let enhancementOutput = ''
      // Step 1: Cr
      
     



        if (summary) {
        }

     
        setProgress(40
        const rewritePrompt
${notes}
Requirements:
- Improve structure
- Add 

        if (rewritte
        } else {
        }
        enhancementOutput += `## 📝 Study Notes\n\n${notes}\n\

     
    

${notes}
Generate 3-5 key insights that:
- Explain connections bet
- Suggest practical application
Format as a bulleted list with brief explanations.`
        const insi
       
     
   

        


- Test under
- Enc


        if (qa) {
        }


        setProgress(95)
        const visu
${notes}

- Charts 
- Visual metaphors or analogies
      let enhanced = notes
      let enhancementOutput = ''

      // Step 1: Create Summary (if enabled)
      if (enabledOptions.find(opt => opt.id === 'summary')) {
        setCurrentStep('Creating summary...')
        setProgress(20)
        
        const summaryPrompt = spark.llmPrompt`Create a concise summary for these study notes on ${topic} - ${subtopic}:

${notes}

Provide a 2-3 sentence summary that captures the main concepts. Format it as a proper summary section.`

        const summary = await spark.llm(summaryPrompt, 'gpt-4o-mini')
        if (summary) {
          enhancementOutput += `## 📋 Summary\n\n${summary}\n\n---\n\n`
        d
      }

      // Step 2: Rewrite and Clarify (if enabled)
      if (enabledOptions.find(opt => opt.id === 'rewrite')) {
        setCurrentStep('Rewriting and clarifying content...')
        setProgress(40)
      on
        const rewritePrompt = spark.llmPrompt`Rewrite these study notes on ${topic} - ${subtopic} for better clarity and organization while keeping ALL major points:

${notes}

Requirements:
- Keep all important information and details
- Improve structure and flow
- Use clear, concise language
- Add appropriate headings and bullet points
- Maintain the original meaning and depth`

        const rewritten = await spark.llm(rewritePrompt, 'gpt-4o-mini')
        if (rewritten) {
          enhancementOutput += `## 📝 Study Notes\n\n${rewritten}\n\n`
        } else {
          enhancementOutput += `## 📝 Study Notes\n\n${notes}\n\n`
        }
      } else {
        enhancementOutput += `## 📝 Study Notes\n\n${notes}\n\n`
      }

      // Step 3: Generate Key Insights (if enabled)
      if (enabledOptions.find(opt => opt.id === 'insights')) {
        setCurrentStep('Generating key insights...')
        setProgress(60)
        
        const insightsPrompt = spark.llmPrompt`Analyze these study notes on ${topic} - ${subtopic} and provide key insights:

${notes}

Generate 3-5 key insights that:
- Highlight the most important concepts
- Explain connections between ideas
- Provide deeper understanding
- Suggest practical applications

Format as a bulleted list with brief explanations.`

        const insights = await spark.llm(insightsPrompt, 'gpt-4o-mini')
        if (insights) {
          enhancementOutput += `---\n\n## 🧠 Key Insights\n\n${insights}\n\n`
        }
      }

      // Step 4: Generate Q&A (if enabled)
      if (enabledOptions.find(opt => opt.id === 'questions')) {
        setCurrentStep('Creating questions and answers...')
        setProgress(80)
        
        const qaPrompt = spark.llmPrompt`Based on these study notes on ${topic} - ${subtopic}, create important questions and their answers:

${notes}

Generate 3-5 key questions that:
- Test understanding of main concepts
- Explore practical applications
- Encourage critical thinking
- Help with exam preparation

Format as Q&A pairs with clear, comprehensive answers.`

        const qa = await spark.llm(qaPrompt, 'gpt-4o-mini')
        if (qa) {
          enhancementOutput += `---\n\n## ❓ Key Questions & Answers\n\n${qa}\n\n`
        }
      }

      // Step 5: Add Visual Suggestions (if enabled)
      if (enabledOptions.find(opt => opt.id === 'visuals')) {
        setCurrentStep('Adding visual suggestions...')
        setProgress(95)
        
        const visualPrompt = spark.llmPrompt`Suggest visual elements for these study notes on ${topic} - ${subtopic}:

${notes}

Suggest:
- Diagrams that would help illustrate concepts
- Charts or graphs for data visualization
- Mind maps for concept relationships
- Visual metaphors or analogies
- Color coding suggestions

Format as practical visual suggestions with descriptions.`

        const visuals = await spark.llm(visualPrompt, 'gpt-4o-mini')
        if (visuals) {
          enhancementOutput += `---\n\n## 🎨 Visual Enhancement Suggestions\n\n${visuals}\n\n`
        }
      }

      setProgress(100)
      setCurrentStep('Enhancement complete!')
      setEnhancedNotes(enhancementOutput)
      
      toast.success('Notes enhanced successfully!', {
        description: 'Review the enhanced notes and save if satisfied'
      })

    } catch (error) {
      console.error('Notes enhancement error:', error)
      toast.error('Failed to enhance notes', {
        description: 'Please try again or check your AI settings'
      })
    } finally {
      setIsEnhancing(false)
     
  }

  const handleSave = () => {
              <Sparkle s
      onSave(enhancedNotes)
      toast.success('Enhanced notes saved!')
      onClose()
            
      onSave(notes) // Save original notes if no enhancement
      onClose()
    }
   

  const handleCancel = () => {
    setEnhancedNotes('')
              Save
    setCurrentStep('')




































































































































