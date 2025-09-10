import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Plus, AlertTriangle, RefreshCw } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";

const TodaysGoals = ({ onAddNewGoal }: { onAddNewGoal?: () => void }) => {
  const { tasks, loading, toggleTaskStatus, fetchTasks } = useSupabaseTasks();

  // Filter tasks for today
  const todaysGoals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.date === today);
  }, [tasks]);

  const toggleGoal = (id: string, currentStatus: string) => {
    toggleTaskStatus(id, currentStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-orange-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="text-green-500" size={20} />;
      case "overdue": return <AlertTriangle className="text-destructive" size={20} />;
      default: return <Circle className="text-muted-foreground" size={20} />;
    }
  };

  const completedGoals = todaysGoals.filter(goal => goal.status === "completed").length;
  const totalGoals = todaysGoals.length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary" size={24} />
              Today's Progress
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
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading today's goals...</p>
            </div>
          ) : totalGoals === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No goals for today</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">{completedGoals}/{totalGoals}</span>
                <Badge variant="outline" className="text-sm">
                  {Math.round((completedGoals / totalGoals) * 100)}% Complete
                </Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {todaysGoals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleGoal(goal.id, goal.status)}
                  className="mt-1 hover:scale-110 transition-transform"
                  disabled={loading}
                >
                  {getStatusIcon(goal.status)}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${goal.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {goal.title}
                    </h3>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {goal.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={14} />
                      Due: {goal.deadline}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Goal Button */}
      <Button 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
        onClick={onAddNewGoal}
      >
        <Plus size={16} className="mr-2" />
        Add New Goal
      </Button>
    </div>
  );
};

export default TodaysGoals;