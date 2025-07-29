import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  DownloadSimple, 
  FileText, 
  MagnifyingGlass,
  Calendar,
  Clock,
  BookOpen,
  FileArrowDown,
  Copy
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StudySession } from '@/App'

interface SessionNotesProps {
  sessions: StudySession[]
}

export function SessionNotes({ sessions }: SessionNotesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedSubtopic, setSelectedSubtopic] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'topic' | 'duration'>('date')

  // Get unique topics and subtopics from sessions
  const { topics, subtopics } = useMemo(() => {
    const topicsSet = new Set<string>()
    const subtopicsMap = new Map<string, Set<string>>()

    sessions.forEach(session => {
      topicsSet.add(session.topic)
      if (!subtopicsMap.has(session.topic)) {
        subtopicsMap.set(session.topic, new Set())
      }
      subtopicsMap.get(session.topic)?.add(session.subtopic)
    })

    return {
      topics: Array.from(topicsSet).sort(),
      subtopics: Object.fromEntries(
        Array.from(subtopicsMap.entries()).map(([topic, subs]) => [
          topic,
          Array.from(subs).sort()
        ])
      )
    }
  }, [sessions])

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          session.topic.toLowerCase().includes(query) ||
          session.subtopic.toLowerCase().includes(query) ||
          session.notes.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Filter by topic
      if (selectedTopic !== 'all' && session.topic !== selectedTopic) {
        return false
      }

      // Filter by subtopic
      if (selectedSubtopic !== 'all' && session.subtopic !== selectedSubtopic) {
        return false
      }

      return true
    })

    // Sort sessions
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        break
      case 'topic':
        filtered.sort((a, b) => {
          const topicCompare = a.topic.localeCompare(b.topic)
          return topicCompare !== 0 ? topicCompare : a.subtopic.localeCompare(b.subtopic)
        })
        break
      case 'duration':
        filtered.sort((a, b) => b.duration - a.duration)
        break
    }

    return filtered
  }, [sessions, searchQuery, selectedTopic, selectedSubtopic, sortBy])

  // Get available subtopics for selected topic
  const availableSubtopics = selectedTopic !== 'all' ? subtopics[selectedTopic] || [] : []

  const downloadMarkdown = (session: StudySession) => {
    const markdown = generateMarkdown([session])
    downloadFile(markdown, `${session.topic}-${session.subtopic}-${formatDate(session.completedAt)}.md`)
    toast.success('Note downloaded successfully!')
  }

  const downloadAllMarkdown = () => {
    if (filteredSessions.length === 0) {
      toast.error('No notes to download')
      return
    }
    
    const markdown = generateMarkdown(filteredSessions)
    const filename = searchQuery || selectedTopic !== 'all' 
      ? `study-notes-filtered-${new Date().toISOString().split('T')[0]}.md`
      : `all-study-notes-${new Date().toISOString().split('T')[0]}.md`
    
    downloadFile(markdown, filename)
    toast.success(`Downloaded ${filteredSessions.length} notes as markdown!`)
  }

  const copyToClipboard = async (session: StudySession) => {
    const markdown = generateMarkdown([session])
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success('Note copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const generateMarkdown = (sessions: StudySession[]) => {
    let markdown = '# Study Notes\n\n'
    
    if (sessions.length > 1) {
      markdown += `Generated on: ${new Date().toLocaleDateString()}\n`
      markdown += `Total sessions: ${sessions.length}\n`
      markdown += `Total study time: ${Math.round(sessions.reduce((sum, s) => sum + s.duration, 0))} minutes\n\n`
      markdown += '---\n\n'
    }

    sessions.forEach((session, index) => {
      markdown += `## ${session.topic} - ${session.subtopic}\n\n`
      markdown += `**Date:** ${formatDate(session.completedAt)}\n`
      markdown += `**Duration:** ${session.duration} minutes\n`
      markdown += `**Session ID:** ${session.id}\n\n`
      
      if (session.notes.trim()) {
        // Convert HTML to markdown-like format
        let notes = session.notes
          .replace(/<strong>/g, '**')
          .replace(/<\/strong>/g, '**')
          .replace(/<em>/g, '*')
          .replace(/<\/em>/g, '*')
          .replace(/<u>/g, '__')
          .replace(/<\/u>/g, '__')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '\n\n')
          .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
          .trim()
        
        markdown += `### Notes\n\n${notes}\n\n`
      } else {
        markdown += '### Notes\n\n*No notes were taken for this session.*\n\n'
      }
      
      if (index < sessions.length - 1) {
        markdown += '---\n\n'
      }
    })

    return markdown
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-2xl">Study Notes</CardTitle>
              <p className="text-muted-foreground font-ui mt-1">
                View and manage your study session notes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-ui">
                {filteredSessions.length} notes
              </Badge>
              {filteredSessions.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={downloadAllMarkdown}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2 font-ui"
                      >
                        <FileArrowDown size={16} />
                        Download All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download all filtered notes as markdown</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-ui"
              />
            </div>
            
            <Select value={selectedTopic} onValueChange={(value) => {
              setSelectedTopic(value)
              setSelectedSubtopic('all') // Reset subtopic when topic changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedSubtopic} 
              onValueChange={setSelectedSubtopic}
              disabled={selectedTopic === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All subtopics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subtopics</SelectItem>
                {availableSubtopics.map(subtopic => (
                  <SelectItem key={subtopic} value={subtopic}>{subtopic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'date' | 'topic' | 'duration') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="topic">Sort by Topic</SelectItem>
                <SelectItem value="duration">Sort by Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-display font-semibold mb-2">
              {sessions.length === 0 ? 'No notes yet' : 'No notes found'}
            </h3>
            <p className="text-muted-foreground font-ui">
              {sessions.length === 0 
                ? 'Complete study sessions with notes to see them here'
                : 'Try adjusting your search or filters'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">
                        {session.topic}
                      </h3>
                      <Badge variant="secondary" className="font-ui text-xs">
                        {session.subtopic}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-ui">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(session.completedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(session.duration)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => copyToClipboard(session)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Copy size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy to clipboard</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => downloadMarkdown(session)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <DownloadSimple size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download as markdown</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {session.notes.trim() ? (
                  <div className="space-y-3">
                    <div 
                      className="prose prose-sm max-w-none font-ui text-foreground"
                      dangerouslySetInnerHTML={{ __html: session.notes }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground font-ui text-sm">
                      No notes were taken for this session
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}