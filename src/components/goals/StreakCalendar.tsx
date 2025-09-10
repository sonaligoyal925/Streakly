import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Flame, Trophy, TrendingUp, RefreshCw } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";

interface DayData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

const StreakCalendar = () => {
  const { tasks, loading, fetchTasks } = useSupabaseTasks();

  const calendarData = useMemo(() => {
    const data: DayData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Get tasks for this specific date
      const dayTasks = tasks.filter(task => task.date === dateString);
      const total = dayTasks.length;
      const completed = dayTasks.filter(task => task.status === 'completed').length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      
      data.push({
        date: dateString,
        completed,
        total,
        percentage
      });
    }
    
    return data;
  }, [tasks]);

  const getIntensityClass = (percentage: number) => {
    if (percentage === 0) return "bg-muted";
    if (percentage <= 25) return "bg-green-200 dark:bg-green-900";
    if (percentage <= 50) return "bg-green-300 dark:bg-green-700";
    if (percentage <= 75) return "bg-green-400 dark:bg-green-600";
    return "bg-green-500 dark:bg-green-500";
  };

  const currentStreak = () => {
    let streak = 0;
    for (let i = calendarData.length - 1; i >= 0; i--) {
      if (calendarData[i].percentage >= 80) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const bestStreak = () => {
    let maxStreak = 0;
    let currentStreakCount = 0;
    
    calendarData.forEach(day => {
      if (day.percentage >= 80) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else {
        currentStreakCount = 0;
      }
    });
    
    return maxStreak;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-primary" size={24} />
              30-Day Streak Calendar
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTasks}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar data...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <Flame className="text-orange-500" size={24} />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-xl font-bold">{currentStreak()} days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <Trophy className="text-yellow-500" size={24} />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                    <p className="text-xl font-bold">{bestStreak()} days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <TrendingUp className="text-green-500" size={24} />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Completion</p>
                    <p className="text-xl font-bold">
                      {calendarData.length > 0 ? Math.round(calendarData.reduce((acc, day) => acc + day.percentage, 0) / calendarData.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-10 gap-1 mb-4">
                  {calendarData.map((day, index) => (
                    <div
                      key={day.date}
                      className={`w-6 h-6 rounded-sm ${getIntensityClass(day.percentage)} cursor-pointer hover:scale-110 transition-transform`}
                      title={`${day.date}: ${day.completed}/${day.total} goals (${day.percentage.toFixed(0)}%)`}
                    />
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-muted rounded-sm" />
                    <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm" />
                    <div className="w-3 h-3 bg-green-300 dark:bg-green-700 rounded-sm" />
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm" />
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-500 rounded-sm" />
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {calendarData.reduce((acc, day) => acc + day.completed, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Goals Completed</p>
                </div>
                
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {calendarData.filter(day => day.percentage === 100).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Perfect Days</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCalendar;