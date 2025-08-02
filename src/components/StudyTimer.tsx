import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Pause, Square, SkipForward, Coffee, BookOpen, Eye, EyeSlash, Gear, ArrowsOut, ArrowsIn } from '@phosphor-icons/react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { FullscreenEditor } from '@/components/FullscreenEditor'
import { AINotesEnhancer } from '@/components/AINotesEnhancer'
import { toast } from 'sonner'
import type { StudySession, AppSettings } from '@/App'

interface StudyTimerProps {
  settings: AppSettings
  topics: string[]
  subtopics: Record<string, string[]>
  onSessionComplete: (session: StudySession) => void
  onTopicUpdate: (topic: string, subtopic: string) => void
  onSwitchToNotes: () => void
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed'
type SessionType = 'study' | 'break' | 'longbreak'

export function StudyTimer({ 
  settings, 
  topics, 
  subtopics, 
  onSessionComplete, 
  onTopicUpdate,
  onSwitchToNotes 
}: StudyTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [sessionType, setSessionType] = useState<SessionType>('study')
  const [timeLeft, setTimeLeft] = useState(settings.defaultDuration * 60)
  const [totalTime, setTotalTime] = useState(settings.defaultDuration * 60)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedSubtopic, setSelectedSubtopic] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newSubtopic, setNewSubtopic] = useState('')
  const [notes, setNotes] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [localDistractionFree, setLocalDistractionFree] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenEditor, setShowFullscreenEditor] = useState(false)
  const [showAIEnhancer, setShowAIEnhancer] = useState(false)
  const [pendingSessionData, setPendingSessionData] = useState<{
    topic: string
    subtopic: string
    duration: number
    completedAt: Date
  } | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<Date>()
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)

  // Show split layout when timer is running/paused and it's a study session
  const showSplitLayout = showEditor && sessionType === 'study' && (timerState === 'running' || timerState === 'paused')
  
  // Determine if we should show in distraction-free mode
  const isDistractionFree = (settings.distractionFreeMode || localDistractionFree) && 
                           (timerState === 'running') && 
                           sessionType === 'study'

  useEffect(() => {
    if (sessionType === 'study') {
      setTimeLeft(settings.defaultDuration * 60)
      setTotalTime(settings.defaultDuration * 60)
    } else if (sessionType === 'break') {
      setTimeLeft(settings.breakDuration * 60)
      setTotalTime(settings.breakDuration * 60)
    } else if (sessionType === 'longbreak') {
      setTimeLeft(settings.longBreakDuration * 60)
      setTotalTime(settings.longBreakDuration * 60)
    }
  }, [settings.defaultDuration, settings.breakDuration, settings.longBreakDuration, sessionType])

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState])

  // Keyboard shortcuts for distraction-free mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D to toggle distraction-free mode during active sessions
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && 
          sessionType === 'study' && timerState === 'running') {
        e.preventDefault()
        toggleDistractionFree()
      }
      
      // F11 to toggle fullscreen during active study sessions
      if (e.key === 'F11' && sessionType === 'study' && 
          (timerState === 'running' || timerState === 'paused')) {
        e.preventDefault()
        toggleFullscreen()
      }
      
      // Space bar to pause/resume in distraction-free mode
      if (e.code === 'Space' && isDistractionFree && sessionType === 'study') {
        e.preventDefault()
        if (timerState === 'running') {
          pauseTimer()
        } else if (timerState === 'paused') {
          resumeTimer()
        }
      }
      
      // Escape to exit fullscreen
      if (e.key === 'Escape' && showFullscreenEditor) {
        exitFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [sessionType, timerState, localDistractionFree, settings.distractionFreeMode, showFullscreenEditor])

  // Toggle local distraction-free mode
  const toggleDistractionFree = () => {
    setLocalDistractionFree(!localDistractionFree)
    toast.info(!localDistractionFree ? 'Distraction-free mode enabled' : 'Distraction-free mode disabled')
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!showFullscreenEditor) {
      enterFullscreen()
    } else {
      exitFullscreen()
    }
  }

  const enterFullscreen = async () => {
    try {
      // Instead of using document fullscreen API which requires user gesture,
      // we'll use the FullscreenEditor component which handles fullscreen properly
      setShowFullscreenEditor(true)
      toast.success('Fullscreen notes mode enabled', {
        description: 'Press ESC to exit fullscreen'
      })
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
      toast.error('Could not enter fullscreen mode')
    }
  }

  const exitFullscreen = async () => {
    try {
      setShowFullscreenEditor(false)
      setIsFullscreen(false)
      toast.info('Fullscreen mode disabled')
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }

  // Listen for fullscreen changes from FullscreenEditor
  useEffect(() => {
    // Remove fullscreen change listener since we're using FullscreenEditor component
  }, [showFullscreenEditor])

  const playNotificationSound = (frequency = 800) => {
    if (settings.audioNotifications) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    }
  }

  const handleTimerComplete = () => {
    setTimerState('completed')
    playNotificationSound(sessionType === 'study' ? 800 : 600)

    if (sessionType === 'study') {
      // Check if we should show AI enhancement dialog
      if (startTimeRef.current && (selectedTopic && selectedSubtopic) && notes.trim() && 
          settings?.aiSettings?.enabled && settings?.aiSettings?.apiKey) {
        
        const actualDuration = Math.round((totalTime - timeLeft) / 60)
        
        // Store session data for later saving
        setPendingSessionData({
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          duration: actualDuration,
          completedAt: new Date()
        })
        
        // Exit fullscreen before showing AI enhancer
        if (showFullscreenEditor) {
          setShowFullscreenEditor(false)
          setIsFullscreen(false)
        }
        
        // Show AI enhancement dialog
        setShowAIEnhancer(true)
        
        toast.success('Study session completed!', {
          description: `You studied ${selectedTopic} - ${selectedSubtopic} for ${actualDuration} minutes. AI enhancement is available.`,
          duration: 4000
        })
      } else if (startTimeRef.current && (selectedTopic && selectedSubtopic)) {
        // Auto-save without AI enhancement
        const actualDuration = Math.round((totalTime - timeLeft) / 60)
        const session: StudySession = {
          id: Date.now().toString(),
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          duration: actualDuration,
          completedAt: new Date(),
          notes: notes
        }
        
        onSessionComplete(session)
        
        // Exit fullscreen when session completes
        if (showFullscreenEditor) {
          setShowFullscreenEditor(false)
          setIsFullscreen(false)
        }
        
        toast.success('Study session completed and notes auto-saved!', {
          description: `You studied ${selectedTopic} - ${selectedSubtopic} for ${actualDuration} minutes.`,
          duration: 4000,
          action: {
            label: "Start Break",
            onClick: () => switchToBreak()
          }
        })
      } else {
        toast.success('Study session completed!', {
          description: `Session duration: ${Math.round((totalTime - timeLeft) / 60)} minutes.`
        })
      }
    } else {
      toast.success(`${sessionType === 'longbreak' ? 'Long break' : 'Break'} completed!`, {
        description: 'Ready to get back to studying?'
      })
    }
  }

  const startTimer = () => {
    if (sessionType === 'study' && (!selectedTopic || !selectedSubtopic)) {
      toast.error('Please select a topic and subtopic before starting')
      return
    }

    if (selectedTopic === 'new' && !newTopic.trim()) {
      toast.error('Please enter a topic name')
      return
    }

    if (selectedSubtopic === 'new' && !newSubtopic.trim()) {
      toast.error('Please enter a subtopic name')
      return
    }

    if (sessionType === 'study') {
      const finalTopic = selectedTopic === 'new' ? newTopic.trim() : selectedTopic
      const finalSubtopic = selectedSubtopic === 'new' ? newSubtopic.trim() : selectedSubtopic

      onTopicUpdate(finalTopic, finalSubtopic)
      setSelectedTopic(finalTopic)
      setSelectedSubtopic(finalSubtopic)
      setShowEditor(true)
    }
    
    startTimeRef.current = new Date()
    setTimerState('running')
    
    const sessionName = sessionType === 'study' ? 'Study session' : 
                       sessionType === 'longbreak' ? 'Long break' : 'Break'
    const duration = sessionType === 'study' ? settings.defaultDuration :
                    sessionType === 'longbreak' ? settings.longBreakDuration :
                    settings.breakDuration
    
    toast.success(`${sessionName} started!`, {
      description: `Timer set for ${duration} minutes`
    })
  }

  const pauseTimer = () => {
    setTimerState('paused')
    toast.info('Timer paused')
  }

  const resumeTimer = () => {
    setTimerState('running')
    toast.info('Timer resumed')
  }

  const stopTimer = () => {
    // Check if we should show AI enhancement dialog
    if (sessionType === 'study' && startTimeRef.current && 
        selectedTopic && selectedSubtopic && notes.trim() && 
        settings?.aiSettings?.enabled && settings?.aiSettings?.apiKey) {
      
      const actualDuration = Math.max(1, Math.round((totalTime - timeLeft) / 60))
      
      // Store session data for later saving
      setPendingSessionData({
        topic: selectedTopic,
        subtopic: selectedSubtopic,
        duration: actualDuration,
        completedAt: new Date()
      })
      
      // Exit fullscreen before showing AI enhancer
      if (showFullscreenEditor) {
        setShowFullscreenEditor(false)
        setIsFullscreen(false)
      }
      
      // Show AI enhancement dialog
      setShowAIEnhancer(true)
      
      toast.info('Session stopped', {
        description: 'AI enhancement is available for your notes'
      })
      
    } else {
      // Auto-save notes if there's content and proper session info
      if (sessionType === 'study' && startTimeRef.current && 
          selectedTopic && selectedSubtopic && (notes.trim() || timeLeft < totalTime)) {
        const actualDuration = Math.max(1, Math.round((totalTime - timeLeft) / 60)) // Minimum 1 minute
        const session: StudySession = {
          id: Date.now().toString(),
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          duration: actualDuration,
          completedAt: new Date(),
          notes: notes || '' // Save empty string if no notes
        }
        
        onSessionComplete(session)
        toast.success('Session stopped and notes saved!', {
          description: `Study time: ${actualDuration} minutes`
        })
      }
      
      setTimerState('idle')
      setTimeLeft(totalTime)
      if (sessionType === 'study') {
        setShowEditor(false)
        setNotes('')
        // Exit fullscreen when stopping timer
        if (showFullscreenEditor) {
          setShowFullscreenEditor(false)
          setIsFullscreen(false)
        }
      }
      
      if (!selectedTopic || !selectedSubtopic) {
        toast.info('Timer stopped')
      }
    }
  }

  const skipToNotes = () => {
    if (timerState === 'running' || timerState === 'paused') {
      // Auto-save notes before finishing early
      if (startTimeRef.current && (selectedTopic && selectedSubtopic) && notes.trim()) {
        const actualDuration = Math.round((totalTime - timeLeft) / 60)
        const session: StudySession = {
          id: Date.now().toString(),
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          duration: actualDuration,
          completedAt: new Date(),
          notes: notes
        }
        
        onSessionComplete(session)
        toast.success('Session ended early and notes saved!', {
          description: `Study time: ${actualDuration} minutes`
        })
      }
      
      handleTimerComplete()
    }
  }

  const switchToBreak = () => {
    if (sessionType === 'study') {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)
      
      // Determine break type
      const nextSessionType = newCompletedSessions % settings.sessionsUntilLongBreak === 0 
        ? 'longbreak' 
        : 'break'
      
      setSessionType(nextSessionType)
      setCurrentCycle(Math.floor(newCompletedSessions / settings.sessionsUntilLongBreak) + 1)
      
      const breakDuration = nextSessionType === 'longbreak' 
        ? settings.longBreakDuration 
        : settings.breakDuration
      
      setTimeLeft(breakDuration * 60)
      setTotalTime(breakDuration * 60)
      setTimerState('idle')
      setShowEditor(false)
      
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setTimerState('running')
          startTimeRef.current = new Date()
        }, 2000)
      }
      
      toast.success(`Time for a ${nextSessionType === 'longbreak' ? 'long break' : 'break'}!`, {
        description: `${breakDuration} minute break recommended`
      })
    }
  }

  const switchToStudy = () => {
    setSessionType('study')
    setTimeLeft(settings.defaultDuration * 60)
    setTotalTime(settings.defaultDuration * 60)
    setTimerState('idle')
    toast.success('Ready for your next study session!')
  }

  const handleAIEnhancedSave = (enhancedNotes: string) => {
    if (pendingSessionData) {
      const session: StudySession = {
        id: Date.now().toString(),
        topic: pendingSessionData.topic,
        subtopic: pendingSessionData.subtopic,
        duration: pendingSessionData.duration,
        completedAt: pendingSessionData.completedAt,
        notes: enhancedNotes
      }
      
      onSessionComplete(session)
      
      // Reset state
      setTimerState('idle')
      setTimeLeft(totalTime)
      setShowEditor(false)
      setNotes('')
      setPendingSessionData(null)
      setShowAIEnhancer(false)
      
      toast.success('Enhanced notes saved successfully!', {
        description: `Study session completed with AI enhancements`,
        action: {
          label: "Start Break",
          onClick: () => switchToBreak()
        }
      })
    }
  }

  const saveSession = () => {
    if (startTimeRef.current && (selectedTopic && selectedSubtopic)) {
      const session: StudySession = {
        id: Date.now().toString(),
        topic: selectedTopic,
        subtopic: selectedSubtopic,
        duration: Math.round((totalTime - timeLeft) / 60),
        completedAt: new Date(),
        notes: notes
      }
      
      onSessionComplete(session)
      
      // Auto-switch to break if this was a study session
      if (sessionType === 'study') {
        switchToBreak()
      } else {
        switchToStudy()
      }
      
      setNotes('')
      setSelectedTopic('')
      setSelectedSubtopic('')
      toast.success('Session saved successfully!')
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100

  const availableSubtopics = selectedTopic && selectedTopic !== 'new' 
    ? subtopics[selectedTopic] || [] 
    : []

  // Fullscreen Note-Taking Mode - now handled by FullscreenEditor component
  // The split layout logic remains for normal operation

  if (showSplitLayout && isDistractionFree) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Minimal Top Timer Bar - Distraction Free */}
        <div className="w-full bg-muted/20 border-b border-border/50 p-3 flex-shrink-0">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="font-mono text-2xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
              <div className="flex-1 max-w-48">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-ui">
                {selectedTopic} · {selectedSubtopic}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={pauseTimer} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pause size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pause (Space)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={toggleDistractionFree} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show controls (Ctrl+D)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Full-width Notes Pane - Distraction Free */}
        <div className="flex-1 min-h-0 p-4">
          <div className="h-full bg-card rounded-lg border">
            <div className="h-full p-6">
              <RichTextEditor
                content={notes}
                onChange={setNotes}
                placeholder="Focus on your notes..."
                className="h-full"
                editorHeight="100%"
                showAIFeatures={true}
                settings={settings}
                topic={selectedTopic}
                subtopic={selectedSubtopic}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showSplitLayout) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-200px)]">
        {/* Left Timer Pane - Compact on desktop, full width on mobile */}
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <Card className="h-auto lg:h-full">
            <CardHeader className="pb-4">
              <div className="text-center">
                <CardTitle className="font-display text-lg mb-2">
                  Study Session
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <BookOpen size={12} />
                    Study
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Cycle {currentCycle}
                  </Badge>
                </div>
                <div className="text-center mb-3">
                  <p className="font-ui text-xs text-muted-foreground">Studying</p>
                  <p className="font-display text-sm font-semibold text-foreground mobile-text-sm truncate">
                    {selectedTopic} - {selectedSubtopic}
                  </p>
                </div>
              </div>
            </CardHeader>
                    {selectedTopic} - {selectedSubtopic}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compact Timer Display */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-6 border-muted"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-6 border-accent border-t-transparent transition-all duration-1000 ease-linear"
                    style={{
                      transform: `rotate(${progressPercentage * 3.6}deg)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-mono text-2xl font-bold text-foreground">{formatTime(timeLeft)}</div>
                  </div>
                </div>
                <Progress value={progressPercentage} className="w-full mb-4" />
              </div>

              {/* Compact Timer Controls */}
              <div className="space-y-2">
                {/* Show indicator if global distraction-free mode is enabled */}
                {settings.distractionFreeMode && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      <EyeSlash size={10} className="mr-1" />
                      Auto-Focus Mode
                    </Badge>
                  </div>
                )}
                
                {!isDistractionFree && (
                  <>
                    {timerState === 'running' && (
                      <>
                        <Button 
                          onClick={pauseTimer} 
                          variant="secondary" 
                          size="sm"
                          className="w-full flex items-center gap-2 font-ui"
                        >
                          <Pause size={16} />
                          Pause
                        </Button>
                        <div className="grid grid-cols-4 gap-2">
                          <Button 
                            onClick={stopTimer} 
                            variant="destructive" 
                            size="sm"
                            className="flex items-center gap-1 font-ui text-xs"
                          >
                            <Square size={12} />
                            Stop
                          </Button>
                          <Button 
                            onClick={skipToNotes} 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1 font-ui text-xs"
                          >
                            <SkipForward size={12} />
                            Finish
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  onClick={toggleFullscreen} 
                                  variant="ghost" 
                                  size="sm"
                                  className="flex items-center gap-1 font-ui text-xs"
                                >
                                  <ArrowsOut size={12} />
                                  Full
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Fullscreen notes (F11)</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  onClick={toggleDistractionFree} 
                                  variant="ghost" 
                                  size="sm"
                                  className="flex items-center gap-1 font-ui text-xs"
                                >
                                  <EyeSlash size={12} />
                                  Focus
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Hide controls for better focus (Ctrl+D)</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </>
                    )}

                    {timerState === 'paused' && (
                      <>
                        <Button 
                          onClick={resumeTimer} 
                          size="sm"
                          className="w-full flex items-center gap-2 font-ui"
                        >
                          <Play size={16} />
                          Resume
                        </Button>
                        <Button 
                          onClick={stopTimer} 
                          variant="destructive" 
                          size="sm"
                          className="w-full flex items-center gap-2 font-ui"
                        >
                          <Square size={16} />
                          Stop
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Notes Pane - Expanded on desktop, full width on mobile */}
        <div className="flex-1 min-w-0 mt-4 lg:mt-0">
          <Card className="h-auto lg:h-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="font-display text-lg lg:text-xl">Session Notes</CardTitle>
                  <p className="text-xs lg:text-sm text-muted-foreground font-ui truncate">
                    Take notes while you study • {selectedTopic} - {selectedSubtopic}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setShowFullscreenEditor(true)} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 font-ui mobile-form-element"
                      >
                        <ArrowsOut size={16} />
                        <span className="hidden sm:inline">Fullscreen</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open fullscreen note editor</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto">
                <RichTextEditor
                  content={notes}
                  onChange={setNotes}
                  placeholder="Start taking notes for your study session..."
                  className="h-full"
                  editorHeight="100%"
                  showAIFeatures={true}
                  settings={settings}
                  topic={selectedTopic}
                  subtopic={selectedSubtopic}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default layout for setup and completed states
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">
              {sessionType === 'study' && 'Study Timer'}
              {sessionType === 'break' && 'Break Timer'}
              {sessionType === 'longbreak' && 'Long Break Timer'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {sessionType === 'study' ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <BookOpen size={14} />
                  Study
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Coffee size={14} />
                  {sessionType === 'longbreak' ? 'Long Break' : 'Break'}
                </Badge>
              )}
              <Badge variant="outline">
                Cycle {currentCycle} • Session {(completedSessions % settings.sessionsUntilLongBreak) + 1}/{settings.sessionsUntilLongBreak}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Selection */}
          {(timerState === 'idle' && sessionType === 'study') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="font-ui text-sm font-medium">Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="mobile-form-element">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                      <SelectItem value="new">+ Add new topic</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedTopic === 'new' && (
                    <Input
                      placeholder="Enter new topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="mt-2 mobile-form-element"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtopic" className="font-ui text-sm font-medium">Subtopic</Label>
                  <Select 
                    value={selectedSubtopic} 
                    onValueChange={setSelectedSubtopic}
                    disabled={!selectedTopic}
                  >
                    <SelectTrigger className="mobile-form-element">
                      <SelectValue placeholder="Select a subtopic" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubtopics.map(subtopic => (
                        <SelectItem key={subtopic} value={subtopic}>{subtopic}</SelectItem>
                      ))}
                      <SelectItem value="new">+ Add new subtopic</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedSubtopic === 'new' && (
                    <Input
                      placeholder="Enter new subtopic"
                      value={newSubtopic}
                      onChange={(e) => setNewSubtopic(e.target.value)}
                      className="mt-2 mobile-form-element"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 md:border-8 border-muted"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 md:border-8 border-accent border-t-transparent transition-all duration-1000 ease-linear"
                style={{
                  transform: `rotate(${progressPercentage * 3.6}deg)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="timer-display text-foreground">{formatTime(timeLeft)}</div>
              </div>
            </div>

            {selectedTopic && selectedSubtopic && timerState !== 'idle' && sessionType === 'study' && (
              <div className="text-center">
                <p className="font-ui text-xs md:text-sm text-muted-foreground">Studying</p>
                <p className="font-display text-base md:text-lg font-semibold text-foreground px-4">
                  {selectedTopic} - {selectedSubtopic}
                </p>
              </div>
            )}

            {(sessionType === 'break' || sessionType === 'longbreak') && timerState !== 'idle' && (
              <div className="text-center">
                <p className="font-ui text-sm text-muted-foreground">
                  {sessionType === 'longbreak' ? 'Long Break Time' : 'Break Time'}
                </p>
                <p className="font-display text-lg font-semibold text-foreground">
                  Take a well-deserved rest!
                </p>
              </div>
            )}

            <Progress value={progressPercentage} className="w-full max-w-md mx-auto" />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-4">
            {timerState === 'idle' && (
              <>
                <Button 
                  onClick={startTimer} 
                  size="lg" 
                  className="flex items-center gap-2 font-ui"
                >
                  <Play size={20} />
                  {sessionType === 'study' ? 'Start Session' : 
                   sessionType === 'longbreak' ? 'Start Long Break' : 'Start Break'}
                </Button>
                {sessionType !== 'study' && (
                  <Button 
                    onClick={switchToStudy} 
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 font-ui"
                  >
                    <BookOpen size={20} />
                    Skip to Study
                  </Button>
                )}
              </>
            )}

            {timerState === 'completed' && (
              <>
                {sessionType === 'study' ? (
                  <div className="flex gap-3">
                    <Button 
                      onClick={switchToBreak} 
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      <Coffee size={20} />
                      Start Break Now
                    </Button>
                    <Button 
                      onClick={() => {
                        // Reset for next session
                        setNotes('')
                        setSelectedTopic('')
                        setSelectedSubtopic('')
                        setTimerState('idle')
                        setShowEditor(false)
                        toast.success('Ready for your next study session!')
                      }} 
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      <BookOpen size={20} />
                      New Study Session
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={switchToStudy} 
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      <BookOpen size={20} />
                      Start Study Session
                    </Button>
                    <Button 
                      onClick={() => {
                        setTimerState('idle')
                        setTimeLeft(totalTime)
                      }} 
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      Skip Study
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Editor for completed state */}
      {showEditor && sessionType === 'study' && timerState === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Session Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={notes}
              onChange={setNotes}
              placeholder="Add any final notes for your session..."
              showAIFeatures={true}
              settings={settings}
              topic={selectedTopic}
              subtopic={selectedSubtopic}
            />
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Editor Modal */}
      <FullscreenEditor
        isOpen={showFullscreenEditor}
        onClose={() => {
          setShowFullscreenEditor(false)
          setIsFullscreen(false)
        }}
        content={notes}
        onChange={setNotes}
        topic={selectedTopic}
        subtopic={selectedSubtopic}
        settings={settings}
        timeLeft={timeLeft}
        totalTime={totalTime}
        timerState={timerState}
        onSave={() => {
          // Auto-save current session if in progress
          if (timerState === 'running' || timerState === 'paused') {
            toast.success('Notes saved during session')
          }
        }}
        autoSave={true}
      />

      {/* AI Notes Enhancer Modal */}
      {pendingSessionData && (
        <AINotesEnhancer
          isOpen={showAIEnhancer}
          onClose={() => {
            setShowAIEnhancer(false)
            setPendingSessionData(null)
          }}
          notes={notes}
          topic={pendingSessionData.topic}
          subtopic={pendingSessionData.subtopic}
          settings={settings}
          onSave={handleAIEnhancedSave}
        />
      )}
    </div>
  )
}