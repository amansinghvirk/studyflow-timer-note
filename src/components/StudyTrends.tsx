import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendUp, Calendar, ChartBar, BarChart3 } from '@phosphor-icons/react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { StudySession } from '@/App'

interface StudyTrendsProps {
  sessions: StudySession[]
}

type ViewType = 'daily' | 'weekly' | 'monthly'

export function StudyTrends({ sessions }: StudyTrendsProps) {
  const [viewType, setViewType] = useState<ViewType>('daily')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area')

  const topics = useMemo(() => 
    Array.from(new Set(sessions.map(s => s.topic))).sort(),
    [sessions]
  )

  const trendData = useMemo(() => {
    const filteredSessions = selectedTopic === 'all' 
      ? sessions 
      : sessions.filter(s => s.topic === selectedTopic)

    if (viewType === 'daily') {
      // Last 30 days
      const dailyData = []
      const currentDate = new Date()
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const daySessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.completedAt).toISOString().split('T')[0]
          return sessionDate === dateStr
        })
        
        dailyData.push({
          date: dateStr,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sessions: daySessions.length,
          duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
          topics: new Set(daySessions.map(s => s.topic)).size,
          avgSession: daySessions.length > 0 ? Math.round(daySessions.reduce((sum, s) => sum + s.duration, 0) / daySessions.length) : 0
        })
      }
      return dailyData
    }

    if (viewType === 'weekly') {
      // Last 12 weeks
      const weeklyData = []
      const currentDate = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(currentDate.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        
        const weekSessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.completedAt)
          return sessionDate >= weekStart && sessionDate < weekEnd
        })
        
        weeklyData.push({
          date: weekStart.toISOString(),
          label: `Week ${12 - i}`,
          fullLabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          sessions: weekSessions.length,
          duration: weekSessions.reduce((sum, s) => sum + s.duration, 0),
          topics: new Set(weekSessions.map(s => s.topic)).size,
          avgSession: weekSessions.length > 0 ? Math.round(weekSessions.reduce((sum, s) => sum + s.duration, 0) / weekSessions.length) : 0,
          studyDays: new Set(weekSessions.map(s => new Date(s.completedAt).toDateString())).size
        })
      }
      return weeklyData
    }

    if (viewType === 'monthly') {
      // Last 12 months
      const monthlyData = []
      const currentDate = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
        
        const monthSessions = filteredSessions.filter(s => {
          const sessionDate = new Date(s.completedAt)
          return sessionDate >= monthStart && sessionDate <= monthEnd
        })
        
        monthlyData.push({
          date: monthStart.toISOString(),
          label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          sessions: monthSessions.length,
          duration: monthSessions.reduce((sum, s) => sum + s.duration, 0),
          topics: new Set(monthSessions.map(s => s.topic)).size,
          avgSession: monthSessions.length > 0 ? Math.round(monthSessions.reduce((sum, s) => sum + s.duration, 0) / monthSessions.length) : 0,
          studyDays: new Set(monthSessions.map(s => new Date(s.completedAt).toDateString())).size
        })
      }
      return monthlyData
    }

    return []
  }, [sessions, selectedTopic, viewType])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getViewTitle = () => {
    switch (viewType) {
      case 'daily': return 'Daily Study Trends (Last 30 Days)'
      case 'weekly': return 'Weekly Study Trends (Last 12 Weeks)'
      case 'monthly': return 'Monthly Study Trends (Last 12 Months)'
      default: return 'Study Trends'
    }
  }

  const getChartIcon = () => {
    switch (chartType) {
      case 'area': return <BarChart3 size={20} />
      case 'line': return <TrendUp size={20} />
      case 'bar': return <ChartBar size={20} />
      default: return <TrendUp size={20} />
    }
  }

  const renderChart = () => {
    const chartProps = {
      data: trendData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 85)" />
        <XAxis 
          dataKey="label" 
          stroke="oklch(0.5 0.05 150)"
          fontSize={12}
          tick={{ fontFamily: 'var(--font-ui)' }}
          angle={viewType === 'daily' ? -45 : 0}
          textAnchor={viewType === 'daily' ? 'end' : 'middle'}
          height={viewType === 'daily' ? 80 : 60}
        />
        <YAxis 
          yAxisId="sessions"
          orientation="left"
          stroke="oklch(0.5 0.05 150)"
          fontSize={12}
          tick={{ fontFamily: 'var(--font-ui)' }}
        />
        <YAxis 
          yAxisId="duration"
          orientation="right"
          stroke="oklch(0.5 0.05 150)"
          fontSize={12}
          tick={{ fontFamily: 'var(--font-ui)' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'oklch(1 0 0)',
            border: '1px solid oklch(0.85 0.02 85)',
            borderRadius: '8px',
            fontFamily: 'var(--font-ui)'
          }}
          formatter={(value, name) => {
            if (name === 'sessions') return [`${value} sessions`, 'Sessions']
            if (name === 'duration') return [`${value} min`, 'Duration']
            if (name === 'topics') return [`${value} topics`, 'Topics']
            if (name === 'avgSession') return [`${value} min`, 'Avg Session']
            if (name === 'studyDays') return [`${value} days`, 'Study Days']
            return [value, name]
          }}
          labelFormatter={(label) => {
            const dataPoint = trendData.find(d => d.label === label)
            return dataPoint?.fullLabel || label
          }}
        />
      </>
    )

    if (chartType === 'area') {
      return (
        <AreaChart {...chartProps}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.45 0.15 150)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="oklch(0.45 0.15 150)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.75 0.15 75)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="oklch(0.75 0.15 75)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          {commonElements}
          <Area
            yAxisId="sessions"
            type="monotone"
            dataKey="sessions"
            stroke="oklch(0.45 0.15 150)"
            fill="url(#sessionGradient)"
            strokeWidth={2}
          />
          <Area
            yAxisId="duration"
            type="monotone"
            dataKey="duration"
            stroke="oklch(0.75 0.15 75)"
            fill="url(#durationGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      )
    }

    if (chartType === 'line') {
      return (
        <LineChart {...chartProps}>
          {commonElements}
          <Line
            yAxisId="sessions"
            type="monotone"
            dataKey="sessions"
            stroke="oklch(0.45 0.15 150)"
            strokeWidth={3}
            dot={{ fill: 'oklch(0.45 0.15 150)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'oklch(0.45 0.15 150)', strokeWidth: 2 }}
          />
          <Line
            yAxisId="duration"
            type="monotone"
            dataKey="duration"
            stroke="oklch(0.75 0.15 75)"
            strokeWidth={3}
            dot={{ fill: 'oklch(0.75 0.15 75)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'oklch(0.75 0.15 75)', strokeWidth: 2 }}
          />
        </LineChart>
      )
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...chartProps}>
          {commonElements}
          <Bar 
            yAxisId="sessions"
            dataKey="sessions" 
            fill="oklch(0.45 0.15 150)" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Bar 
            yAxisId="duration"
            dataKey="duration" 
            fill="oklch(0.75 0.15 75)" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
        </BarChart>
      )
    }

    return null
  }

  const getInsights = () => {
    if (trendData.length === 0) return null

    const totalSessions = trendData.reduce((sum, d) => sum + d.sessions, 0)
    const totalDuration = trendData.reduce((sum, d) => sum + d.duration, 0)
    const avgSessionsPerPeriod = Math.round(totalSessions / trendData.length * 10) / 10
    const avgDurationPerPeriod = Math.round(totalDuration / trendData.length)
    
    const periodsWithStudy = trendData.filter(d => d.sessions > 0).length
    const consistencyRate = Math.round((periodsWithStudy / trendData.length) * 100)
    
    const maxSessions = Math.max(...trendData.map(d => d.sessions))
    const maxDuration = Math.max(...trendData.map(d => d.duration))
    const bestSessionDay = trendData.find(d => d.sessions === maxSessions)
    const bestDurationDay = trendData.find(d => d.duration === maxDuration)

    return {
      totalSessions,
      totalDuration,
      avgSessionsPerPeriod,
      avgDurationPerPeriod,
      consistencyRate,
      bestSessionDay,
      bestDurationDay
    }
  }

  const insights = getInsights()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendUp size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No Trend Data</h3>
          <p className="text-muted-foreground text-center font-ui">
            Complete more study sessions to see trend analysis
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
            {getChartIcon()}
            {getViewTitle()}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-ui">
            Analyze your study patterns and trends over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">📅 Daily View</SelectItem>
                <SelectItem value="weekly">📊 Weekly View</SelectItem>
                <SelectItem value="monthly">📈 Monthly View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📚 All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>📖 {topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value) => setChartType(value as 'area' | 'line' | 'bar')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">📊 Area Chart</SelectItem>
                <SelectItem value="line">📈 Line Chart</SelectItem>
                <SelectItem value="bar">📊 Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Filter Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="font-ui">
              {selectedTopic === 'all' ? 'All Topics' : selectedTopic}
            </Badge>
            <Badge variant="outline" className="font-ui">
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
            </Badge>
            <Badge variant="outline" className="font-ui">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{insights.totalSessions}</div>
              <div className="text-sm text-muted-foreground font-ui">Total Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{formatDuration(insights.totalDuration)}</div>
              <div className="text-sm text-muted-foreground font-ui">Total Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{insights.avgSessionsPerPeriod}</div>
              <div className="text-sm text-muted-foreground font-ui">Avg per {viewType.slice(0, -2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">{insights.consistencyRate}%</div>
              <div className="text-sm text-muted-foreground font-ui">Consistency</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar size={20} />
            Study Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Highlights */}
      {insights && insights.bestSessionDay && insights.bestDurationDay && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendUp size={20} />
              Performance Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-ui font-semibold text-accent">Most Active {viewType.slice(0, -2).charAt(0).toUpperCase() + viewType.slice(1, -2)}</h4>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-ui font-medium">{insights.bestSessionDay.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {insights.bestSessionDay.sessions} sessions • {formatDuration(insights.bestSessionDay.duration)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-ui font-semibold text-accent">Longest Study {viewType.slice(0, -2).charAt(0).toUpperCase() + viewType.slice(1, -2)}</h4>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-ui font-medium">{insights.bestDurationDay.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(insights.bestDurationDay.duration)} • {insights.bestDurationDay.sessions} sessions
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}