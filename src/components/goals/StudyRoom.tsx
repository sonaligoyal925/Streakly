import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Clock, Target, Calendar, BookOpen, Trophy, RotateCcw } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useToast } from "@/hooks/use-toast";

interface StudySession {
  id: string;
  taskId: string;
  taskTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isActive: boolean;
}

const StudyRoom = () => {
  const { tasks, loading } = useSupabaseTasks();
  const { toast } = useToast();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && currentSession) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, currentSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startStudySession = () => {
    if (!selectedTaskId) {
      toast({
        title: "No task selected",
        description: "Please select a task to start studying",
        variant: "destructive",
      });
      return;
    }

    const selectedTask = tasks.find(task => task.id === selectedTaskId);
    if (!selectedTask) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      taskId: selectedTaskId,
      taskTitle: selectedTask.title,
      startTime: new Date(),
      duration: 0,
      isActive: true,
    };

    setCurrentSession(newSession);
    setElapsedTime(0);
    setIsTimerRunning(true);
    
    toast({
      title: "Study session started",
      description: `Started studying: ${selectedTask.title}`,
    });
  };

  const pauseStudySession = () => {
    setIsTimerRunning(false);
    toast({
      title: "Study session paused",
      description: "Timer paused. Click resume to continue.",
    });
  };

  const resumeStudySession = () => {
    setIsTimerRunning(true);
    toast({
      title: "Study session resumed",
      description: "Timer resumed.",
    });
  };

  const stopStudySession = () => {
    if (!currentSession) return;

    const endedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      duration: elapsedTime,
      isActive: false,
    };

    setStudySessions(prev => [endedSession, ...prev]);
    setCurrentSession(null);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setSelectedTaskId("");

    toast({
      title: "Study session completed",
      description: `Studied for ${formatTime(elapsedTime)}. Great work!`,
    });
  };

  const resetTimer = () => {
    setElapsedTime(0);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        startTime: new Date(),
      });
    }
  };

  const getTotalStudyTime = () => {
    return studySessions.reduce((total, session) => total + session.duration, 0);
  };

  const getStudyTimeForTask = (taskId: string) => {
    return studySessions
      .filter(session => session.taskId === taskId)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getPendingTasks = () => {
    return tasks.filter(task => task.status === 'pending');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          Study Room
        </h2>
        <p className="text-muted-foreground">Focus on your tasks with time tracking</p>
      </div>

      {/* Main Timer Card */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Selection */}
          {!currentSession && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a task to study</label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pending task..." />
                </SelectTrigger>
                <SelectContent>
                  {getPendingTasks().map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Current Session Info */}
          {currentSession && (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">Studying:</span>
                <span className="text-primary">{currentSession.taskTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Started at {currentSession.startTime.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4 font-mono">
              {formatTime(elapsedTime)}
            </div>
            
            {/* Timer Controls */}
            <div className="flex justify-center gap-3">
              {!currentSession ? (
                <Button 
                  onClick={startStudySession} 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!selectedTaskId}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              ) : (
                <>
                  {isTimerRunning ? (
                    <Button 
                      onClick={pauseStudySession} 
                      size="lg"
                      variant="outline"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button 
                      onClick={resumeStudySession} 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  
                  <Button 
                    onClick={resetTimer} 
                    size="lg"
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  
                  <Button 
                    onClick={stopStudySession} 
                    size="lg"
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatTime(getTotalStudyTime())}
            </div>
            <p className="text-sm text-muted-foreground">across all sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sessions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {studySessions.filter(session => {
                const today = new Date().toDateString();
                return session.startTime.toDateString() === today;
              }).length}
            </div>
            <p className="text-sm text-muted-foreground">completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Average Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {studySessions.length > 0 
                ? formatTime(Math.round(getTotalStudyTime() / studySessions.length))
                : "0:00"
              }
            </div>
            <p className="text-sm text-muted-foreground">session duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {studySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studySessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">{session.taskTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatTime(session.duration)}</div>
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyRoom;