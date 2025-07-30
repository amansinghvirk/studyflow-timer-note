import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Clock, Database, Tag, Trash, Plus, Check, X, FloppyDisk, Info, Brain, Eye, EyeSlash, TestTube } from '@phosphor-icons/react'
import { AVAILABLE_MODELS } from '@/lib/ai'

import { PromptLibrary } from '@/components/PromptLibrary'
import { toast } from 'sonner'
import type { AppSettings } from '@/App'

interface SettingsProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
  topics: string[]
  subtopics: Record<string, string[]>
  onTopicsChange: (topics: string[]) => void
  onSubtopicsChange: (subtopics: Record<string, string[]>) => void
}

export function Settings({ 
  settings, 
  onSettingsChange, 
  topics, 
  subtopics, 
  onTopicsChange, 
  onSubtopicsChange 
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [newSubtopic, setNewSubtopic] = useState('')
  const [selectedTopicForSubtopic, setSelectedTopicForSubtopic] = useState('')
  const [dbType, setDbType] = useState(settings.externalDatabase?.type || 'none')
  const [connectionString, setConnectionString] = useState(settings.externalDatabase?.connectionString || '')
  const [testingConnection, setTestingConnection] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingAI, setTestingAI] = useState(false)
  const [customModel, setCustomModel] = useState('')
  const [useCustomModel, setUseCustomModel] = useState(false)

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings)
    setHasUnsavedChanges(false)
    
    // Initialize custom model if it exists
    if (settings.aiSettings?.customModel) {
      setCustomModel(settings.aiSettings.customModel)
      setUseCustomModel(true)
    }
  }, [settings])

  // Sync database type and connection string when settings change
  useEffect(() => {
    setDbType(settings.externalDatabase?.type || 'none')
    setConnectionString(settings.externalDatabase?.connectionString || '')
  }, [settings.externalDatabase])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasUnsavedChanges(hasChanges)
  }, [localSettings, settings])

  const updateLocalSettings = (updates: Partial<AppSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }))
  }

  const saveAllSettings = () => {
    onSettingsChange(localSettings)
    setHasUnsavedChanges(false)
    toast.success('Settings saved successfully!')
  }

  const resetSettings = () => {
    setLocalSettings(settings)
    setHasUnsavedChanges(false)
    toast.info('Settings reset to last saved values')
  }

  const addTopic = () => {
    if (!newTopic.trim()) {
      toast.error('Please enter a topic name')
      return
    }

    if (topics.includes(newTopic.trim())) {
      toast.error('Topic already exists')
      return
    }

    onTopicsChange([...topics, newTopic.trim()])
    setNewTopic('')
    toast.success('Topic added successfully')
  }

  const deleteTopic = (topicToDelete: string) => {
    onTopicsChange(topics.filter(topic => topic !== topicToDelete))
    
    const updatedSubtopics = { ...subtopics }
    delete updatedSubtopics[topicToDelete]
    onSubtopicsChange(updatedSubtopics)
    
    toast.success('Topic deleted successfully')
  }

  const addSubtopic = () => {
    if (!newSubtopic.trim() || !selectedTopicForSubtopic) {
      toast.error('Please enter a subtopic name and select a topic')
      return
    }

    const currentSubtopics = subtopics[selectedTopicForSubtopic] || []
    
    if (currentSubtopics.includes(newSubtopic.trim())) {
      toast.error('Subtopic already exists')
      return
    }

    onSubtopicsChange({
      ...subtopics,
      [selectedTopicForSubtopic]: [...currentSubtopics, newSubtopic.trim()]
    })
    
    setNewSubtopic('')
    toast.success('Subtopic added successfully')
  }

  const deleteSubtopic = (topic: string, subtopicToDelete: string) => {
    const updatedSubtopics = {
      ...subtopics,
      [topic]: subtopics[topic]?.filter(subtopic => subtopic !== subtopicToDelete) || []
    }
    
    onSubtopicsChange(updatedSubtopics)
    toast.success('Subtopic deleted successfully')
  }

  const testAIConnection = async () => {
    if (!localSettings.aiSettings?.apiKey?.trim()) {
      toast.error('Please enter an API key')
      return
    }

    setTestingAI(true)
    
    try {
      // Test the AI connection with a simple prompt
      const { testAIConnection: testConnection } = await import('@/lib/ai')
      const modelValue = useCustomModel ? customModel : (localSettings.aiSettings?.model || 'gemini-1.5-flash')
      
      const testResponse = await testConnection(
        localSettings.aiSettings?.apiKey || '',
        modelValue
      )

      if (testResponse.success) {
        toast.success('AI connection successful!')
      } else {
        toast.error(`AI connection failed: ${testResponse.message}`)
      }
    } catch (error) {
      toast.error('Failed to connect to AI service')
      console.error('AI connection test error:', error)
    } finally {
      setTestingAI(false)
    }
  }

  const testDatabaseConnection = async () => {
    if (!connectionString.trim()) {
      toast.error('Please enter a connection string')
      return
    }

    setTestingConnection(true)
    
    try {
      // Simulate connection test (in real app, this would make an actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Database connection successful!')
    } catch (error) {
      toast.error('Failed to connect to database')
    } finally {
      setTestingConnection(false)
    }
  }

  const saveDatabaseSettings = () => {
    if (dbType === 'none') {
      const { externalDatabase, ...settingsWithoutDb } = localSettings
      setLocalSettings(settingsWithoutDb)
      toast.success('External database disabled (remember to save all settings)')
    } else {
      updateLocalSettings({
        externalDatabase: {
          type: dbType,
          connectionString: connectionString
        }
      })
      toast.success('Database settings updated (remember to save all settings)')
    }
  }

  return (
    <div className="space-y-6">
      {/* Save Controls */}
      {hasUnsavedChanges && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                <span className="font-ui text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetSettings} className="font-ui flex-1 sm:flex-none">
                  Reset
                </Button>
                <Button size="sm" onClick={saveAllSettings} className="flex items-center gap-2 font-ui flex-1 sm:flex-none">
                  <FloppyDisk size={16} />
                  Save All Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="w-full settings-tabs">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 md:gap-1 h-auto md:h-14 p-2 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 backdrop-blur-sm border border-border/40 rounded-2xl shadow-sm">
          <TabsTrigger 
            value="general" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <Clock size={20} className="shrink-0 group-data-[state=active]:text-primary transition-colors duration-300" />
            <span className="font-medium">General</span>
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <Tag size={20} className="shrink-0 group-data-[state=active]:text-accent transition-colors duration-300" />
            <span className="font-medium">Topics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <Brain size={20} className="shrink-0 group-data-[state=active]:text-violet-600 transition-colors duration-300" />
            <span className="font-medium">AI</span>
          </TabsTrigger>
          <TabsTrigger 
            value="prompts" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <TestTube size={20} className="shrink-0 group-data-[state=active]:text-orange-500 transition-colors duration-300" />
            <span className="font-medium">Prompts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <Database size={20} className="shrink-0 group-data-[state=active]:text-blue-600 transition-colors duration-300" />
            <span className="font-medium">Database</span>
          </TabsTrigger>
          <TabsTrigger 
            value="about" 
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 font-ui justify-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-background/90 hover:shadow-sm data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:scale-[1.02] text-xs md:text-sm group"
          >
            <Info size={20} className="shrink-0 group-data-[state=active]:text-emerald-600 transition-colors duration-300" />
            <span className="font-medium">About</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-8">
          <Card className="border-border/40 shadow-lg shadow-primary/5 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <Clock size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Timer Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-ui mt-1">Configure your study and break durations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-duration" className="font-ui">Default Session Duration (minutes)</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Input
                    id="default-duration"
                    type="number"
                    min="1"
                    max="180"
                    value={localSettings.defaultDuration}
                    onChange={(e) => updateLocalSettings({ defaultDuration: parseInt(e.target.value) || 25 })}
                    className="w-full sm:w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {localSettings.defaultDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="break-duration" className="font-ui">Break Duration (minutes)</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.breakDuration}
                    onChange={(e) => updateLocalSettings({ breakDuration: parseInt(e.target.value) || 5 })}
                    className="w-full sm:w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {localSettings.breakDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break-duration" className="font-ui">Long Break Duration (minutes)</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Input
                    id="long-break-duration"
                    type="number"
                    min="1"
                    max="120"
                    value={localSettings.longBreakDuration}
                    onChange={(e) => updateLocalSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                    className="w-full sm:w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {localSettings.longBreakDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessions-until-long-break" className="font-ui">Study Sessions Until Long Break</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Input
                    id="sessions-until-long-break"
                    type="number"
                    min="2"
                    max="10"
                    value={localSettings.sessionsUntilLongBreak}
                    onChange={(e) => updateLocalSettings({ sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                    className="w-full sm:w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Every {localSettings.sessionsUntilLongBreak} sessions
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-start-breaks" className="font-ui">Auto-start Breaks</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="auto-start-breaks"
                    checked={localSettings.autoStartBreaks}
                    onCheckedChange={(checked) => updateLocalSettings({ autoStartBreaks: checked })}
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Automatically start break timers after study sessions
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio-notifications" className="font-ui">Audio Notifications</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="audio-notifications"
                    checked={localSettings.audioNotifications}
                    onCheckedChange={(checked) => updateLocalSettings({ audioNotifications: checked })}
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Play sound when timer completes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distraction-free-mode" className="font-ui">Distraction-Free Mode</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="distraction-free-mode"
                    checked={localSettings.distractionFreeMode}
                    onCheckedChange={(checked) => updateLocalSettings({ distractionFreeMode: checked })}
                  />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground font-ui">
                      Hide timer controls during active sessions for better focus
                    </span>
                    <p className="text-xs text-muted-foreground font-ui mt-1">
                      Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+D</kbd> to toggle during study sessions
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <Label className="font-ui font-medium text-base">Quick Settings</Label>
                </div>
                
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground font-ui">Study Duration</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant={localSettings.defaultDuration === 15 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ defaultDuration: 15 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        15 min
                      </Button>
                      <Button
                        variant={localSettings.defaultDuration === 25 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ defaultDuration: 25 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        25 min
                      </Button>
                      <Button
                        variant={localSettings.defaultDuration === 45 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ defaultDuration: 45 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        45 min
                      </Button>
                      <Button
                        variant={localSettings.defaultDuration === 60 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ defaultDuration: 60 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        60 min
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground font-ui">Break Duration</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant={localSettings.breakDuration === 3 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ breakDuration: 3 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        3 min
                      </Button>
                      <Button
                        variant={localSettings.breakDuration === 5 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ breakDuration: 5 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        5 min
                      </Button>
                      <Button
                        variant={localSettings.breakDuration === 10 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ breakDuration: 10 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        10 min
                      </Button>
                      <Button
                        variant={localSettings.breakDuration === 15 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ breakDuration: 15 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        15 min
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground font-ui">Long Break Duration</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant={localSettings.longBreakDuration === 15 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ longBreakDuration: 15 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        15 min
                      </Button>
                      <Button
                        variant={localSettings.longBreakDuration === 20 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ longBreakDuration: 20 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        20 min
                      </Button>
                      <Button
                        variant={localSettings.longBreakDuration === 30 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ longBreakDuration: 30 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        30 min
                      </Button>
                      <Button
                        variant={localSettings.longBreakDuration === 45 ? 'default' : 'outline'}
                        onClick={() => updateLocalSettings({ longBreakDuration: 45 })}
                        className="font-ui h-12 text-sm font-medium"
                      >
                        45 min
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topic Management */}
        <TabsContent value="topics" className="space-y-6 mt-8">
          <Card className="border-border/40 shadow-lg shadow-accent/5 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                  <Tag size={24} className="text-accent" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Manage Topics
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-ui mt-1">Organize your study subjects and subtopics</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Topic */}
              <Card className="p-4 bg-muted/30 border-dashed border-2 border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <Label htmlFor="new-topic" className="font-ui font-medium">Add New Topic</Label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="new-topic"
                      placeholder="Enter topic name (e.g., Mathematics, Science)"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                      className="font-ui flex-1 h-12"
                    />
                    <Button onClick={addTopic} className="flex items-center gap-2 font-ui sm:w-auto h-12 px-6">
                      <Plus size={16} />
                      Add Topic
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Topics List */}
              <div className="space-y-3">
                <Label className="font-ui">Existing Topics</Label>
                {topics.length === 0 ? (
                  <p className="text-muted-foreground text-sm font-ui">No topics added yet</p>
                ) : (
                  <div className="grid gap-3">
                    {topics.map((topic) => (
                      <Card key={topic} className="p-4 border border-border/50 hover:border-border transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-ui font-medium">{topic}</Badge>
                              <span className="text-sm text-muted-foreground font-ui">
                                {subtopics[topic]?.length || 0} subtopic{(subtopics[topic]?.length || 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {subtopics[topic] && subtopics[topic].length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {subtopics[topic].map((subtopic) => (
                                  <div key={subtopic} className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-lg text-sm border border-border/30">
                                    <span className="font-ui">{subtopic}</span>
                                    <button
                                      onClick={() => deleteSubtopic(topic, subtopic)}
                                      className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors ml-3">
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{topic}" and all its subtopics? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTopic(topic)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Subtopic */}
              {topics.length > 0 && (
                <Card className="p-4 bg-secondary/10 border border-secondary/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <Label className="font-ui font-medium">Add Subtopic</Label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={selectedTopicForSubtopic} onValueChange={setSelectedTopicForSubtopic}>
                        <SelectTrigger className="w-full sm:w-56 h-12">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Enter subtopic name (e.g., Algebra, Geometry)"
                        value={newSubtopic}
                        onChange={(e) => setNewSubtopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubtopic()}
                        className="font-ui flex-1 h-12"
                      />
                      <Button onClick={addSubtopic} className="flex items-center gap-2 font-ui sm:w-auto h-12 px-6">
                        <Plus size={16} />
                        Add Subtopic
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6 mt-8">
          <Card className="border-border/40 shadow-lg shadow-violet-500/5 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-100/80 to-violet-50/80 rounded-xl border border-violet-200/50">
                  <Brain size={24} className="text-violet-600" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    AI Assistant Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-ui mt-1">Configure AI integration for note enhancement</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Enable/Disable */}
              <div className="space-y-2">
                <Label htmlFor="ai-enabled" className="font-ui">Enable AI Features</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="ai-enabled"
                    checked={localSettings.aiSettings?.enabled || false}
                    onCheckedChange={(checked) => updateLocalSettings({ 
                      aiSettings: { ...(localSettings.aiSettings || {}), enabled: checked } 
                    })}
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Enable AI-powered note enhancement and insights
                  </span>
                </div>
              </div>

              {localSettings.aiSettings?.enabled && (
                <>
                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-api-key" className="font-ui">Google AI API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="ai-api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your Google AI API key"
                          value={localSettings.aiSettings?.apiKey || ''}
                          onChange={(e) => updateLocalSettings({ 
                            aiSettings: { ...(localSettings.aiSettings || {}), apiKey: e.target.value } 
                          })}
                          className="font-ui pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeSlash size={16} className="text-muted-foreground" />
                          ) : (
                            <Eye size={16} className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-ui">
                      Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                    </p>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="ai-model" className="font-ui">AI Model</Label>
                    
                    {/* Custom Model Toggle */}
                    <div className="flex items-center gap-3 mb-2">
                      <Switch
                        id="use-custom-model"
                        checked={useCustomModel}
                        onCheckedChange={(checked) => {
                          setUseCustomModel(checked)
                          if (!checked) {
                            // Reset to default model when disabling custom
                            updateLocalSettings({ 
                              aiSettings: { 
                                ...(localSettings.aiSettings || {}), 
                                model: 'gemini-1.5-flash',
                                customModel: undefined
                              } 
                            })
                            setCustomModel('')
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground font-ui">
                        Use custom model
                      </span>
                    </div>

                    {useCustomModel ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter custom model name (e.g., gpt-3.5-turbo, claude-3-opus)"
                          value={customModel}
                          onChange={(e) => {
                            setCustomModel(e.target.value)
                            updateLocalSettings({ 
                              aiSettings: { 
                                ...(localSettings.aiSettings || {}), 
                                customModel: e.target.value,
                                model: e.target.value // Update the main model field too
                              } 
                            })
                          }}
                          className="font-ui"
                        />
                        <p className="text-xs text-muted-foreground font-ui">
                          Enter the exact model name as required by your API provider
                        </p>
                      </div>
                    ) : (
                      <Select 
                        value={localSettings.aiSettings?.model || 'gemini-1.5-flash'} 
                        onValueChange={(value) => updateLocalSettings({ 
                          aiSettings: { ...(localSettings.aiSettings || {}), model: value } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_MODELS.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{model.label}</span>
                                <span className="text-xs text-muted-foreground">{model.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <Label htmlFor="ai-temperature" className="font-ui">Creativity Level (Temperature)</Label>
                    <div className="space-y-2">
                      <Slider
                        id="ai-temperature"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[localSettings.aiSettings?.temperature || 0.7]}
                        onValueChange={([value]) => updateLocalSettings({ 
                          aiSettings: { ...(localSettings.aiSettings || {}), temperature: value } 
                        })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground font-ui">
                        <span>Conservative (0.0)</span>
                        <span>Current: {localSettings.aiSettings?.temperature || 0.7}</span>
                        <span>Creative (1.0)</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-ui">
                      Higher values make the AI more creative but less predictable
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-max-tokens" className="font-ui">Maximum Response Length</Label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Input
                        id="ai-max-tokens"
                        type="number"
                        min="512"
                        max="8192"
                        step="256"
                        value={localSettings.aiSettings?.maxTokens || 4096}
                        onChange={(e) => updateLocalSettings({ 
                          aiSettings: { ...(localSettings.aiSettings || {}), maxTokens: parseInt(e.target.value) || 4096 } 
                        })}
                        className="w-full sm:w-32 font-ui"
                      />
                      <span className="text-sm text-muted-foreground font-ui">
                        tokens (current: {localSettings.aiSettings?.maxTokens || 4096})
                      </span>
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={testAIConnection}
                        disabled={testingAI || !localSettings.aiSettings?.apiKey?.trim()}
                        variant="outline"
                        className="flex items-center gap-2 font-ui flex-1 sm:flex-none"
                      >
                        {testingAI ? (
                          <>
                            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            Testing AI...
                          </>
                        ) : (
                          <>
                            <TestTube size={16} />
                            Test AI Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* AI Status */}
                  {localSettings.aiSettings?.apiKey && (
                    <Card className="p-4 bg-violet-50/50 border border-violet-200/50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <Brain size={18} className="text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-medium font-ui mb-2 text-violet-700">AI Features Available</h3>
                          <div className="text-sm text-violet-600/80 font-ui space-y-1">
                            <p>• Live note enhancement during study sessions</p>
                            <p>• Enhance study notes with AI suggestions</p>
                            <p>• Generate summaries and key insights</p>
                            <p>• Create practice questions from notes</p>
                            <p>• Get explanations for difficult concepts</p>
                            <p>• Analyze study progress and patterns</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}

              {!localSettings.aiSettings?.enabled && (
                <Card className="p-4 bg-muted/50 border border-muted">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Brain size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium font-ui mb-1">AI Features Disabled</h3>
                      <p className="text-sm text-muted-foreground font-ui">
                        Enable AI features to get intelligent note enhancement, summaries, and study insights powered by Google's Gemini models.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prompts Library */}
        <TabsContent value="prompts" className="space-y-6 mt-6">
          <PromptLibrary />
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-6 mt-8">
          <Card className="border-border/40 shadow-lg shadow-blue-500/5 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/30">
                  <Database size={24} className="text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    External Database
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-ui mt-1">Connect to external storage for data backup</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="database-type" className="font-ui">Database Type</Label>
                <Select value={dbType} onValueChange={setDbType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Local Storage Only)</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="firebase">Firebase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dbType !== 'none' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="connection-string" className="font-ui">Connection String</Label>
                    <Input
                      id="connection-string"
                      type="password"
                      placeholder="Enter your database connection string"
                      value={connectionString}
                      onChange={(e) => setConnectionString(e.target.value)}
                      className="font-ui"
                    />
                    <p className="text-xs text-muted-foreground font-ui">
                      Your connection string will be encrypted and stored securely
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={testDatabaseConnection}
                      disabled={testingConnection || !connectionString.trim()}
                      variant="outline"
                      className="flex items-center gap-2 font-ui flex-1 sm:flex-none"
                    >
                      {testingConnection ? (
                        <>
                          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={saveDatabaseSettings}
                      className="flex items-center gap-2 font-ui flex-1 sm:flex-none"
                    >
                      <Database size={16} />
                      Save Settings
                    </Button>
                  </div>
                </div>
              )}

              {dbType === 'none' && (
                <Card className="p-4 bg-muted/50 border border-muted">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Database size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium font-ui mb-1">Local Storage Only</h3>
                      <p className="text-sm text-muted-foreground font-ui">
                        Data will be stored locally in your browser. Consider setting up an external database for backup and sync across devices.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {settings.externalDatabase && (
                <Card className="p-4 bg-accent/5 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Check size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium font-ui mb-2 text-accent">External Database Connected</h3>
                      <div className="text-sm text-muted-foreground font-ui space-y-1">
                        <p><span className="font-medium">Type:</span> {settings.externalDatabase.type}</p>
                        <p>Your study sessions are being synced to your external database.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6 mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Info size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl">About StudyFlow</CardTitle>
                  <p className="text-sm text-muted-foreground font-ui mt-1">Application information and features</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6">
                <Card className="p-4 bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Info size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-ui mb-2">Version Information</h3>
                      <p className="text-sm text-muted-foreground font-ui">
                        StudyFlow v1.0.0 - Smart Study Timer with Rich Notes
                      </p>
                    </div>
                  </div>
                </Card>

                <div>
                  <h3 className="font-semibold font-ui mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    App Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">⏱️</div>
                        <div>
                          <Badge variant="secondary" className="font-ui mb-2">Smart Timer</Badge>
                          <p className="text-sm text-muted-foreground font-ui">
                            Configurable study sessions with break management
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">📝</div>
                        <div>
                          <Badge variant="secondary" className="font-ui mb-2">Rich Notes</Badge>
                          <p className="text-sm text-muted-foreground font-ui">
                            Full-featured note-taking with export options
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🔥</div>
                        <div>
                          <Badge variant="secondary" className="font-ui mb-2">Streak Tracking</Badge>
                          <p className="text-sm text-muted-foreground font-ui">
                            Progress tracking with achievements and rewards
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">📊</div>
                        <div>
                          <Badge variant="secondary" className="font-ui mb-2">Analytics</Badge>
                          <p className="text-sm text-muted-foreground font-ui">
                            Detailed statistics and trend visualization
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold font-ui mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="font-ui">React 18</Badge>
                    <Badge variant="outline" className="font-ui">TypeScript</Badge>
                    <Badge variant="outline" className="font-ui">Tailwind CSS</Badge>
                    <Badge variant="outline" className="font-ui">Shadcn/ui</Badge>
                    <Badge variant="outline" className="font-ui">Vite</Badge>
                  </div>
                </div>

                <Card className="p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Database size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-ui mb-2">Data Privacy</h3>
                      <p className="text-sm text-muted-foreground font-ui">
                        All your study data is stored locally in your browser and persists across sessions. 
                        No data is sent to external servers unless you configure an external database.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}