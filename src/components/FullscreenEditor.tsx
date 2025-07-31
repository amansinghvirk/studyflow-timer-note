import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ArrowsIn, 
  Clock, 
  Eye, 
  EyeSlash, 
  FloppyDisk,
  X,
  MagicWand,
  Sparkle,
  ArrowsOut
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppSettings } from '@/App'

interface FullscreenEditorProps {
  isOpen: boolean
  onClose: () => void
  content: string
  onChange: (content: string) => void
  topic?: string
  subtopic?: string
  settings?: AppSettings
  timeLeft?: number
  totalTime?: number
  timerState?: 'idle' | 'running' | 'paused' | 'completed'
  onSave?: () => void
  autoSave?: boolean
}

export function FullscreenEditor({
  isOpen,
  onClose,
  content,
  onChange,
  topic,
  subtopic,
  settings,
  timeLeft = 0,
  totalTime = 0,
  timerState = 'idle',
  onSave,
  autoSave = true
}: FullscreenEditorProps) {
  const [showTimer, setShowTimer] = useState(true)
  const [showToolbar, setShowToolbar] = useState(true)
  const [localContent, setLocalContent] = useState(content)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isRealFullscreen, setIsRealFullscreen] = useState(false)
  const autoSaveRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
      
      autoSaveRef.current = setTimeout(() => {
        onChange(localContent)
        setHasUnsavedChanges(false)
        setLastSaved(new Date())
        toast.success('Notes auto-saved', { duration: 2000 })
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [localContent, hasUnsavedChanges, onChange, autoSave])

  // Sync content changes
  useEffect(() => {
    setLocalContent(content)
    setHasUnsavedChanges(false)
  }, [content])

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent)
    setHasUnsavedChanges(true)
  }, [])

  // Manual save
  const handleSave = useCallback(() => {
    onChange(localContent)
    setHasUnsavedChanges(false)
    setLastSaved(new Date())
    if (onSave) {
      onSave()
    }
    toast.success('Notes saved successfully')
  }, [localContent, onChange, onSave])

  // Handle ESC key to exit fullscreen and Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRealFullscreen) {
          exitRealFullscreen()
        } else {
          if (hasUnsavedChanges) {
            handleSave()
          }
          onClose()
        }
      }
      
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }

      // F11 for real fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        toggleRealFullscreen()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, hasUnsavedChanges, handleSave, onClose, isRealFullscreen])

  // Handle real fullscreen mode
  const toggleRealFullscreen = async () => {
    if (!isRealFullscreen) {
      await enterRealFullscreen()
    } else {
      await exitRealFullscreen()
    }
  }

  const enterRealFullscreen = async () => {
    try {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen()
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen()
        }
        setIsRealFullscreen(true)
        toast.success('Fullscreen mode enabled', {
          description: 'Press F11 or ESC to exit fullscreen'
        })
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
      toast.error('Could not enter fullscreen mode')
    }
  }

  const exitRealFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
      setIsRealFullscreen(false)
      toast.info('Fullscreen mode disabled')
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsRealFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  // Get timer status color
  const getTimerColor = () => {
    switch (timerState) {
      case 'running': return 'text-green-600'
      case 'paused': return 'text-yellow-600'
      case 'completed': return 'text-blue-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-screen h-screen max-w-none max-h-none m-0 p-0 border-0 rounded-none bg-background [&>button]:hidden"
      >
        <div ref={containerRef} className="h-full flex flex-col bg-background">
          {/* Top Bar */}
          <div className={`flex items-center justify-between p-4 bg-card border-b transition-all duration-300 ${showToolbar ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center gap-4">
              {/* Topic/Subtopic Info */}
              {topic && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-medium">
                    {topic}
                  </Badge>
                  {subtopic && (
                    <Badge variant="secondary" className="text-sm">
                      {subtopic}
                    </Badge>
                  )}
                </div>
              )}

              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    Unsaved changes
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Timer Display */}
            {showTimer && timeLeft > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={20} className={getTimerColor()} />
                  <span className={`font-mono text-lg font-bold ${getTimerColor()}`}>
                    {formatTime(timeLeft)}
                  </span>
                  {timerState === 'running' && (
                    <Badge variant="outline" className="text-xs">
                      {((progressPercentage)).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                
                {/* Progress Bar */}
                {totalTime > 0 && (
                  <div className="w-32">
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Toggle Timer Visibility */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTimer(!showTimer)}
                    >
                      {showTimer ? <Eye size={20} /> : <EyeSlash size={20} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showTimer ? 'Hide timer' : 'Show timer'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Real Fullscreen Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRealFullscreen}
                    >
                      {isRealFullscreen ? <ArrowsIn size={20} /> : <ArrowsOut size={20} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRealFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen (F11)'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Manual Save */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges}
                    >
                      <FloppyDisk size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save notes (Ctrl+S)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Exit Fullscreen */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          handleSave()
                        }
                        onClose()
                      }}
                    >
                      <ArrowsIn size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exit fullscreen (ESC)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Close */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          const shouldSave = window.confirm('You have unsaved changes. Save before closing?')
                          if (shouldSave) {
                            handleSave()
                          }
                        }
                        onClose()
                      }}
                    >
                      <X size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Toggle Toolbar Button (when hidden) */}
          {!showToolbar && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToolbar(true)}
                className="bg-background/80 backdrop-blur-sm"
              >
                Show Controls
              </Button>
            </div>
          )}

          {/* Hide Toolbar Button (when visible) */}
          {showToolbar && (
            <div className="absolute top-20 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToolbar(false)}
                className="bg-background/80 backdrop-blur-sm"
              >
                Hide Controls
              </Button>
            </div>
          )}

          {/* Editor Area */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full max-w-4xl mx-auto">
              <RichTextEditor
                content={localContent}
                onChange={handleContentChange}
                placeholder="Start writing your notes... Use ESC to exit fullscreen, F11 for full browser fullscreen, or click the controls in the top-right corner."
                className="h-full"
                editorHeight="calc(100vh - 200px)"
                showAIFeatures={true}
                settings={settings}
                topic={topic}
                subtopic={subtopic}
              />
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded p-2">
            <div className="space-y-1">
              <div>ESC: Exit fullscreen</div>
              <div>F11: Toggle browser fullscreen</div>
              <div>Ctrl+S: Save notes</div>
              {autoSave && <div>Auto-save: Enabled</div>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}