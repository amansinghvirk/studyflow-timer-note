import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Flame, Trophy, Target, Star, Gift, Calendar } from '@phosphor-icons/react'
import { StreakData, Achievement, StudySession } from '@/App'

interface StreakTrackerProps {
  streakData: StreakData
  achievements: Achievement[]
  sessions: StudySession[]
  onUpdateWeeklyGoal: (goal: number) => void
}

export function StreakTracker({ streakData, achievements, sessions, onUpdateWeeklyGoal }: StreakTrackerProps) {
  const [showAchievements, setShowAchievements] = useState(false)
  
  const weeklyProgress = (streakData.weeklyProgress / streakData.weeklyGoal) * 100
  
  const getStreakMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your study streak today!"
    } else if (streakData.currentStreak === 1) {
      return "Great start! Keep it going tomorrow."
    } else if (streakData.currentStreak < 7) {
      return `${streakData.currentStreak} days strong! You're building momentum.`
    } else if (streakData.currentStreak < 30) {
      return `Amazing ${streakData.currentStreak}-day streak! You're on fire! 🔥`
    } else {
      return `Incredible ${streakData.currentStreak}-day streak! You're unstoppable! 💎`
    }
  }

  const getRecentAchievements = () => {
    return achievements
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 3)
  }

  const getCalendarView = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    
    const studyDates = new Set(
      sessions
        .filter(s => new Date(s.completedAt) >= thirtyDaysAgo)
        .map(s => new Date(s.completedAt).toDateString())
    )
    
    const days = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)
      days.push({
        date: date.toDateString(),
        hasStudy: studyDates.has(date.toDateString()),
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }

  return (
    <div className="space-y-6">
      {/* Main Streak Display */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 font-display">
            <Flame className="text-primary" size={24} />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {streakData.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {streakData.longestStreak}
                </div>
                <div className="text-sm text-muted-foreground">Best</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-ui">
              {getStreakMessage()}
            </p>
          </div>
          
          {/* Calendar View */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              Last 30 days
            </div>
            <div className="grid grid-cols-10 gap-1">
              {getCalendarView().map((day, index) => (
                <div
                  key={index}
                  className={`
                    w-6 h-6 rounded-sm text-xs flex items-center justify-center
                    ${day.hasStudy 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                    ${day.isToday ? 'ring-2 ring-accent' : ''}
                  `}
                  title={day.date}
                >
                  {day.hasStudy ? '✓' : ''}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Target className="text-accent" size={20} />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress this week</span>
              <span>{streakData.weeklyProgress}/{streakData.weeklyGoal} sessions</span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </div>
          <div className="flex gap-2">
            {[3, 5, 7, 10].map(goal => (
              <Button
                key={goal}
                variant={streakData.weeklyGoal === goal ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateWeeklyGoal(goal)}
                className="font-ui"
              >
                {goal}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-display">
            <div className="flex items-center gap-2">
              <Trophy className="text-accent" size={20} />
              Achievements
            </div>
            <Badge variant="secondary" className="font-ui">
              {achievements.length} unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getRecentAchievements().length > 0 ? (
            <div className="space-y-3">
              {getRecentAchievements().map(achievement => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold font-ui">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-ui">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift size={48} className="mx-auto mb-2 opacity-50" />
              <p className="font-ui">Complete study sessions to unlock achievements!</p>
            </div>
          )}
          
          <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full font-ui">
                View All Achievements
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-display">
                  <Trophy className="text-accent" size={24} />
                  All Achievements
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold font-ui">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {achievement.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Star className="text-accent" size={20} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-ui">No achievements unlocked yet. Start studying to earn rewards!</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}