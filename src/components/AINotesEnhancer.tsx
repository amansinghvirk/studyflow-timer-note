import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { AppSettings } from '../App'

interface AINotesEnhancerProps {
  isOpen: boolean
  onClose: () => void
  notes: string
  topic: string
  subtopic: string
  settings: AppSettings
  onSave: (enhancedNotes: string) => void
}

interface EnhancementStep {
  id: string
  title: string
  description: string
  enabled: boolean
}

const enhancementSteps: EnhancementStep[] = [
  {
    id: 'summary',
    title: 'Summary',
    description: 'Create a concise summary at the start',
    enabled: true
  },
  {
    id: 'rewrite',
    title: 'Clarity Rewrite',
    description: 'Rewrite for clarity while keeping all major points',
    enabled: true
  },
  {
    id: 'insights',
    title: 'Key Insights',
    description: 'Add key insights and takeaways at the end',
    enabled: true
  },
  {
    id: 'questions',
    title: 'Q&A Generation',
    description: 'Generate relevant questions and answers',
    enabled: true
  }
]

export function AINotesEnhancer({
  isOpen,
  onClose,
  notes,
  topic,
  subtopic,
  settings,
  onSave
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [enhancedContent, setEnhancedContent] = useState('')

  const enhanceNotes = async () => {
    if (!settings.aiSettings?.enabled || !settings.aiSettings?.apiKey) {
      toast.error('AI is not configured. Please set up AI in Settings.')
      return
    }

    setIsEnhancing(true)
    setProgress(0)
    
    try {
      const enabledSteps = enhancementSteps.filter(step => step.enabled)
      let result = notes
      
      for (let i = 0; i < enabledSteps.length; i++) {
        const step = enabledSteps[i]
        setCurrentStep(step.title)
        setProgress((i / enabledSteps.length) * 100)
        
        const prompt = spark.llmPrompt`
          Topic: ${topic}
          Subtopic: ${subtopic}
          Current Notes: ${result}
          
          Enhancement Request: ${step.id}
          ${step.id === 'summary' ? 'Add a concise summary at the beginning of these notes.' : ''}
          ${step.id === 'rewrite' ? 'Rewrite these notes for better clarity and organization while keeping all major points.' : ''}
          ${step.id === 'insights' ? 'Add key insights and takeaways at the end of these notes.' : ''}
          ${step.id === 'questions' ? 'Generate 3-5 relevant questions and answers based on these notes and add them at the end.' : ''}
          
          Return only the enhanced notes content, nothing else.
        `
        
        try {
          const enhancement = await spark.llm(prompt, settings.aiSettings.model || 'gemini-1.5-flash')
          result = enhancement
        } catch (error) {
          console.error(`Error enhancing notes at step ${step.title}:`, error)
          toast.error(`Failed to enhance notes at step: ${step.title}`)
        }
      }
      
      setEnhancedContent(result)
      setProgress(100)
      setCurrentStep('Complete')
      
    } catch (error) {
      console.error('Error enhancing notes:', error)
      toast.error('Failed to enhance notes. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSave = () => {
    if (enhancedContent) {
      onSave(enhancedContent)
      onClose()
      toast.success('Enhanced notes saved!')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Notes Enhancement</DialogTitle>
        </DialogHeader>

        {!isEnhancing && !enhancedContent && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              AI will enhance your notes with the following improvements:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enhancementSteps.map((step) => (
                <Card key={step.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                Current step: {currentStep}
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        )}

        {enhancedContent && !isEnhancing && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Enhanced Notes Preview</h3>
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  Apply Enhancements
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 border rounded-lg p-4 max-h-[400px]">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {enhancedContent}
                </pre>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}