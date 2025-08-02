import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StudyTimer } from '@/components/StudyTimer'
import { SessionHistory } from '@/components/SessionHistory'
import { Settings } from '@/components/Settings'
import { Dashboard } from '@/components/Dashboard'
import { StreakTracker } from '@/components/StreakTracker'
import { SessionNotes } from '@/components/SessionNotes'
import { MobileNavigation } from '@/components/MobileNavigation'
import { PageTitle } from '@/components/PageTitle'
import { Clock, BookOpen, ClockCounterClockwise, Gear, ChartBar, Flame } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

export interface StudySession {
  id: string
  topic: string
  subtopic: string
  duration: number
  completedAt: Date
  notes: string
  tags?: string[]
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  totalRewards: number
  weeklyGoal: number
  weeklyProgress: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  type: 'streak' | 'session' | 'duration' | 'topic'
  threshold: number
}

export interface AppSettings {
  defaultDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  audioNotifications: boolean
  distractionFreeMode: boolean
  externalDatabase?: {
    type: string
    connectionString: string
  }
  aiSettings?: {
    enabled: boolean
    apiKey: string
    model: string
    customModel?: string
    temperature: number
    maxTokens: number
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
    audioNotifications: true,
    distractionFreeMode: false,
    aiSettings: {
      enabled: false,
      apiKey: '',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 4096
    }
  })
  const [topics, setTopics] = useKV<string[]>('study-topics', [])
  const [subtopics, setSubtopics] = useKV<Record<string, string[]>>('study-subtopics', {})
  const [streakData, setStreakData] = useKV<StreakData>('streak-data', {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalRewards: 0,
    weeklyGoal: 5,
    weeklyProgress: 0
  })
  const [achievements, setAchievements] = useKV<Achievement[]>('achievements', [])

  // Ensure we have valid default values
  const safeSettings = settings || {
    defaultDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    audioNotifications: true,
    distractionFreeMode: false,
    aiSettings: {
      enabled: false,
      apiKey: '',
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 4096
    }
  }
  const safeSessions = sessions || []
  const safeTopics = topics || []
  const safeSubtopics = subtopics || {}
  const safeStreakData = streakData || {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalRewards: 0,
    weeklyGoal: 5,
    weeklyProgress: 0
  }
  const safeAchievements = achievements || []

  const calculateStreak = (sessionList: StudySession[]) => {
    if (sessionList.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const sortedSessions = [...sessionList].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get unique study dates
    const studyDates = Array.from(new Set(
      sortedSessions.map(session => 
        new Date(session.completedAt).toDateString()
      )
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Check if studied today or yesterday for current streak
    const todayStr = today.toDateString()
    const yesterdayStr = yesterday.toDateString()
    
    if (studyDates.includes(todayStr)) {
      currentStreak = 1
    } else if (studyDates.includes(yesterdayStr)) {
      currentStreak = 1
    } else {
      return { currentStreak: 0, longestStreak: Math.max(...calculateAllStreaks(studyDates)) }
    }

    // Calculate current streak
    for (let i = (studyDates.includes(todayStr) ? 1 : 0); i < studyDates.length; i++) {
      const currentDate = new Date(studyDates[i])
      const previousDate = new Date(studyDates[i - 1])
      const dayDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === 1) {
        currentStreak++
      } else {
        break
      }
    }

    return { 
      currentStreak, 
      longestStreak: Math.max(currentStreak, ...calculateAllStreaks(studyDates))
    }
  }

  const calculateAllStreaks = (studyDates: string[]) => {
    const streaks = []
    let currentStreak = 1
    
    for (let i = 1; i < studyDates.length; i++) {
      const currentDate = new Date(studyDates[i])
      const previousDate = new Date(studyDates[i - 1])
      const dayDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === 1) {
        currentStreak++
      } else {
        streaks.push(currentStreak)
        currentStreak = 1
      }
    }
    streaks.push(currentStreak)
    return streaks
  }

  const checkAchievements = (sessionList: StudySession[], streakInfo: StreakData) => {
    const newAchievements: Achievement[] = []
    const existingIds = safeAchievements.map(a => a.id)

    const achievementTemplates = [
      { id: 'first-session', title: 'Getting Started', description: 'Complete your first study session', icon: '🎯', type: 'session', threshold: 1 },
      { id: 'streak-3', title: 'Building Momentum', description: 'Study for 3 days in a row', icon: '🔥', type: 'streak', threshold: 3 },
      { id: 'streak-7', title: 'Week Warrior', description: 'Study for 7 days in a row', icon: '⚡', type: 'streak', threshold: 7 },
      { id: 'streak-30', title: 'Unstoppable', description: 'Study for 30 days in a row', icon: '💎', type: 'streak', threshold: 30 },
      { id: 'sessions-10', title: 'Dedicated Learner', description: 'Complete 10 study sessions', icon: '📚', type: 'session', threshold: 10 },
      { id: 'sessions-50', title: 'Study Master', description: 'Complete 50 study sessions', icon: '🎓', type: 'session', threshold: 50 },
      { id: 'duration-100', title: 'Century Club', description: 'Study for 100 hours total', icon: '⏰', type: 'duration', threshold: 6000 },
      { id: 'topics-5', title: 'Renaissance Mind', description: 'Study 5 different topics', icon: '🧠', type: 'topic', threshold: 5 }
    ]

    achievementTemplates.forEach(template => {
      if (existingIds.includes(template.id)) return

      let shouldUnlock = false
      
      switch (template.type) {
        case 'session':
          shouldUnlock = sessionList.length >= template.threshold
          break
        case 'streak':
          shouldUnlock = streakInfo.currentStreak >= template.threshold || streakInfo.longestStreak >= template.threshold
          break
        case 'duration':
          const totalMinutes = sessionList.reduce((sum, s) => sum + s.duration, 0)
          shouldUnlock = totalMinutes >= template.threshold
          break
        case 'topic':
          const uniqueTopics = new Set(sessionList.map(s => s.topic))
          shouldUnlock = uniqueTopics.size >= template.threshold
          break
      }

      if (shouldUnlock) {
        newAchievements.push({
          ...template,
          unlockedAt: new Date()
        } as Achievement)
      }
    })

    if (newAchievements.length > 0) {
      setAchievements(current => [...(current || []), ...newAchievements])
      return newAchievements
    }
    return []
  }

  const addSession = (session: StudySession) => {
    setSessions(current => {
      const currentSessions = current || []
      const updated = [...currentSessions, session]
      
      // Update streak data
      const streaks = calculateStreak(updated)
      const today = new Date().toDateString()
      const thisWeekStart = new Date()
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
      
      const weekSessions = updated.filter(s => 
        new Date(s.completedAt) >= thisWeekStart
      )
      
      const newStreakData = {
        ...safeStreakData,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        lastStudyDate: today,
        weeklyProgress: Math.min(weekSessions.length, safeStreakData.weeklyGoal)
      }
      
      setStreakData(newStreakData)
      
      // Check for new achievements
      const newAchievements = checkAchievements(updated, newStreakData)
      if (newAchievements.length > 0) {
        setStreakData(current => ({
          ...(current || safeStreakData),
          totalRewards: (current?.totalRewards || 0) + newAchievements.length
        }))
        
        // Show achievement notifications
        newAchievements.forEach(achievement => {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}`, {
            description: `${achievement.description} 🌟 Keep up the amazing work!`,
            duration: 5000
          })
        })
      }
      
      return updated
    })
  }

  const editSession = (sessionId: string, updatedNotes: string) => {
    setSessions(current => 
      (current || []).map(session => 
        session.id === sessionId 
          ? { ...session, notes: updatedNotes }
          : session
      )
    )
  }

  const deleteSession = (sessionId: string) => {
    setSessions(current => (current || []).filter(s => s.id !== sessionId))
  }

  const updateTopics = (topic: string, subtopic: string) => {
    setTopics(current => {
      const currentTopics = current || []
      if (!currentTopics.includes(topic)) {
        return [...currentTopics, topic]
      }
      return currentTopics
    })
    
    setSubtopics(current => ({
      ...(current || {}),
      [topic]: (current && current[topic]?.includes(subtopic)) 
        ? current[topic] 
        : [...((current && current[topic]) || []), subtopic]
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-3 py-2 md:p-6">
        <header className="mobile-header flex items-center justify-between py-2 md:py-10 mb-2 md:mb-6">
          <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
            <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
                  <Clock size={16} className="text-white md:size-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-lg md:text-5xl font-bold mb-0 md:mb-1 truncate">
                    StudyFlow
                  </h1>
                  <p className="text-muted-foreground font-ui text-xs md:text-lg hidden md:block font-medium">
                    🚀 Ignite your learning journey with smart study sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings button for mobile */}
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setActiveTab('settings')}
            className="md:hidden mobile-nav-trigger flex-shrink-0"
          >
            <Gear size={18} />
          </Button>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop tabs - hidden on mobile */}
          <TabsList className="hidden md:grid w-full grid-cols-6 mb-8 modern-tabs p-1 bg-gradient-to-r from-white/70 via-blue-50/80 to-purple-50/70 backdrop-blur-xl border border-blue-200/30 shadow-lg">
            <TabsTrigger value="timer" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <Clock size={18} />
              ⏰ Timer
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <BookOpen size={18} />
              📝 Notes
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <Flame size={18} />
              🔥 Streaks
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <ChartBar size={18} />
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <ClockCounterClockwise size={18} />
              📚 History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 font-ui font-medium rounded-lg transition-all">
              <Gear size={18} />
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="🎯 Study Timer" description="Focus sessions with break management - You've got this! 💪" />
              <StudyTimer
                settings={safeSettings}
                topics={safeTopics}
                subtopics={safeSubtopics}
                onSessionComplete={addSession}
                onTopicUpdate={updateTopics}
                onSwitchToNotes={() => setActiveTab('notes')}
              />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="✨ Session Notes" description="Your brilliant ideas and insights await! 📝✨" />
              <SessionNotes 
                sessions={safeSessions} 
                settings={safeSettings}
                onEditSession={editSession}
                onDeleteSession={deleteSession}
              />
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="🔥 Study Streaks" description="Build unstoppable momentum - Every day counts! 🚀" />
              <StreakTracker
                streakData={safeStreakData}
                achievements={safeAchievements}
                sessions={safeSessions}
                onUpdateWeeklyGoal={(goal) => {
                  setStreakData(current => ({ ...(current || safeStreakData), weeklyGoal: goal }))
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="📊 Analytics Dashboard" description="See your incredible progress and growth! 📈🌟" />
              <Dashboard sessions={safeSessions} streakData={safeStreakData} achievements={safeAchievements} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="📚 Session History" description="Celebrate your learning journey and achievements! 🎉" />
              <SessionHistory 
                sessions={safeSessions}
                onDeleteSession={deleteSession}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 md:space-y-6 mt-2 md:mt-8">
            <div className="enhanced-card mobile-card-content">
              <PageTitle title="⚙️ Settings" description="Customize your perfect learning environment! 🎨" />
              <Settings
                settings={safeSettings}
                onSettingsChange={setSettings}
                topics={safeTopics}
                subtopics={safeSubtopics}
                onTopicsChange={setTopics}
                onSubtopicsChange={setSubtopics}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App