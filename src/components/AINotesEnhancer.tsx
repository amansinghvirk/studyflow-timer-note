import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, MagicWand, CheckCircle, Clock, Brain, QuestionMark, Image as ImageIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppSettings } from '@/App'

interface AINotesEnhancerProps {
  isOpen: boolean
  onClose: () => void
  notes: string
  topic: string
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
  notes, 
  topic, 
  subtopic, 
  settings, 
  onSave 
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
      icon: <CheckCircle size={16} className="text-green-600" />,
      enabled: true
    },
    {
      id: 'rewrite',
      title: 'Rewrite & Clarify',
      description: 'Improve clarity while keeping all major points',
      icon: <MagicWand size={16} className="text-blue-600" />,
      enabled: true
    },
    {
      id: 'insights',
      title: 'Key Insights',
      description: 'Generate key insights at the end',
      icon: <Brain size={16} className="text-purple-600" />,
      enabled: true
    },
    {
      id: 'questions',
      title: 'Q&A Section',
      description: 'Add key questions and answers',
      icon: <QuestionMark size={16} className="text-orange-600" />,
      enabled: true
    },
    {
      id: 'visuals',
      title: 'Visual Elements',
      description: 'Add visual suggestions and diagrams',
      icon: <ImageIcon size={16} className="text-teal-600" />,
      enabled: true
    }
  ])

  const toggleOption = (optionId: string) => {
    setEnhancementOptions(prev => 
      prev.map(option => 
        option.id === optionId 
          ? { ...option, enabled: !option.enabled }
          : option
      )
    )
  }

  const enhanceNotes = async () => {
    if (!settings?.aiSettings?.enabled || !settings?.aiSettings?.apiKey) {
      toast.error('AI features not configured')
      return
    }

    if (!notes.trim()) {
      toast.error('No notes to enhance')
      return
    }

    setIsEnhancing(true)
    setProgress(0)
    setCurrentStep('Initializing AI enhancement...')

    try {
      const enabledOptions = enhancementOptions.filter(option => option.enabled)
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
  }

  const handleSave = () => {
    if (enhancedNotes) {
      onSave(enhancedNotes)
      toast.success('Enhanced notes saved!')
      onClose()
    } else {
      onSave(notes) // Save original notes if no enhancement
      onClose()
    }
  }

  const handleCancel = () => {
    setEnhancedNotes('')
    setProgress(0)
    setCurrentStep('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkle size={20} className="text-violet-600" />
            AI Notes Enhancement
          </DialogTitle>
          <DialogDescription className="font-ui">
            Enhance your study notes with AI-powered improvements for {topic} - {subtopic}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!enhancedNotes && !isEnhancing && (
            <div className="space-y-6">
              {/* Enhancement Options */}
              <div className="space-y-4">
                <h3 className="font-medium font-ui">Select enhancements to apply:</h3>
                <div className="grid gap-3">
                  {enhancementOptions.map(option => (
                    <div key={option.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        checked={option.enabled}
                        onCheckedChange={() => toggleOption(option.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span className="font-medium font-ui">{option.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-ui">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Original Notes Preview */}
              <div className="space-y-2">
                <h3 className="font-medium font-ui">Current Notes Preview:</h3>
                <ScrollArea className="h-48 border rounded-lg p-4 bg-muted/20">
                  <div 
                    className="prose prose-sm max-w-none font-ui text-foreground"
                    dangerouslySetInnerHTML={{ __html: notes }}
                  />
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Enhancement Progress */}
          {isEnhancing && (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={20} className="text-violet-600 animate-pulse" />
                  <span className="font-medium font-ui">Enhancing your notes...</span>
                </div>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground font-ui">{currentStep}</p>
              </div>
            </div>
          )}

          {/* Enhanced Notes Preview */}
          {enhancedNotes && !isEnhancing && (
            <div className="space-y-4 h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-medium font-ui">Enhanced Notes:</h3>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle size={12} className="mr-1" />
                  Enhanced
                </Badge>
              </div>
              <ScrollArea className="flex-1 border rounded-lg p-4 bg-background">
                <div 
                  className="prose prose-sm max-w-none font-ui text-foreground"
                  dangerouslySetInnerHTML={{ __html: enhancedNotes.replace(/\n/g, '<br>') }}
                />
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            className="font-ui"
            disabled={isEnhancing}
          >
            Cancel
          </Button>
          
          {!enhancedNotes && !isEnhancing && (
            <Button 
              onClick={enhanceNotes} 
              className="font-ui"
              disabled={!enhancementOptions.some(opt => opt.enabled)}
            >
              <Sparkle size={16} className="mr-2" />
              Enhance Notes
            </Button>
          )}
          
          {enhancedNotes && !isEnhancing && (
            <Button onClick={handleSave} className="font-ui">
              <CheckCircle size={16} className="mr-2" />
              Save Enhanced Notes
            </Button>
          )}
          
          {!enhancedNotes && !isEnhancing && (
            <Button 
              onClick={() => onSave(notes)} 
              variant="secondary" 
              className="font-ui"
            >
              Save Original
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}