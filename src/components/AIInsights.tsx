import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, Lightbulb, List, Question, BookOpen, TrendUp, Sparkle, Copy, Check } from '@phosphor-icons/react'
import { StudyFlowAI, type AIResponse } from '@/lib/ai'
import { DEFAULT_PROMPTS, type AIPrompt } from '@/prompts'
import { toast } from 'sonner'
import type { StudySession, AppSettings } from '@/App'

interface AIInsightsProps {
  session: StudySession
  settings: AppSettings
}

export function AIInsights({ session, settings }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string>('enhance-notes')
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isAIConfigured = settings.aiSettings?.enabled && settings.aiSettings?.apiKey.trim() !== ''

  const getPromptIcon = (category: AIPrompt['category']) => {
    switch (category) {
      case 'enhancement': return <Sparkle size={16} />
      case 'summary': return <List size={16} />
      case 'generation': return <Question size={16} />
      case 'analysis': return <TrendUp size={16} />
      default: return <Brain size={16} />
    }
  }

  const getPromptColor = (category: AIPrompt['category']) => {
    switch (category) {
      case 'enhancement': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'summary': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'generation': return 'bg-green-100 text-green-700 border-green-200'
      case 'analysis': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const runAIPrompt = async () => {
    if (!isAIConfigured) {
      toast.error('AI is not configured. Please set up your API key in Settings.')
      return
    }

    if (!session.notes.trim()) {
      toast.error('No notes found for this session')
      return
    }

    setIsLoading(true)
    setResponse(null)

    try {
      const ai = new StudyFlowAI({
        apiKey: settings.aiSettings?.apiKey || '',
        model: settings.aiSettings?.model || 'gemini-1.5-flash',
        temperature: settings.aiSettings?.temperature || 0.7,
        maxTokens: settings.aiSettings?.maxTokens || 4096
      })

      let result: AIResponse

      switch (selectedPrompt) {
        case 'enhance-notes':
          result = await ai.enhanceNotes(session)
          break
        case 'summarize-session':
          result = await ai.summarizeSession(session)
          break
        case 'generate-questions':
          result = await ai.generateQuiz(session)
          break
        case 'explain-concepts':
          result = await ai.explainConcepts(session)
          break
        case 'create-study-plan':
          result = await ai.analyzeProgress(session)
          break
        default:
          throw new Error('Unknown prompt selected')
      }

      setResponse(result)

      if (result.success) {
        toast.success('AI analysis completed!')
      } else {
        toast.error(`AI analysis failed: ${result.error}`)
      }
    } catch (error) {
      console.error('AI prompt error:', error)
      toast.error('Failed to get AI insights')
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!response?.content) return

    try {
      await navigator.clipboard.writeText(response.content)
      setCopied(true)
      toast.success('Response copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const selectedPromptTemplate = DEFAULT_PROMPTS.find(p => p.id === selectedPrompt)

  if (!isAIConfigured) {
    return (
      <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
        <Brain size={16} className="text-muted-foreground" />
        <span className="hidden sm:inline">AI Setup Required</span>
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-200">
          <Brain size={16} className="text-purple-600" />
          <span className="hidden sm:inline">AI Insights</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Brain size={20} className="text-purple-600" />
            AI Study Insights
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">{session.topic}</Badge>
                <Badge variant="outline">{session.subtopic}</Badge>
                <Badge variant="outline">{session.duration} minutes</Badge>
                <Badge variant="outline">
                  {new Date(session.completedAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium font-ui">Choose AI Analysis Type:</label>
            <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_PROMPTS.map(prompt => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <div className="flex items-center gap-2">
                      {getPromptIcon(prompt.category)}
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{prompt.name}</span>
                        <span className="text-xs text-muted-foreground">{prompt.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPromptTemplate && (
              <div className="flex items-center gap-2">
                <Badge className={getPromptColor(selectedPromptTemplate.category)}>
                  {getPromptIcon(selectedPromptTemplate.category)}
                  <span className="ml-1 capitalize">{selectedPromptTemplate.category}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedPromptTemplate.description}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={runAIPrompt}
            disabled={isLoading || !session.notes.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Lightbulb size={16} className="mr-2" />
                Get AI Insights
              </>
            )}
          </Button>

          {/* Response */}
          {response && (
            <Card className={response.success ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-ui flex items-center gap-2">
                    {response.success ? (
                      <>
                        <Brain size={18} className="text-green-600" />
                        AI Analysis Result
                      </>
                    ) : (
                      <>
                        <Brain size={18} className="text-red-600" />
                        Analysis Failed
                      </>
                    )}
                  </CardTitle>
                  {response.success && response.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {response.success ? (
                  <ScrollArea className="max-h-96">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {response.content}
                      </pre>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-red-700 text-sm">
                    <strong>Error:</strong> {response.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!response && !isLoading && (
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Brain size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-ui">Select an analysis type and click "Get AI Insights" to start</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}