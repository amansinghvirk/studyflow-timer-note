import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, SkipForward, Coffee, BookOpen } from '@phosphor-icons/react'
import { RichTextEditor } from '@/components/RichTextEditor'
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
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<Date>()

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
      toast.success('Study session completed!', {
        description: `You studied ${selectedTopic} - ${selectedSubtopic} for ${settings.defaultDuration} minutes.`
      })
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
    setTimerState('idle')
    setTimeLeft(totalTime)
    if (sessionType === 'study') {
      setShowEditor(false)
      setNotes('')
    }
    toast.info('Timer stopped')
  }

  const skipToNotes = () => {
    if (timerState === 'running' || timerState === 'paused') {
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="font-ui">Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
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
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtopic" className="font-ui">Subtopic</Label>
                  <Select 
                    value={selectedSubtopic} 
                    onValueChange={setSelectedSubtopic}
                    disabled={!selectedTopic}
                  >
                    <SelectTrigger>
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
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-accent border-t-transparent transition-all duration-1000 ease-linear"
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
                <p className="font-ui text-sm text-muted-foreground">Studying</p>
                <p className="font-display text-lg font-semibold text-foreground">
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

            {timerState === 'running' && (
              <>
                <Button 
                  onClick={pauseTimer} 
                  variant="secondary" 
                  size="lg"
                  className="flex items-center gap-2 font-ui"
                >
                  <Pause size={20} />
                  Pause
                </Button>
                <Button 
                  onClick={stopTimer} 
                  variant="destructive" 
                  size="lg"
                  className="flex items-center gap-2 font-ui"
                >
                  <Square size={20} />
                  Stop
                </Button>
                <Button 
                  onClick={skipToNotes} 
                  variant="outline" 
                  size="lg"
                  className="flex items-center gap-2 font-ui"
                >
                  <SkipForward size={20} />
                  {sessionType === 'study' ? 'Finish Early' : 'Skip Break'}
                </Button>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <Button 
                  onClick={resumeTimer} 
                  size="lg"
                  className="flex items-center gap-2 font-ui"
                >
                  <Play size={20} />
                  Resume
                </Button>
                <Button 
                  onClick={stopTimer} 
                  variant="destructive" 
                  size="lg"
                  className="flex items-center gap-2 font-ui"
                >
                  <Square size={20} />
                  Stop
                </Button>
              </>
            )}

            {timerState === 'completed' && (
              <>
                {sessionType === 'study' ? (
                  <div className="flex gap-3">
                    <Button 
                      onClick={saveSession} 
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      Save & Start Break
                    </Button>
                    <Button 
                      onClick={() => {
                        saveSession()
                      }} 
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2 font-ui"
                    >
                      Save Only
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

      {/* Rich Text Editor */}
      {showEditor && sessionType === 'study' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Session Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={notes}
              onChange={setNotes}
              placeholder="Take notes during your study session..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}