import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, TrendingUp, CheckCircle, Circle, RefreshCw, Plus } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";

interface Habit {
  id: string;
  name: string;
  target: number;
  completed: number;
  streak: number;
  bestStreak: number;
  category: string;
}

const HabitStreak = () => {
  const { tasks, loading, fetchTasks } = useSupabaseTasks();

  const calculateStreak = (tasks: any[]) => {
    // Calculate current streak based on recent completions
    const sortedTasks = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (const task of sortedTasks) {
      const taskDate = new Date(task.date);
      const diffDays = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateBestStreak = (tasks: any[]) => {
    // Calculate best streak from historical data
    const completedTasks = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let bestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    
    for (const task of completedTasks) {
      const taskDate = new Date(task.date);
      
      if (prevDate) {
        const diffDays = Math.floor((taskDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      prevDate = taskDate;
    }
    
    return Math.max(bestStreak, currentStreak);
  };

  // Generate habit data based on tasks
  const habits = useMemo(() => {
    const habitMap = new Map<string, any>();
    
    // Group tasks by title to create habits
    tasks.forEach(task => {
      if (!habitMap.has(task.title)) {
        habitMap.set(task.title, {
          id: task.title,
          name: task.title,
          tasks: [],
          category: task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        });
      }
      habitMap.get(task.title).tasks.push(task);
    });

    // Convert to habit format
    return Array.from(habitMap.values()).map(habit => {
      const completedTasks = habit.tasks.filter((t: any) => t.status === 'completed').length;
      const totalTasks = habit.tasks.length;
      
      return {
        id: habit.id,
        name: habit.name,
        target: totalTasks,
        completed: completedTasks,
        streak: calculateStreak(habit.tasks),
        bestStreak: calculateBestStreak(habit.tasks),
        category: habit.category
      };
    });
  }, [tasks]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-orange-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-primary" size={24} />
              Habit Streaks
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
              <p className="text-muted-foreground">Loading habit data...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8">
              <Flame className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No habits tracked yet</h3>
              <p className="text-muted-foreground">Complete some tasks to start tracking your habits</p>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <Flame className="mx-auto text-orange-500 mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Active Streaks</p>
                  <p className="text-xl font-bold">
                    {habits.filter(h => h.streak > 0).length}
                  </p>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <Target className="mx-auto text-blue-500 mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-xl font-bold">
                    {habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + (h.completed / h.target * 100), 0) / habits.length) : 0}%
                  </p>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                  <p className="text-xl font-bold">
                    {habits.length > 0 ? Math.max(...habits.map(h => h.bestStreak)) : 0} days
                  </p>
                </div>
              </div>

              {/* Habit List */}
              <div className="space-y-4">
                {habits.map((habit) => (
                  <Card key={habit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{habit.name}</h3>
                            <Badge className={getCategoryColor(habit.category)}>
                              {habit.category}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-500">{habit.streak}</p>
                              <p className="text-xs text-muted-foreground">Current Streak</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{habit.bestStreak}</p>
                              <p className="text-xs text-muted-foreground">Best Streak</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-500">{habit.completed}</p>
                              <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-500">{habit.target}</p>
                              <p className="text-xs text-muted-foreground">Total Tasks</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Completion Rate</span>
                              <span>{Math.round((habit.completed / habit.target) * 100)}%</span>
                            </div>
                            <Progress 
                              value={(habit.completed / habit.target) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitStreak;