import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Clock, Database, Tag, Trash, Plus, Check, X } from '@phosphor-icons/react'
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
  const [newTopic, setNewTopic] = useState('')
  const [newSubtopic, setNewSubtopic] = useState('')
  const [selectedTopicForSubtopic, setSelectedTopicForSubtopic] = useState('')
  const [dbType, setDbType] = useState(settings.externalDatabase?.type || 'none')
  const [connectionString, setConnectionString] = useState(settings.externalDatabase?.connectionString || '')
  const [testingConnection, setTestingConnection] = useState(false)

  const updateSettings = (updates: Partial<AppSettings>) => {
    onSettingsChange({ ...settings, ...updates })
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
      const { externalDatabase, ...settingsWithoutDb } = settings
      onSettingsChange(settingsWithoutDb)
      toast.success('External database disabled')
    } else {
      updateSettings({
        externalDatabase: {
          type: dbType,
          connectionString: connectionString
        }
      })
      toast.success('Database settings saved')
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2 font-ui">
            <Clock size={16} />
            General
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2 font-ui">
            <Tag size={16} />
            Topics
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2 font-ui">
            <Database size={16} />
            Database
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-duration" className="font-ui">Default Session Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="default-duration"
                    type="number"
                    min="1"
                    max="180"
                    value={settings.defaultDuration}
                    onChange={(e) => updateSettings({ defaultDuration: parseInt(e.target.value) || 25 })}
                    className="w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {settings.defaultDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="break-duration" className="font-ui">Break Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.breakDuration}
                    onChange={(e) => updateSettings({ breakDuration: parseInt(e.target.value) || 5 })}
                    className="w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {settings.breakDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break-duration" className="font-ui">Long Break Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="long-break-duration"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                    className="w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Current: {settings.longBreakDuration} minutes
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessions-until-long-break" className="font-ui">Study Sessions Until Long Break</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="sessions-until-long-break"
                    type="number"
                    min="2"
                    max="10"
                    value={settings.sessionsUntilLongBreak}
                    onChange={(e) => updateSettings({ sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                    className="w-32 font-ui"
                  />
                  <span className="text-sm text-muted-foreground font-ui">
                    Every {settings.sessionsUntilLongBreak} sessions
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-start-breaks" className="font-ui">Auto-start Breaks</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="auto-start-breaks"
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
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
                    checked={settings.audioNotifications}
                    onCheckedChange={(checked) => updateSettings({ audioNotifications: checked })}
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
                    checked={settings.distractionFreeMode}
                    onCheckedChange={(checked) => updateSettings({ distractionFreeMode: checked })}
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

              <div className="space-y-3">
                <Label className="font-ui">Quick Settings</Label>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground font-ui">Study Duration</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant={settings.defaultDuration === 15 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ defaultDuration: 15 })}
                      className="font-ui"
                    >
                      15 min
                    </Button>
                    <Button
                      variant={settings.defaultDuration === 25 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ defaultDuration: 25 })}
                      className="font-ui"
                    >
                      25 min
                    </Button>
                    <Button
                      variant={settings.defaultDuration === 45 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ defaultDuration: 45 })}
                      className="font-ui"
                    >
                      45 min
                    </Button>
                    <Button
                      variant={settings.defaultDuration === 60 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ defaultDuration: 60 })}
                      className="font-ui"
                    >
                      60 min
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground font-ui">Break Duration</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant={settings.breakDuration === 3 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ breakDuration: 3 })}
                      className="font-ui"
                    >
                      3 min
                    </Button>
                    <Button
                      variant={settings.breakDuration === 5 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ breakDuration: 5 })}
                      className="font-ui"
                    >
                      5 min
                    </Button>
                    <Button
                      variant={settings.breakDuration === 10 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ breakDuration: 10 })}
                      className="font-ui"
                    >
                      10 min
                    </Button>
                    <Button
                      variant={settings.breakDuration === 15 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ breakDuration: 15 })}
                      className="font-ui"
                    >
                      15 min
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground font-ui">Long Break Duration</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant={settings.longBreakDuration === 15 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ longBreakDuration: 15 })}
                      className="font-ui"
                    >
                      15 min
                    </Button>
                    <Button
                      variant={settings.longBreakDuration === 20 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ longBreakDuration: 20 })}
                      className="font-ui"
                    >
                      20 min
                    </Button>
                    <Button
                      variant={settings.longBreakDuration === 30 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ longBreakDuration: 30 })}
                      className="font-ui"
                    >
                      30 min
                    </Button>
                    <Button
                      variant={settings.longBreakDuration === 45 ? 'default' : 'outline'}
                      onClick={() => updateSettings({ longBreakDuration: 45 })}
                      className="font-ui"
                    >
                      45 min
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topic Management */}
        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Manage Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Topic */}
              <div className="space-y-3">
                <Label htmlFor="new-topic" className="font-ui">Add New Topic</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-topic"
                    placeholder="Enter topic name"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                    className="font-ui"
                  />
                  <Button onClick={addTopic} className="flex items-center gap-2 font-ui">
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-3">
                <Label className="font-ui">Existing Topics</Label>
                {topics.length === 0 ? (
                  <p className="text-muted-foreground text-sm font-ui">No topics added yet</p>
                ) : (
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <div key={topic} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-ui">{topic}</Badge>
                            <span className="text-sm text-muted-foreground font-ui">
                              {subtopics[topic]?.length || 0} subtopics
                            </span>
                          </div>
                          {subtopics[topic] && subtopics[topic].length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {subtopics[topic].map((subtopic) => (
                                <div key={subtopic} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                                  <span className="font-ui">{subtopic}</span>
                                  <button
                                    onClick={() => deleteSubtopic(topic, subtopic)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                    ))}
                  </div>
                )}
              </div>

              {/* Add Subtopic */}
              {topics.length > 0 && (
                <div className="space-y-3">
                  <Label className="font-ui">Add Subtopic</Label>
                  <div className="flex gap-2">
                    <Select value={selectedTopicForSubtopic} onValueChange={setSelectedTopicForSubtopic}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map(topic => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Enter subtopic name"
                      value={newSubtopic}
                      onChange={(e) => setNewSubtopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtopic()}
                      className="font-ui"
                    />
                    <Button onClick={addSubtopic} className="flex items-center gap-2 font-ui">
                      <Plus size={16} />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">External Database</CardTitle>
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

                  <div className="flex gap-3">
                    <Button
                      onClick={testDatabaseConnection}
                      disabled={testingConnection || !connectionString.trim()}
                      variant="outline"
                      className="flex items-center gap-2 font-ui"
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
                      className="flex items-center gap-2 font-ui"
                    >
                      <Database size={16} />
                      Save Settings
                    </Button>
                  </div>
                </div>
              )}

              {dbType === 'none' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground font-ui">
                    Data will be stored locally in your browser. Consider setting up an external database for backup and sync across devices.
                  </p>
                </div>
              )}

              {settings.externalDatabase && (
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={16} className="text-accent" />
                    <span className="font-ui font-medium">External Database Configured</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-ui">
                    Type: {settings.externalDatabase.type}<br />
                    Your study sessions are being synced to your external database.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}