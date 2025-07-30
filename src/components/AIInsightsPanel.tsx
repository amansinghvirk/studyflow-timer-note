import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  MagicWand, 
  Brain, 
  QuestionMark, 
  ChartBar, 
  Lightbulb, 
  NotePencil,
  Sparkle,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StudyFlowAI } from '@/lib/ai'
import type { StudySession, AppSettings } from '@/App'

interface AIInsightsPanelProps {
  session: StudySession
  settings: AppSettings
  open: boolean
  onOpenChange: (open: boolean) => void
}

type InsightType = 'enhance' | 'summarize' | 'quiz' | 'explain' | 'analyze'

interface InsightResult {
  type: InsightType
  content: string
  timestamp: Date
}

export function AIInsightsPanel({ session, settings, open, onOpenChange }: AIInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<InsightType>('enhance')
  const [loading, setLoading] = useState<Record<InsightType, boolean>>({
    enhance: false,
    summarize: false,
    quiz: false,
    explain: false,
    analyze: false
  })
  const [insights, setInsights] = useState<Record<InsightType, InsightResult | null>>({
    enhance: null,
    summarize: null,
    quiz: null,
    explain: null,
    analyze: null
  })

  // Check if AI is properly configured
  const isAIConfigured = settings?.aiSettings?.enabled && 
                        settings?.aiSettings?.apiKey && 
                        session?.notes?.trim()

  if (!isAIConfigured) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Brain className="text-violet-600" size={20} />
              AI Insights
            </DialogTitle>
            <DialogDescription className="font-ui">
              {!settings?.aiSettings?.enabled 
                ? 'AI features are not enabled. Enable them in Settings to get insights.'
                : !settings?.aiSettings?.apiKey 
                ? 'AI API key is not configured. Set it up in Settings.'
                : 'No notes found for this session.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const generateInsight = async (type: InsightType) => {
    if (!isAIConfigured) return

    setLoading(prev => ({ ...prev, [type]: true }))
    
    try {
      const aiConfig = {
        apiKey: settings.aiSettings.apiKey,
        model: settings.aiSettings.model || 'gemini-1.5-flash',
        temperature: settings.aiSettings.temperature || 0.7,
        maxTokens: settings.aiSettings.maxTokens || 1000
      }

      const ai = new StudyFlowAI(aiConfig)
      let result

      switch (type) {
        case 'enhance':
          result = await ai.enhanceNotes(session)
          break
        case 'summarize':
          result = await ai.summarizeSession(session)
          break
        case 'quiz':
          result = await ai.generateQuiz(session)
          break
        case 'explain':
          result = await ai.explainConcepts(session)
          break
        case 'analyze':
          result = await ai.analyzeProgress(session)
          break
        default:
          throw new Error('Unknown insight type')
      }

      if (result.success && result.content) {
        setInsights(prev => ({
          ...prev,
          [type]: {
            type,
            content: result.content,
            timestamp: new Date()
          }
        }))
        toast.success(`${getInsightTitle(type)} generated successfully!`)
      } else {
        toast.error(result.error || 'Failed to generate insights')
      }
    } catch (error) {
      console.error('AI insight error:', error)
      toast.error('Failed to generate AI insights')
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const getInsightTitle = (type: InsightType): string => {
    const titles = {
      enhance: 'Enhanced Notes',
      summarize: 'Session Summary',
      quiz: 'Practice Quiz',
      explain: 'Concept Explanations',
      analyze: 'Progress Analysis'
    }
    return titles[type]
  }

  const getInsightDescription = (type: InsightType): string => {
    const descriptions = {
      enhance: 'AI-improved version of your notes with better structure and clarity',
      summarize: 'Concise summary of key learning objectives and takeaways',
      quiz: 'Practice questions to test your understanding of the material',
      explain: 'Simplified explanations of complex concepts with examples',
      analyze: 'Analysis of your learning progress and areas for improvement'
    }
    return descriptions[type]
  }

  const getInsightIcon = (type: InsightType) => {
    const icons = {
      enhance: NotePencil,
      summarize: ChartBar,
      quiz: QuestionMark,
      explain: Lightbulb,
      analyze: Brain
    }
    const Icon = icons[type]
    return <Icon size={16} />
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Content copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display flex items-center gap-2">
            <Sparkle className="text-violet-600" size={20} />
            AI Insights for {session.topic} - {session.subtopic}
          </DialogTitle>
          <DialogDescription className="font-ui">
            Get AI-powered insights to enhance your learning experience
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InsightType)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
              <TabsTrigger value="enhance" className="flex items-center gap-1 font-ui text-xs">
                <NotePencil size={12} />
                Enhance
              </TabsTrigger>
              <TabsTrigger value="summarize" className="flex items-center gap-1 font-ui text-xs">
                <ChartBar size={12} />
                Summary
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-1 font-ui text-xs">
                <QuestionMark size={12} />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="explain" className="flex items-center gap-1 font-ui text-xs">
                <Lightbulb size={12} />
                Explain
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-1 font-ui text-xs">
                <Brain size={12} />
                Analyze
              </TabsTrigger>
            </TabsList>

            {(['enhance', 'summarize', 'quiz', 'explain', 'analyze'] as InsightType[]).map((type) => (
              <TabsContent key={type} value={type} className="flex-1 overflow-hidden mt-4">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-lg flex items-center gap-2">
                          {getInsightIcon(type)}
                          {getInsightTitle(type)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-ui mt-1">
                          {getInsightDescription(type)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {insights[type] && (
                          <Badge variant="outline" className="text-xs">
                            Generated {insights[type]!.timestamp.toLocaleTimeString()}
                          </Badge>
                        )}
                        <Button
                          onClick={() => generateInsight(type)}
                          disabled={loading[type]}
                          size="sm"
                          className="flex items-center gap-1 font-ui"
                        >
                          {loading[type] ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MagicWand size={14} />
                          )}
                          {loading[type] ? 'Generating...' : 'Generate'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-hidden">
                    {insights[type] ? (
                      <div className="h-full flex flex-col">
                        <div className="flex justify-end mb-3">
                          <Button
                            onClick={() => copyToClipboard(insights[type]!.content)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 font-ui text-xs"
                          >
                            Copy
                          </Button>
                        </div>
                        <ScrollArea className="flex-1 h-full">
                          <div className="prose prose-sm max-w-none font-ui whitespace-pre-wrap">
                            {insights[type]!.content}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-muted-foreground mb-3">
                            {getInsightIcon(type)}
                          </div>
                          <p className="text-sm text-muted-foreground font-ui">
                            Click "Generate" to get AI insights for this session
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="flex justify-end mt-4 flex-shrink-0">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="font-ui">
            <X size={16} className="mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}