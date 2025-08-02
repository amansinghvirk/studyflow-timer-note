import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  BookOpen, 
  History, 
  ChartBar, 
  Flame, 
  List,
  X
} from '@phosphor-icons/react'

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: 'timer', label: 'Timer', icon: Clock },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'streaks', label: 'Streaks', icon: Flame },
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
  { id: 'history', label: 'History', icon: History }
]

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  const currentItem = navigationItems.find(item => item.id === activeTab)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="md:hidden mobile-nav-trigger flex items-center gap-2 px-3"
        >
          {currentItem ? (
            <>
              <currentItem.icon size={16} />
              <span className="text-sm font-medium truncate max-w-[80px]">
                {currentItem.label}
              </span>
            </>
          ) : (
            <>
              <List size={16} />
              <span className="text-sm font-medium">Menu</span>
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="mobile-sheet-content">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center justify-between text-lg font-semibold">
            Navigation
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 text-left transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                    : 'hover:bg-white/50'
                }`}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon size={18} className="mr-3 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
        
        {/* Add quick stats or info at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
            <p className="text-xs text-muted-foreground text-center">
              StudyFlow - Smart Study Sessions
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}