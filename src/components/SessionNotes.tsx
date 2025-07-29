import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  DownloadSimple, 
  FileText, 
  MagnifyingGlass,
  Calendar,
  Clock,
  BookOpen,
  FileArrowDown,
  Copy,
  CaretDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
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
    try {
      const markdown = generateMarkdown([session])
      downloadFile(markdown, `${session.topic}-${session.subtopic}-${formatDate(session.completedAt)}.md`, 'text/markdown')
      toast.success('Note downloaded as Markdown!', {
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      toast.error('Failed to download Markdown file')
    }
  }

  const downloadHTML = async (session: StudySession) => {
    try {
      const html = generateHTML([session])
      downloadFile(html, `${session.topic}-${session.subtopic}-${formatDate(session.completedAt)}.html`, 'text/html')
      toast.success('Note downloaded as HTML!', {
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      toast.error('Failed to download HTML file')
    }
  }

  const downloadPDF = async (session: StudySession) => {
    toast.loading('Generating PDF...', { id: 'pdf-gen' })
    try {
      const html = generateHTML([session])
      await generatePDF(html, `${session.topic}-${session.subtopic}-${formatDate(session.completedAt)}.pdf`)
      toast.success('Note downloaded as PDF!', { 
        id: 'pdf-gen',
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF', { 
        id: 'pdf-gen',
        description: 'Please try again or use HTML/Markdown instead'
      })
    }
  }

  const downloadAllMarkdown = () => {
    if (filteredSessions.length === 0) {
      toast.error('No notes to download')
      return
    }
    
    try {
      const markdown = generateMarkdown(filteredSessions)
      const filename = searchQuery || selectedTopic !== 'all' 
        ? `study-notes-filtered-${new Date().toISOString().split('T')[0]}.md`
        : `all-study-notes-${new Date().toISOString().split('T')[0]}.md`
      
      downloadFile(markdown, filename, 'text/markdown')
      toast.success(`Downloaded ${filteredSessions.length} notes as Markdown!`, {
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      toast.error('Failed to download Markdown file')
    }
  }

  const downloadAllHTML = () => {
    if (filteredSessions.length === 0) {
      toast.error('No notes to download')
      return
    }
    
    try {
      const html = generateHTML(filteredSessions)
      const filename = searchQuery || selectedTopic !== 'all' 
        ? `study-notes-filtered-${new Date().toISOString().split('T')[0]}.html`
        : `all-study-notes-${new Date().toISOString().split('T')[0]}.html`
      
      downloadFile(html, filename, 'text/html')
      toast.success(`Downloaded ${filteredSessions.length} notes as HTML!`, {
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      toast.error('Failed to download HTML file')
    }
  }

  const downloadAllPDF = async () => {
    if (filteredSessions.length === 0) {
      toast.error('No notes to download')
      return
    }
    
    toast.loading('Generating PDF...', { id: 'pdf-all-gen' })
    try {
      const html = generateHTML(filteredSessions)
      const filename = searchQuery || selectedTopic !== 'all' 
        ? `study-notes-filtered-${new Date().toISOString().split('T')[0]}.pdf`
        : `all-study-notes-${new Date().toISOString().split('T')[0]}.pdf`
      
      await generatePDF(html, filename)
      toast.success(`Downloaded ${filteredSessions.length} notes as PDF!`, { 
        id: 'pdf-all-gen',
        description: 'Check your Downloads folder or browser downloads'
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF', { 
        id: 'pdf-all-gen',
        description: 'Please try again or use HTML/Markdown instead'
      })
    }
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

  const generateHTML = (sessions: StudySession[]) => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Notes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #e2e8f0;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #1e293b;
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: 700;
        }
        .header .subtitle {
            color: #64748b;
            font-size: 1.1em;
            margin: 0;
        }
        .summary {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 40px;
            border-left: 6px solid #3b82f6;
        }
        .summary h3 {
            color: #1e293b;
            margin: 0 0 15px 0;
            font-size: 1.3em;
        }
        .summary p {
            margin: 5px 0;
            color: #475569;
        }
        .session {
            background: #fff;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            page-break-inside: avoid;
        }
        .session-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .session-title {
            color: #1e293b;
            margin: 0 0 8px 0;
            font-size: 1.6em;
            font-weight: 600;
        }
        .session-meta {
            color: #64748b;
            font-size: 0.95em;
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
        }
        .subtopic-badge {
            background: #e2e8f0;
            color: #475569;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 0.85em;
            font-weight: 600;
            margin-left: 15px;
        }
        .notes-content {
            color: #374151;
            line-height: 1.8;
            font-size: 1.05em;
        }
        .notes-content h1, .notes-content h2, .notes-content h3 {
            color: #1e293b;
            margin-top: 25px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .notes-content h1 { font-size: 1.4em; }
        .notes-content h2 { font-size: 1.3em; }
        .notes-content h3 { font-size: 1.2em; }
        .notes-content ul, .notes-content ol {
            padding-left: 25px;
            margin: 15px 0;
        }
        .notes-content li {
            margin: 8px 0;
        }
        .notes-content p {
            margin: 12px 0;
        }
        .notes-content blockquote {
            border-left: 4px solid #e2e8f0;
            padding-left: 20px;
            margin: 20px 0;
            color: #64748b;
            font-style: italic;
        }
        .notes-content pre, .notes-content code {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .notes-content strong {
            font-weight: 600;
            color: #1e293b;
        }
        .notes-content em {
            font-style: italic;
            color: #475569;
        }
        .no-notes {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #d1d5db;
        }
        .page-break {
            page-break-after: always;
        }
        @media print {
            body { 
                margin: 0; 
                padding: 20px;
            }
            .session { 
                break-inside: avoid;
                margin-bottom: 20px;
            }
            .header {
                margin-bottom: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Study Notes</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>
    `
    
    if (sessions.length > 1) {
      const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
      const uniqueTopics = new Set(sessions.map(s => s.topic)).size
      html += `
    <div class="summary">
        <h3>📊 Summary</h3>
        <p><strong>Total Sessions:</strong> ${sessions.length}</p>
        <p><strong>Total Study Time:</strong> ${formatDuration(totalMinutes)}</p>
        <p><strong>Topics Covered:</strong> ${uniqueTopics}</p>
        <p><strong>Average Session:</strong> ${formatDuration(Math.round(totalMinutes / sessions.length))}</p>
    </div>
      `
    }

    sessions.forEach((session, index) => {
      html += `
    <div class="session">
        <div class="session-header">
            <h2 class="session-title">
                ${session.topic}
                <span class="subtopic-badge">${session.subtopic}</span>
            </h2>
            <div class="session-meta">
                <div class="meta-item">📅 ${formatDate(session.completedAt)}</div>
                <div class="meta-item">⏱️ ${formatDuration(session.duration)}</div>
                <div class="meta-item">🆔 ${session.id.slice(0, 8)}</div>
            </div>
        </div>
        
        <div class="notes-content">
      `
      
      if (session.notes.trim()) {
        // Clean and format the notes content
        let notesContent = session.notes
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
          .trim()
        html += notesContent
      } else {
        html += '<div class="no-notes">📝 No notes were taken for this session.</div>'
      }
      
      html += '</div></div>'
      
      if (index < sessions.length - 1 && sessions.length > 1) {
        html += '<div class="page-break"></div>'
      }
    })

    html += `
</body>
</html>
    `

    return html
  }

  const generatePDF = async (htmlContent: string, filename: string) => {
    try {
      // Create a temporary iframe to render the HTML properly
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.width = '800px'
      iframe.style.height = '600px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve
        // Write HTML content to iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          iframeDoc.open()
          iframeDoc.write(htmlContent)
          iframeDoc.close()
        }
      })

      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 500))

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document')
      }

      // Convert iframe content to canvas
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: iframeDoc.body.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // Create PDF with better sizing
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calculate scaling to fit page width
      const ratio = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = (imgHeight * 0.264583) * ratio
      
      // If content is longer than one page, split it
      if (scaledHeight > pdfHeight - 20) {
        const pageHeight = pdfHeight - 20
        const totalPages = Math.ceil(scaledHeight / pageHeight)
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage()
          
          const sourceY = i * (imgHeight / totalPages)
          const sourceHeight = imgHeight / totalPages
          
          // Create a temporary canvas for this page
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          pageCanvas.width = imgWidth
          pageCanvas.height = sourceHeight
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0)
            pdf.addImage(pageImgData, 'PNG', 10, 10, pdfWidth - 20, pageHeight)
          }
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, scaledHeight)
      }
      
      // Trigger download with save dialog
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Clean up
      document.body.removeChild(iframe)
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error('Failed to generate PDF')
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

  const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    // Show browser's save dialog
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 font-ui"
                          >
                            <FileArrowDown size={16} />
                            Export All
                            <CaretDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={downloadAllMarkdown}>
                            📄 Download as Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={downloadAllHTML}>
                            🌐 Download as HTML
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={downloadAllPDF}>
                            📋 Download as PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>Export all filtered notes in different formats</TooltipContent>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <DownloadSimple size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => downloadMarkdown(session)}>
                                📄 Markdown
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadHTML(session)}>
                                🌐 HTML
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadPDF(session)}>
                                📋 PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>Download in different formats</TooltipContent>
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