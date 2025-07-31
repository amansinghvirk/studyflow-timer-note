import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
  id: string
  description: string
  enabled: boolean
import { AppSettings } from '../App'

  topic: string
  settings: 
  onClose: () =

  isOpen,
  enabled: boolean
 

  const [isEnhancing, setIsEnhan
  const [currentS
  const [enhanc
  topic: string
      description:
      enabled: true
    {
      title: 'Rewrite
 

      id: 'insights',
  isOpen,
      en
  topic,
      title
      icon:
    },
      id:
}: AINotesEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [enhancedNotes, setEnhancedNotes] = useState('')
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOption[]>([
    }
    setIsEnhancing(t
    setCurrentStep('Initializi
    try {
      if (enabledOptions.length ===
        return
      
     
      if (enabledOpt
        setProgress(20)
        const summaryPrompt = spark.llmPrompt`Summarize these study notes on
${notes}
Provide a 2-3 sente
      
     
      }
      // Step 2: Rewrite and
        setCurrentStep('Rewriting and clarifying content...')
        


- Kee
- Use clear, concise l
- Maintain the original meanin
        const rewritten = await spark.llm(rewritePrompt, settings.aiSetting
          enhancementOutput += 
          enhanceme
      
     
      // Step 3: Gen
        setCurrentStep('Generating
        


    }
- Pr


        if (insights) {
        }

      if
      return
     

Generate 3-5 key questio
    setProgress(0)
- Help with exam preparation
Form
    try {
          enhancementOutput += `---\n\n## ❓ Key Questions & Answers\n\n${q
      }
      // Step 5: Add Visual Suggestions (if enabled)
        setCur
       


- Diag
- Mind maps for concept relationships
- Color coding suggestions
Format as practical visual suggestions with d
        const visuals =
        
      }

${notes}

Provide a 2-3 sentence summary that captures the main concepts. Format it as a proper summary section.`

      toast.error('Failed to enhance notes', {
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

          )}
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

      })
    } finally {
      setIsEnhancing(false)


  }

  const handleSave = () => {

      onSave(enhancedNotes)

      onSave(notes) // Save original notes if no enhancement
    }




    setEnhancedNotes('')
    setProgress(0)
    setCurrentStep('')
    onClose()
  }

  const toggleOption = (optionId: string) => {
    setEnhancementOptions(current =>
      current.map(option =>

          ? { ...option, enabled: !option.enabled }

      )

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">

            AI Notes Enhancement

        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {!enhancedNotes && !isEnhancing && (
            <div className="space-y-4">

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

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel

                <Button 
                  onClick={enhanceNotes}
                  disabled={!enhancementOptions.some(opt => opt.enabled)}
                  className="flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Enhance Notes
                </Button>
              </div>

          )}

          {isEnhancing && (

              <div className="text-center">
                <Sparkles size={32} className="mx-auto mb-4 text-primary animate-pulse" />
                <h3 className="font-medium mb-2">Enhancing your notes...</h3>
                <p className="text-sm text-muted-foreground mb-4">{currentStep}</p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />

            </div>


          {enhancedNotes && !isEnhancing && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Enhanced Notes</h3>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles size={12} />

                </Badge>

              
              <ScrollArea className="flex-1 border rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: enhancedNotes.replace(/\n/g, '<br />').replace(/## /g, '<h2>').replace(/### /g, '<h3>') 
                  }} />
                </div>


              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  <X size={16} className="mr-2" />
                  Cancel

                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Download size={16} />
                  Save Enhanced Notes
                </Button>
              </div>

          )}

      </DialogContent>

  )
}