import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Zap, TrendingUp, Target, Clock, Calendar } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StudySession, StreakData, Achievement } from '@/App'

interface StudyInsights {
  patterns: {
    mostProductiveDay: string
    preferredTopics: string[]
    avgSessionLength: number
    peakHours: string[]
  }
  habits: {
    consistency: number
    improvement: string[]
    weeklyPattern: string
    focusScore: number
  }
  recommendations: {
    optimizeSchedule: string
    topicSuggestions: string[]
    habits: string[]
    goals: string[]
  }
}

interface StudyInsightsProps {
  sessions: StudySession[]
  streakData: StreakData
  achievements: Achievement[]
}

export function StudyInsights({ sessions, streakData, achievements }: StudyInsightsProps) {
  const [insights, setInsights] = useState<StudyInsights | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)

  const generateInsights = async () => {
    if (sessions.length < 3) {
      toast.info('Complete at least 3 study sessions to get AI insights')
      return
    }

    setIsGenerating(true)
    try {
      // Prepare data for analysis
      const analysisData = {
        sessions: sessions.map(s => ({
          topic: s.topic,
          subtopic: s.subtopic,
          duration: s.duration,
          dayOfWeek: new Date(s.completedAt).getDay(),
          hour: new Date(s.completedAt).getHours(),
          completedAt: s.completedAt
        })),
        streakData,
        achievements,
        uniqueTopics: [...new Set(sessions.map(s => s.topic))],
        totalSessions: sessions.length
      }

      const prompt = spark.llmPrompt`
        Analyze this student's study data and provide AI-powered insights:
        ${JSON.stringify(analysisData, null, 2)}

        Please analyze patterns and provide:
        1. Study habits and consistency patterns
        2. Most productive day of week and hours
        3. Focus score (0-100) based on session completion and streaks
        4. Topic preferences and recommendations
        5. Actionable improvement suggestions

        Return a JSON object with this structure:
        {
          "patterns": {
            "mostProductiveDay": string,
            "preferredTopics": string[],
            "avgSessionLength": number,
            "peakHours": string[]
          },
          "habits": {
            "consistency": number (0-100),
            "improvement": string[],
            "weeklyPattern": string,
            "focusScore": number (0-100)
          },
          "recommendations": {
            "optimizeSchedule": string,
            "topicSuggestions": string[],
            "habits": string[],
            "goals": string[]
          }
        }
      `

      const response = await spark.llm(prompt, "gpt-4o", true)
      const insightData = JSON.parse(response)
      setInsights(insightData)
      setLastAnalyzed(new Date())
      toast.success('AI insights generated successfully!')
    } catch (error) {
      toast.error('Failed to generate insights. Please try again.')
      console.error('Insights generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate insights when component loads if we have enough data
  useEffect(() => {
    if (sessions.length >= 3 && !insights && !lastAnalyzed) {
      generateInsights()
    }
  }, [sessions.length])

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM'
    if (hour < 12) return `${hour}:00 AM`
    if (hour === 12) return '12:00 PM'
    return `${hour - 12}:00 PM`
  }

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getHabitTrend = (pattern: string) => {
    switch (pattern.toLowerCase()) {
      case 'improving':
        return 'text-green-600'
      case 'declining':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  if (sessions.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={24} />
            AI Study Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Complete at least 3 study sessions to unlock AI-powered insights
            </p>
            <Badge variant="secondary">{sessions.length}/3 sessions completed</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={24} />
            AI Study Insights
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Personalized recommendations based on your study patterns
            </p>
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              size="sm"
              className="flex items-center gap-2"
            >
              <Zap size={16} />
              {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>
        </CardHeader>

        {insights && (
          <CardContent>
            <Tabs defaultValue="patterns" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center gap-2">
                  <Target size={16} />
                  Habits
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Zap size={16} />
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patterns" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Most Productive Day</h4>
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        <span className="text-lg font-medium">{insights.patterns.mostProductiveDay}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Average Session</h4>
                      <div className="flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        <span className="text-lg font-medium">{insights.patterns.avgSessionLength} minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Study Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.patterns.peakHours.map((hour, index) => (
                        <Badge key={index} variant="secondary">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferred Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.patterns.preferredTopics.map((topic, index) => (
                        <Badge 
                          key={topic} 
                          variant="outline"
                          className="text-sm"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="habits" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Consistency Score</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 relative">
                          <div 
                            className={`w-full h-full rounded-full ${getConsistencyColor(insights.habits.consistency)} flex items-center justify-center text-white font-bold`}
                          >
                            {insights.habits.consistency}%
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Based on study frequency and streak maintenance
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Focus Score</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 relative">
                          <div 
                            className={`w-full h-full rounded-full ${getConsistencyColor(insights.habits.focusScore)} flex items-center justify-center text-white font-bold`}
                          >
                            {insights.habits.focusScore}%
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Session completion and quality metrics
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-lg font-medium ${getHabitTrend(insights.habits.weeklyPattern)}`}>
                      {insights.habits.weeklyPattern}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.habits.improvement.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{insights.recommendations.optimizeSchedule}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Topic Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.recommendations.topicSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Habit Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.recommendations.habits.map((habit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Goal Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.recommendations.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {lastAnalyzed && (
        <p className="text-xs text-muted-foreground text-center">
          Last analyzed: {lastAnalyzed.toLocaleString()}
        </p>
      )}
    </div>
  )
}