import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Target, Flame, LogOut, User, Clock, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/components/auth/Auth";
import TodaysGoals from "@/components/goals/TodaysGoals";
import StreakCalendar from "@/components/goals/StreakCalendar";
import TaskManager from "@/components/goals/TaskManager";
import HabitStreak from "@/components/goals/HabitStreak";
import StudyRoom from "@/components/goals/StudyRoom";
import { NotificationManager } from "@/components/notifications/NotificationManager";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("today");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-dark via-primary to-primary-deep bg-clip-text text-transparent mb-3 animate-fade-in">
                Streakly
              </h1>
              <p className="text-lg text-foreground/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Transform your goals into lasting habits ✨
              </p>
            </div>
            
            <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                <User size={16} className="text-primary-deep" />
                <span className="text-sm font-medium text-foreground/90">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="bg-white/20 backdrop-blur-lg border-white/30 text-foreground/90 hover:bg-white/30 hover:text-foreground transition-all duration-300"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[
            { id: "today", label: "Today's Goals", icon: CheckCircle },
            { id: "calendar", label: "Streak Calendar", icon: Calendar },
            { id: "tasks", label: "Task Manager", icon: Target },
            { id: "habits", label: "Habit Streak", icon: Flame },
            { id: "study", label: "Study Room", icon: Clock },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105
                ${activeTab === id 
                  ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl' 
                  : 'bg-white/20 backdrop-blur-lg border-white/30 text-foreground/90 hover:bg-white/30 hover:text-foreground'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div 
            className="backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 transition-all duration-300"
            style={{ background: 'var(--gradient-card)' }}
          >
            {activeTab === "today" && <TodaysGoals onAddNewGoal={() => setActiveTab("tasks")} />}
            {activeTab === "calendar" && <StreakCalendar />}
            {activeTab === "tasks" && <TaskManager />}
            {activeTab === "habits" && <HabitStreak />}
            {activeTab === "study" && <StudyRoom />}
            {activeTab === "notifications" && <NotificationManager />}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
