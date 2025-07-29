import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudyTimer } from '@/components/StudyTimer'
import { SessionHistory } from '@/components/SessionHistory'
import { Settings } from '@/components/Settings'
import { Dashboard } from '@/components/Dashboard'
import { Clock, BookOpen, History, Settings as SettingsIcon, ChartBar } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'

export interface StudySession {
  id: string
  topic: string
  subtopic: string
  duration: number
  completedAt: Date
  notes: string
  tags?: string[]
}

export interface AppSettings {
  defaultDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  audioNotifications: boolean
  externalDatabase?: {
    type: string
    connectionString: string
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('timer')
  const [sessions, setSessions] = useKV<StudySession[]>('study-sessions', [])
  const [settings, setSettings] = useKV<AppSettings>('app-settings', {
    defaultDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    audioNotifications: true
  })
  const [topics, setTopics] = useKV<string[]>('study-topics', [])
  const [subtopics, setSubtopics] = useKV<Record<string, string[]>>('study-subtopics', {})

  const addSession = (session: StudySession) => {
    setSessions(current => [...current, session])
  }

  const updateTopics = (topic: string, subtopic: string) => {
    setTopics(current => {
      if (!current.includes(topic)) {
        return [...current, topic]
      }
      return current
    })
    
    setSubtopics(current => ({
      ...current,
      [topic]: current[topic]?.includes(subtopic) 
        ? current[topic] 
        : [...(current[topic] || []), subtopic]
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-4">
        <header className="text-center py-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            StudyFlow
          </h1>
          <p className="text-muted-foreground font-ui">
            Smart study sessions with rich note-taking
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="timer" className="flex items-center gap-2 font-ui">
              <Clock size={18} />
              Timer
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 font-ui">
              <BookOpen size={18} />
              Notes
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 font-ui">
              <ChartBar size={18} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 font-ui">
              <History size={18} />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 font-ui">
              <SettingsIcon size={18} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6">
            <StudyTimer
              settings={settings}
              topics={topics}
              subtopics={subtopics}
              onSessionComplete={addSession}
              onTopicUpdate={updateTopics}
              onSwitchToNotes={() => setActiveTab('notes')}
            />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-display font-semibold mb-2">Notes Editor</h3>
              <p className="text-muted-foreground font-ui">
                Start a study session to access the rich text editor
              </p>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard sessions={sessions} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <SessionHistory 
              sessions={sessions}
              onDeleteSession={(sessionId) => {
                setSessions(current => current.filter(s => s.id !== sessionId))
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings
              settings={settings}
              onSettingsChange={setSettings}
              topics={topics}
              subtopics={subtopics}
              onTopicsChange={setTopics}
              onSubtopicsChange={setSubtopics}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App