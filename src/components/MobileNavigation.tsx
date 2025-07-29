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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <List size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Navigation
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X size={16} />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start h-12 text-left"
                onClick={() => handleTabChange(item.id)}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}