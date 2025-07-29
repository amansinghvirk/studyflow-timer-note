import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  ChartBar, 
  Calendar, 
  Target, 
  TrendUp, 
  BookOpen,
  Fire,
  Trophy
} from '@phosphor-icons/react'
import type { StudySession } from '@/App'

interface DashboardProps {
  sessions: StudySession[]
}

export function Dashboard({ sessions }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  const topics = useMemo(() => 
    Array.from(new Set(sessions.map(s => s.topic))).sort(),
    [sessions]
  )

  const filteredSessions = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date(0) // All time by default
    
    if (timeRange === 'week') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeRange === 'month') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return sessions.filter(session => {
      const sessionDate = new Date(session.completedAt)
      const inTimeRange = sessionDate >= cutoffDate
      const matchesTopic = selectedTopic === 'all' || session.topic === selectedTopic
      return inTimeRange && matchesTopic
    })
  }, [sessions, timeRange, selectedTopic])

  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0)
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0
    const uniqueTopics = new Set(filteredSessions.map(s => s.topic)).size
    const uniqueSubtopics = new Set(filteredSessions.map(s => s.subtopic)).size

    // Daily stats for the current time range
    const sessionsByDate = filteredSessions.reduce((acc, session) => {
      const date = new Date(session.completedAt).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dailyAverage = totalSessions > 0 ? 
      Math.round((totalSessions / Math.max(Object.keys(sessionsByDate).length, 1)) * 10) / 10 : 0

    // Weekly stats (last 4 weeks)
    const weeklyStats = []
    const now = new Date()
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.completedAt)
        return sessionDate >= weekStart && sessionDate < weekEnd
      })
      weeklyStats.push({
        week: `Week ${4 - i}`,
        sessions: weekSessions.length,
        duration: weekSessions.reduce((sum, s) => sum + s.duration, 0)
      })
    }

    // Monthly stats (last 6 months)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthSessions = sessions.filter(s => {
        const sessionDate = new Date(s.completedAt)
        return sessionDate >= monthStart && sessionDate <= monthEnd
      })
      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sessions: monthSessions.length,
        duration: monthSessions.reduce((sum, s) => sum + s.duration, 0)
      })
    }

    // Topic breakdown
    const topicStats = topics.map(topic => {
      const topicSessions = filteredSessions.filter(s => s.topic === topic)
      const totalTime = topicSessions.reduce((sum, s) => sum + s.duration, 0)
      const avgTime = topicSessions.length > 0 ? Math.round(totalTime / topicSessions.length) : 0
      
      const subtopicStats = Array.from(new Set(topicSessions.map(s => s.subtopic)))
        .map(subtopic => {
          const subtopicSessions = topicSessions.filter(s => s.subtopic === subtopic)
          const subtopicTime = subtopicSessions.reduce((sum, s) => sum + s.duration, 0)
          const subtopicAvg = subtopicSessions.length > 0 ? Math.round(subtopicTime / subtopicSessions.length) : 0
          
          return {
            name: subtopic,
            sessions: subtopicSessions.length,
            totalDuration: subtopicTime,
            averageDuration: subtopicAvg
          }
        })
        .sort((a, b) => b.totalDuration - a.totalDuration)

      return {
        topic,
        sessions: topicSessions.length,
        totalDuration: totalTime,
        averageDuration: avgTime,
        subtopics: subtopicStats
      }
    }).sort((a, b) => b.totalDuration - a.totalDuration)

    // Streaks and achievements
    const streakData = calculateStudyStreak(sessions)

    return {
      totalSessions,
      totalDuration,
      averageDuration,
      uniqueTopics,
      uniqueSubtopics,
      dailyAverage,
      weeklyStats,
      monthlyStats,
      topicStats,
      streakData
    }
  }, [filteredSessions, topics, sessions])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours}h`
    }
    return formatDuration(minutes)
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChartBar size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No Data Yet</h3>
          <p className="text-muted-foreground text-center font-ui">
            Complete some study sessions to see your analytics dashboard
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map(topic => (
              <SelectItem key={topic} value={topic}>{topic}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground font-ui">Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{formatTime(stats.totalDuration)}</div>
            <div className="text-sm text-muted-foreground font-ui">Total Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{formatDuration(stats.averageDuration)}</div>
            <div className="text-sm text-muted-foreground font-ui">Avg Session</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{stats.dailyAverage}</div>
            <div className="text-sm text-muted-foreground font-ui">Daily Avg</div>
          </CardContent>
        </Card>
      </div>

      {/* Streak and Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Fire className="h-5 w-5 text-orange-500 mr-2" />
            <CardTitle className="text-sm font-ui font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{stats.streakData.current} days</div>
            <p className="text-xs text-muted-foreground font-ui">
              Keep it up!
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            <CardTitle className="text-sm font-ui font-medium">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{stats.streakData.longest} days</div>
            <p className="text-xs text-muted-foreground font-ui">
              Personal record
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle className="text-sm font-ui font-medium">Topics Explored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{stats.uniqueTopics}</div>
            <p className="text-xs text-muted-foreground font-ui">
              {stats.uniqueSubtopics} subtopics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <TrendUp size={20} />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.weeklyStats.map((week, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-ui text-sm font-medium">{week.week}</div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground font-ui">
                    {week.sessions} sessions
                  </div>
                  <div className="text-sm font-medium font-ui">
                    {formatDuration(week.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar size={20} />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.monthlyStats.map((month, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-muted">
                <div className="font-ui text-sm font-medium text-muted-foreground">{month.month}</div>
                <div className="font-display text-lg font-bold">{month.sessions}</div>
                <div className="font-ui text-xs text-muted-foreground">{formatDuration(month.duration)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Target size={20} />
            Study Topics Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stats.topicStats.map((topicStat, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-ui">
                      {topicStat.topic}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-ui">
                      {topicStat.sessions} sessions
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-ui font-medium">{formatTime(topicStat.totalDuration)}</div>
                    <div className="text-sm text-muted-foreground font-ui">
                      avg {formatDuration(topicStat.averageDuration)}
                    </div>
                  </div>
                </div>
                
                {topicStat.subtopics.length > 0 && (
                  <div className="ml-4 space-y-2">
                    {topicStat.subtopics.map((subtopic, subIndex) => (
                      <div key={subIndex} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                          <span className="font-ui">{subtopic.name}</span>
                          <span className="text-muted-foreground font-ui">
                            ({subtopic.sessions})
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-ui">{formatDuration(subtopic.totalDuration)}</div>
                          <div className="text-xs text-muted-foreground font-ui">
                            avg {formatDuration(subtopic.averageDuration)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {index < stats.topicStats.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateStudyStreak(sessions: StudySession[]) {
  if (sessions.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  )

  // Get unique study dates
  const studyDates = Array.from(new Set(
    sortedSessions.map(s => new Date(s.completedAt).toDateString())
  )).sort()

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  // Calculate longest streak
  for (let i = 1; i < studyDates.length; i++) {
    const prevDate = new Date(studyDates[i - 1])
    const currDate = new Date(studyDates[i])
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)

    if (dayDiff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Calculate current streak
  if (studyDates.includes(today)) {
    currentStreak = 1
    for (let i = studyDates.length - 2; i >= 0; i--) {
      const date = new Date(studyDates[i])
      const nextDate = new Date(studyDates[i + 1])
      const dayDiff = (nextDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
      
      if (dayDiff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  } else if (studyDates.includes(yesterday)) {
    currentStreak = 1
    for (let i = studyDates.length - 2; i >= 0; i--) {
      const date = new Date(studyDates[i])
      const nextDate = new Date(studyDates[i + 1])
      const dayDiff = (nextDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
      
      if (dayDiff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { current: currentStreak, longest: longestStreak }
}