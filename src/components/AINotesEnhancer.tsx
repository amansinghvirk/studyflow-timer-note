import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { AppSettings } from '../App'

interface EnhancementStep {
  id: string
  title: string
  description: string
  enabled: boolean
}

interface AINotesEnhancerProps {
  notes: string
  topic: string
  settings: AppSettings
  onClose: () => void
  onEnhanced: (enhancedNotes: string) => void
  isOpen: boolean
}

const enhancementSteps: EnhancementStep[] = [
  {
    id: 'summary',
    title: 'Create Summary',
    description: 'Generate a concise summary at the start of notes',
    enabled: true
  },
  {
    id: 'rewrite',
    title: 'Rewrite Clearly',
    description: 'Rewrite content clearly while keeping all major points',
    enabled: true
  },
  {
    id: 'insights',
    title: 'Generate Key Insights',
    description: 'Add key insights and takeaways at the end',
    enabled: true
  },
  {
    id: 'questions',
    title: 'Questions & Answers',
    description: 'Generate relevant questions and answers about the content',
    enabled: true
  },
  {
    id: 'visuals',
    title: 'Add Visual Elements',
    description: 'Suggest visual elements and formatting improvements',
    enabled: true
  }
]

export function AINotesEnhancer({
  notes,
  topic,
  settings,
  onClose,
  onEnhanced,
  isOpen
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [enhancedContent, setEnhancedContent] = useState('')
  const [progress, setProgress] = useState(0)

  const enhanceNotes = async () => {
    if (!settings.aiSettings?.enabled || !settings.aiSettings?.apiKey) {
      toast.error('AI settings not configured. Please check your settings.')
      return
    }

    setIsEnhancing(true)
    setProgress(0)
    
    try {
      const enabledSteps = enhancementSteps.filter(step => step.enabled)
      let result = notes
      
      for (let i = 0; i < enabledSteps.length; i++) {
        const step = enabledSteps[i]
        setCurrentStep(i)
        setProgress(((i + 1) / enabledSteps.length) * 100)
        
        const prompt = spark.llmPrompt`
          You are an expert academic note enhancer. Please enhance the following study notes for the topic "${topic}".
          
          Current notes:
          ${result}
          
          Enhancement task: ${step.description}
          
          Please provide the enhanced version with the following requirements:
          - Keep all original information and key points
          - Improve clarity and organization
          - ${step.id === 'summary' ? 'Add a clear summary at the beginning' : ''}
          ${step.id === 'rewrite' ? 'Rewrite for better clarity and flow' : ''}
          ${step.id === 'insights' ? 'Add key insights section at the end' : ''}
          ${step.id === 'questions' ? 'Add Q&A section with relevant questions and answers' : ''}
          ${step.id === 'visuals' ? 'Suggest visual elements using markdown formatting (tables, lists, emphasis)' : ''}
          
          Return only the enhanced notes content in markdown format.
        `
        
        try {
          const response = await spark.llm(prompt, settings.aiSettings.model)
          result = response
          
          // Add a small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Error in step ${step.id}:`, error)
          toast.error(`Failed to complete step: ${step.title}`)
          break
        }
      }
      
      setEnhancedContent(result)
      setProgress(100)
      toast.success('Notes enhanced successfully!')
      
    } catch (error) {
      console.error('Enhancement error:', error)
      toast.error('Failed to enhance notes. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleApplyEnhancements = () => {
    if (enhancedContent) {
      onEnhanced(enhancedContent)
      onClose()
      toast.success('Enhanced notes applied!')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Notes Enhancement</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 overflow-hidden">
          {!isEnhancing && !enhancedContent && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                AI will enhance your notes with the following improvements:
              </p>
              
              <div className="grid gap-2">
                {enhancementSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={enhanceNotes} className="flex-1">
                  Enhance Notes with AI
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {isEnhancing && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Enhancing your notes...</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Step {currentStep + 1} of {enhancementSteps.length}: {enhancementSteps[currentStep]?.title}
                </p>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          )}
          
          {enhancedContent && !isEnhancing && (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Enhanced Notes Preview</h3>
                <div className="flex gap-2">
                  <Button onClick={handleApplyEnhancements}>
                    Apply Enhancements
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {enhancedContent}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}