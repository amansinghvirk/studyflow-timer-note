import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Target, Calculator, Clock } from '@phosphor-icons/react'
import type { StudySession } from '@/App'

interface StudyProjectionsProps {
  sessions: StudySession[]
}

export function StudyProjections({ sessions }: StudyProjectionsProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('total')
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all')

  const { topics, subtopics, projections } = useMemo(() => {
    const topicsSet = Array.from(new Set(sessions.map(s => s.topic))).sort()
    
    const subtopicsMap = topicsSet.reduce((acc, topic) => {
      acc[topic] = Array.from(new Set(sessions.filter(s => s.topic === topic).map(s => s.subtopic))).sort()
      return acc
    }, {} as Record<string, string[]>)

    // Calculate daily averages for different scopes
    const projectionPeriods = [150, 180, 210, 250, 300, 365, 400, 500]
    
    // Calculate for total (all sessions)
    const allSessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.completedAt).toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(session.duration)
      return acc
    }, {} as Record<string, number[]>)

    const dailyDurations = Object.values(allSessionsByDate).map(durations => 
      durations.reduce((sum, duration) => sum + duration, 0)
    )

    const totalAvgDailyDuration = dailyDurations.length > 0 ? 
      Math.round(dailyDurations.reduce((sum, duration) => sum + duration, 0) / dailyDurations.length) : 0

    const totalProjections = projectionPeriods.map(days => ({
      days,
      totalHours: Math.round((totalAvgDailyDuration * days) / 60 * 10) / 10
    }))

    // Calculate for each topic
    const topicProjections = topicsSet.map(topic => {
      const topicSessions = sessions.filter(s => s.topic === topic)
      const topicSessionsByDate = topicSessions.reduce((acc, session) => {
        const date = new Date(session.completedAt).toDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(session.duration)
        return acc
      }, {} as Record<string, number[]>)

      const topicDailyDurations = Object.values(topicSessionsByDate).map(durations => 
        durations.reduce((sum, duration) => sum + duration, 0)
      )

      const topicAvgDailyDuration = topicDailyDurations.length > 0 ? 
        Math.round(topicDailyDurations.reduce((sum, duration) => sum + duration, 0) / topicDailyDurations.length) : 0

      const projections = projectionPeriods.map(days => ({
        days,
        totalHours: Math.round((topicAvgDailyDuration * days) / 60 * 10) / 10
      }))

      // Calculate subtopic projections for this topic
      const subtopicProjections = subtopicsMap[topic].map(subtopic => {
        const subtopicSessions = topicSessions.filter(s => s.subtopic === subtopic)
        const subtopicSessionsByDate = subtopicSessions.reduce((acc, session) => {
          const date = new Date(session.completedAt).toDateString()
          if (!acc[date]) acc[date] = []
          acc[date].push(session.duration)
          return acc
        }, {} as Record<string, number[]>)

        const subtopicDailyDurations = Object.values(subtopicSessionsByDate).map(durations => 
          durations.reduce((sum, duration) => sum + duration, 0)
        )

        const subtopicAvgDailyDuration = subtopicDailyDurations.length > 0 ? 
          Math.round(subtopicDailyDurations.reduce((sum, duration) => sum + duration, 0) / subtopicDailyDurations.length) : 0

        const subtopicProjections = projectionPeriods.map(days => ({
          days,
          totalHours: Math.round((subtopicAvgDailyDuration * days) / 60 * 10) / 10
        }))

        return {
          subtopic,
          avgDailyDuration: subtopicAvgDailyDuration,
          projections: subtopicProjections
        }
      }).filter(s => s.avgDailyDuration > 0)

      return {
        topic,
        avgDailyDuration: topicAvgDailyDuration,
        projections,
        subtopics: subtopicProjections
      }
    }).filter(t => t.avgDailyDuration > 0)

    const projectionsData = {
      total: {
        name: 'Total (All Topics)',
        avgDailyDuration: totalAvgDailyDuration,
        projections: totalProjections
      },
      topics: topicProjections
    }

    return {
      topics: topicsSet,
      subtopics: subtopicsMap,
      projections: projectionsData
    }
  }, [sessions])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getCurrentProjections = () => {
    if (selectedTopic === 'total') {
      return projections.total
    }
    
    const topicData = projections.topics.find(t => t.topic === selectedTopic)
    if (!topicData) return null

    if (selectedSubtopic === 'all') {
      return {
        name: topicData.topic,
        avgDailyDuration: topicData.avgDailyDuration,
        projections: topicData.projections
      }
    }

    const subtopicData = topicData.subtopics.find(s => s.subtopic === selectedSubtopic)
    if (!subtopicData) return null

    return {
      name: `${topicData.topic} - ${subtopicData.subtopic}`,
      avgDailyDuration: subtopicData.avgDailyDuration,
      projections: subtopicData.projections
    }
  }

  const currentProjections = getCurrentProjections()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No Study Data</h3>
          <p className="text-muted-foreground text-center font-ui">
            Complete some study sessions to see time projections
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Target size={20} />
            Study Time Projections
          </CardTitle>
          <p className="text-sm text-muted-foreground font-ui">
            View projected study hours based on your historical patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedTopic} onValueChange={(value) => {
              setSelectedTopic(value)
              setSelectedSubtopic('all')
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">📊 Total (All Topics)</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>📚 {topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTopic !== 'total' && subtopics[selectedTopic]?.length > 0 && (
              <Select value={selectedSubtopic} onValueChange={setSelectedSubtopic}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select subtopic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🎯 All Subtopics</SelectItem>
                  {subtopics[selectedTopic].map(subtopic => (
                    <SelectItem key={subtopic} value={subtopic}>📖 {subtopic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {currentProjections && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-ui">
                  {currentProjections.name}
                </Badge>
                <span className="text-sm text-muted-foreground font-ui flex items-center gap-1">
                  <Clock size={16} />
                  avg {formatDuration(currentProjections.avgDailyDuration)}/day
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentProjections.projections.map((projection, index) => (
                  <div 
                    key={index} 
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border/50 hover:border-primary/20 transition-colors"
                  >
                    <div className="font-ui text-sm font-medium text-muted-foreground mb-1">
                      {projection.days} Days
                    </div>
                    <div className="font-display text-2xl font-bold text-primary mb-1">
                      {projection.totalHours}h
                    </div>
                    <div className="font-ui text-xs text-muted-foreground">
                      {Math.round(projection.totalHours * 60)} minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Topics Overview */}
      {selectedTopic === 'total' && projections.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calculator size={20} />
              Topic-wise Projections Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground font-ui">
              Projected study hours for each topic based on individual patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projections.topics.map((topicProjection, topicIndex) => (
                <div key={topicIndex} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-ui">
                        {topicProjection.topic}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-ui flex items-center gap-1">
                        <Clock size={16} />
                        avg {formatDuration(topicProjection.avgDailyDuration)}/day
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTopic(topicProjection.topic)}
                      className="font-ui"
                    >
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-4">
                    {topicProjection.projections.map((projection, projIndex) => (
                      <div key={projIndex} className="text-center p-3 rounded bg-muted/50 border border-border/30">
                        <div className="font-ui text-xs font-medium text-muted-foreground">{projection.days}d</div>
                        <div className="font-display text-lg font-bold text-primary">{projection.totalHours}h</div>
                      </div>
                    ))}
                  </div>
                  
                  {topicIndex < projections.topics.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subtopic Details */}
      {selectedTopic !== 'total' && selectedSubtopic === 'all' && (
        (() => {
          const topicData = projections.topics.find(t => t.topic === selectedTopic)
          return topicData && topicData.subtopics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Calculator size={20} />
                  Subtopic Projections - {selectedTopic}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-ui">
                  Detailed projections for each subtopic in {selectedTopic}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topicData.subtopics.map((subtopicProjection, subIndex) => (
                    <div key={subIndex} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-ui">
                            {subtopicProjection.subtopic}
                          </Badge>
                          <span className="text-sm text-muted-foreground font-ui flex items-center gap-1">
                            <Clock size={16} />
                            avg {formatDuration(subtopicProjection.avgDailyDuration)}/day
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubtopic(subtopicProjection.subtopic)}
                          className="font-ui"
                        >
                          Focus View
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-4">
                        {subtopicProjection.projections.map((projection, projIndex) => (
                          <div key={projIndex} className="text-center p-3 rounded bg-muted/30 border border-border/20">
                            <div className="font-ui text-xs font-medium text-muted-foreground">{projection.days}d</div>
                            <div className="font-display text-sm font-bold text-accent">{projection.totalHours}h</div>
                          </div>
                        ))}
                      </div>
                      
                      {subIndex < topicData.subtopics.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null
        })()
      )}
    </div>
  )
}