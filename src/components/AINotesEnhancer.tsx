import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, Wand2, Download, X, FileText, List, Lightbulb, Eye } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { AppSettings } from '../App'

interface EnhancementOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface AINotesEnhancerProps {
  isOpen: boolean
  notes: string
  topic: string
  subtopic: string
  settings: AppSettings
  onSave: (enhancedNotes: string) => void
  onClose: () => void
}

export function AINotesEnhancer({
  isOpen,
  notes,
  topic,
  subtopic,
  settings,
  onSave,
  onClose
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [enhancedNotes, setEnhancedNotes] = useState('')
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOption[]>([
    {
      id: 'summary',
      title: 'Create Summary',
      description: 'Add a concise summary at the beginning',
      icon: <FileText size={16} />,
      enabled: true
    },
    {
      id: 'rewrite',
      title: 'Rewrite & Clarify',
      description: 'Improve structure and clarity while keeping all points',
      icon: <Wand2 size={16} />,
      enabled: true
    },
    {
      id: 'insights',
      title: 'Key Insights',
      description: 'Generate important insights and connections',
      icon: <Lightbulb size={16} />,
      enabled: true
    },
    {
      id: 'questions',
      title: 'Q&A Generation',
      description: 'Create questions and answers for better understanding',
      icon: <List size={16} />,
      enabled: true
    },
    {
      id: 'visuals',
      title: 'Visual Suggestions',
      description: 'Suggest diagrams and visual aids',
      icon: <Eye size={16} />,
      enabled: false
    }
  ])

  const enhanceNotes = async () => {
    if (!settings.aiSettings?.enabled || !settings.aiSettings?.apiKey) {
      toast.error('AI enhancement not available', {
        description: 'Please configure AI settings first'
      })
      return
    }

    setIsEnhancing(true)
    setProgress(0)
    setCurrentStep('Initializing enhancement...')
    
    try {
      const enabledOptions = enhancementOptions.filter(opt => opt.enabled)
      if (enabledOptions.length === 0) {
        toast.error('No enhancement options selected')
        return
      }
      
      let enhancementOutput = ''
      
      // Step 1: Create Summary (if enabled)
      if (enabledOptions.find(opt => opt.id === 'summary')) {
        setCurrentStep('Creating summary...')
        setProgress(20)
        
        const summaryPrompt = spark.llmPrompt`Summarize these study notes on ${topic} - ${subtopic}:

${notes}

Provide a 2-3 sentence summary that captures the main concepts. Format it as a proper summary section.`

        const summary = await spark.llm(summaryPrompt, settings.aiSettings?.model)
        if (summary) {
          enhancementOutput += `## 📋 Summary\n\n${summary}\n\n---\n\n`
        }
      }

      // Step 2: Rewrite and Clarify (if enabled)
      if (enabledOptions.find(opt => opt.id === 'rewrite')) {
        setCurrentStep('Rewriting and clarifying content...')
        setProgress(40)
        
        const rewritePrompt = spark.llmPrompt`Rewrite these study notes on ${topic} - ${subtopic} for better clarity and organization while keeping ALL major points:

${notes}

Requirements:
- Keep all important information and details
- Improve structure and flow
- Use clear, concise language
- Add appropriate headings and bullet points
- Maintain the original meaning and depth`

        const rewritten = await spark.llm(rewritePrompt, settings.aiSettings?.model)
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

        const insights = await spark.llm(insightsPrompt, settings.aiSettings?.model)
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

        const qa = await spark.llm(qaPrompt, settings.aiSettings?.model)
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

        const visuals = await spark.llm(visualPrompt, settings.aiSettings?.model)
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
        description: 'Please check your AI settings and try again'
      })
    } finally {
      setIsEnhancing(false)
      setProgress(0)
    }
  }

  const handleSave = () => {
    if (enhancedNotes) {
      onSave(enhancedNotes)
    } else {
      onSave(notes) // Save original notes if no enhancement
    }
    handleCancel()
  }

  const handleCancel = () => {
    setEnhancedNotes('')
    setProgress(0)
    setCurrentStep('')
    onClose()
  }

  const toggleOption = (optionId: string) => {
    setEnhancementOptions(current =>
      current.map(option =>
        option.id === optionId
          ? { ...option, enabled: !option.enabled }
          : option
      )
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} />
            AI Notes Enhancement
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {!enhancedNotes && !isEnhancing && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Enhancement Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enhancementOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleOption(option.id)}
                    >
                      <Checkbox
                        checked={option.enabled}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {option.icon}
                          <span className="font-medium text-sm">{option.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={enhanceNotes}
                  disabled={!enhancementOptions.some(opt => opt.enabled)}
                  className="flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Enhance Notes
                </Button>
              </div>
            </div>
          )}

          {isEnhancing && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles size={32} className="mx-auto mb-4 text-primary animate-pulse" />
                <h3 className="font-medium mb-2">Enhancing your notes...</h3>
                <p className="text-sm text-muted-foreground mb-4">{currentStep}</p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
              </div>
            </div>
          )}

          {enhancedNotes && !isEnhancing && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Enhanced Notes</h3>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles size={12} />
                  AI Enhanced
                </Badge>
              </div>
              
              <ScrollArea className="flex-1 border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: enhancedNotes.replace(/\n/g, '<br />').replace(/## /g, '<h2>').replace(/### /g, '<h3>') 
                  }} />
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Download size={16} />
                  Save Enhanced Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}