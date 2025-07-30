import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  MagicWand, 
  Brain, 
  QuestionMark, 
  Sparkle,
  X,
  Copy,
  PaperPlaneTilt
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StudyFlowAI } from '@/lib/ai'
import type { StudySession, AppSettings } from '@/App'

interface CustomAIQuestionProps {
  session: StudySession
  settings: AppSettings
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QuestionResult {
  question: string
  answer: string
  timestamp: Date
}

export function CustomAIQuestion({ session, settings, open, onOpenChange }: CustomAIQuestionProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<QuestionResult[]>([])

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
              Custom AI Questions
            </DialogTitle>
            <DialogDescription className="font-ui">
              {!settings?.aiSettings?.enabled 
                ? 'AI features are not enabled. Enable them in Settings to ask questions.'
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

  const askCustomQuestion = async () => {
    if (!question.trim() || !isAIConfigured) return

    setLoading(true)
    
    try {
      const aiConfig = {
        apiKey: settings.aiSettings.apiKey,
        model: settings.aiSettings.model || 'gemini-1.5-flash',
        temperature: settings.aiSettings.temperature || 0.7,
        maxTokens: settings.aiSettings.maxTokens || 1000
      }

      const ai = new StudyFlowAI(aiConfig)
      const result = await ai.answerCustomQuestion(session, question)

      if (result.success && result.content) {
        const newResult: QuestionResult = {
          question: question.trim(),
          answer: result.content,
          timestamp: new Date()
        }
        
        setResults(prev => [newResult, ...prev])
        setQuestion('')
        toast.success('Question answered successfully!')
      } else {
        toast.error(result.error || 'Failed to get answer')
      }
    } catch (error) {
      console.error('AI question error:', error)
      toast.error('Failed to process your question')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Content copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      askCustomQuestion()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display flex items-center gap-2">
            <QuestionMark className="text-violet-600" size={20} />
            Ask AI about {session.topic} - {session.subtopic}
          </DialogTitle>
          <DialogDescription className="font-ui">
            Ask custom questions about your notes and get AI-powered insights
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Question Input */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkle size={16} />
                Ask Your Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Ask anything about your notes... e.g., 'Can you explain this concept in simpler terms?' or 'What are the key takeaways from this session?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={3}
                className="font-ui resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-ui">
                  Press Ctrl+Enter to send, or click the button
                </p>
                <Button
                  onClick={askCustomQuestion}
                  disabled={!question.trim() || loading}
                  className="flex items-center gap-2 font-ui"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperPlaneTilt size={16} />
                  )}
                  {loading ? 'Thinking...' : 'Ask AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Brain size={16} />
                  Q&A History
                </CardTitle>
                {results.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {results.length} question{results.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              {results.length > 0 ? (
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div 
                        key={index} 
                        className="border rounded-lg p-4 bg-muted/30"
                      >
                        {/* Question */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm font-ui flex items-center gap-2">
                              <QuestionMark size={14} className="text-blue-600" />
                              Your Question
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {result.timestamp.toLocaleTimeString()}
                            </Badge>
                          </div>
                          <p className="text-sm font-ui bg-background rounded p-2 border">
                            {result.question}
                          </p>
                        </div>

                        {/* Answer */}
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm font-ui flex items-center gap-2">
                              <Sparkle size={14} className="text-violet-600" />
                              AI Answer
                            </h4>
                            <Button
                              onClick={() => copyToClipboard(result.answer)}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                            >
                              <Copy size={12} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="prose prose-sm max-w-none font-ui text-sm bg-background rounded p-3 border whitespace-pre-wrap">
                            {result.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <QuestionMark className="mx-auto text-muted-foreground mb-3" size={48} />
                    <p className="text-sm text-muted-foreground font-ui mb-2">
                      No questions asked yet
                    </p>
                    <p className="text-xs text-muted-foreground font-ui">
                      Ask a question above to get AI insights about your notes
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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