import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from '@phosphor-icons/react'

import timerScreenshotSvg from '@/assets/images/timer-screenshot.svg'
import dashboardScreenshotSvg from '@/assets/images/dashboard-screenshot.svg'
import notesScreenshotSvg from '@/assets/images/notes-screenshot.svg'
import distractionFreeScreenshotSvg from '@/assets/images/distraction-free-screenshot.svg'
import streaksScreenshotSvg from '@/assets/images/streaks-screenshot.svg'
import mobileViewSvg from '@/assets/images/mobile-view.svg'

interface Screenshot {
  id: string
  title: string
  description: string
  image: string
  category: 'Desktop' | 'Mobile' | 'Feature'
  features: string[]
}

const screenshots: Screenshot[] = [
  {
    id: 'timer',
    title: 'Study Timer with Rich Notes',
    description: 'Main timer interface with integrated note-taking editor for focused study sessions',
    image: timerScreenshotSvg,
    category: 'Desktop',
    features: ['Pomodoro Timer', 'Rich Text Editor', 'Topic Tracking', 'Session Management']
  },
  {
    id: 'distraction-free',
    title: 'Distraction-Free Mode',
    description: 'Focused study mode with minimal distractions and full-screen note editor',
    image: distractionFreeScreenshotSvg,
    category: 'Feature',
    features: ['Distraction Free', 'Full Screen', 'Minimal UI', 'Focus Mode']
  },
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics with charts showing study patterns and progress',
    image: dashboardScreenshotSvg,
    category: 'Desktop',
    features: ['Charts & Graphs', 'Study Analytics', 'Progress Tracking', 'Time Insights']
  },
  {
    id: 'streaks',
    title: 'Study Streaks & Achievements',
    description: 'Gamified study tracking with streaks, achievements, and rewards system',
    image: streaksScreenshotSvg,
    category: 'Feature',
    features: ['Streak Tracking', 'Achievements', 'Rewards System', 'Goal Setting']
  },
  {
    id: 'notes',
    title: 'Notes Management',
    description: 'Complete notes management with editing, export, and organization features',
    image: notesScreenshotSvg,
    category: 'Desktop',
    features: ['Note Organization', 'Export Options', 'Rich Text Editing', 'File Management']
  },
  {
    id: 'mobile',
    title: 'Mobile-Optimized Interface',
    description: 'Responsive design optimized for mobile devices with touch-friendly controls',
    image: mobileViewSvg,
    category: 'Mobile',
    features: ['Responsive Design', 'Touch Controls', 'Mobile Navigation', 'Optimized Layout']
  }
]

export function ScreenshotGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null)

  const categories = ['All', 'Desktop', 'Mobile', 'Feature']
  
  const filteredScreenshots = selectedCategory === 'All' 
    ? screenshots 
    : screenshots.filter(screenshot => screenshot.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="font-ui"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScreenshots.map((screenshot) => (
          <Dialog key={screenshot.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={screenshot.image} 
                      alt={screenshot.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg mb-1">
                        {screenshot.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-ui">
                        {screenshot.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs font-ui">
                        {screenshot.category}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {screenshot.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs font-ui">
                            {feature}
                          </Badge>
                        ))}
                        {screenshot.features.length > 3 && (
                          <Badge variant="outline" className="text-xs font-ui">
                            +{screenshot.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">
                  {screenshot.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={screenshot.image} 
                    alt={screenshot.title}
                    className="w-full rounded-lg border"
                  />
                </div>
                
                <div className="space-y-3">
                  <p className="text-muted-foreground font-ui">
                    {screenshot.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold">Features Showcased:</h4>
                    <div className="flex flex-wrap gap-2">
                      {screenshot.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="font-ui">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}