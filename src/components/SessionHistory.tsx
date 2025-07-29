import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Clock, Tag, Calendar, Trash, Eye, MagnifyingGlass } from '@phosphor-icons/react'
import type { StudySession } from '@/App'

interface SessionHistoryProps {
  sessions: StudySession[]
  onDeleteSession: (sessionId: string) => void
}

export function SessionHistory({ sessions, onDeleteSession }: SessionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'topic'>('date')

  const topics = Array.from(new Set(sessions.map(s => s.topic))).sort()

  const filteredAndSortedSessions = sessions
    .filter(session => {
      const matchesSearch = searchTerm === '' || 
        session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subtopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTopic = filterTopic === 'all' || session.topic === filterTopic
      
      return matchesSearch && matchesTopic
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        case 'duration':
          return b.duration - a.duration
        case 'topic':
          return a.topic.localeCompare(b.topic)
        default:
          return 0
      }
    })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getTotalStats = () => {
    const totalSessions = sessions.length
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0)
    const uniqueTopics = new Set(sessions.map(s => s.topic)).size
    
    return { totalSessions, totalTime, uniqueTopics }
  }

  const stats = getTotalStats()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No Study Sessions Yet</h3>
          <p className="text-muted-foreground text-center font-ui">
            Complete your first study session to see your history here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground font-ui">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{formatDuration(stats.totalTime)}</div>
            <div className="text-sm text-muted-foreground font-ui">Study Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-accent">{stats.uniqueTopics}</div>
            <div className="text-sm text-muted-foreground font-ui">Topics Studied</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Study Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-ui"
              />
            </div>
            
            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'duration' | 'topic')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredAndSortedSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-ui">
                          <Tag size={12} className="mr-1" />
                          {session.topic}
                        </Badge>
                        <Badge variant="outline" className="font-ui">
                          {session.subtopic}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-ui">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(session.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(session.completedAt)}
                        </div>
                      </div>

                      {session.notes && (
                        <div className="text-sm text-foreground line-clamp-2 font-body">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: session.notes.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                            }} 
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {session.notes && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-display">
                                {session.topic} - {session.subtopic}
                              </DialogTitle>
                              <div className="text-sm text-muted-foreground font-ui">
                                {formatDate(session.completedAt)} • {formatDuration(session.duration)}
                              </div>
                            </DialogHeader>
                            <div className="mt-4">
                              <div 
                                className="prose prose-sm max-w-none font-body"
                                dangerouslySetInnerHTML={{ __html: session.notes }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this study session? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSession(session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAndSortedSessions.length === 0 && (
              <div className="text-center py-8">
                <MagnifyingGlass size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-ui">No sessions match your current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}