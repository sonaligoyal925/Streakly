import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Clock, TrendingUp, Send, Loader2, RefreshCw } from 'lucide-react';

export const NotificationManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading, fetchNotifications } = useNotifications();

  const triggerNotifications = async (type: 'check_overdue' | 'check_streaks' | 'manual') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage notifications",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: { type }
      });

      if (error) throw error;

      const message = `${data.notifications_sent} notifications sent successfully`;
      setLastResult(message);
      toast({
        title: "Notifications Sent",
        description: message,
      });
    } catch (error) {
      console.error('Error triggering notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access notification settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System
          </CardTitle>
          <CardDescription>
            Manage your email notifications for overdue tasks and streak achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastResult && (
            <Alert>
              <Send className="h-4 w-4" />
              <AlertDescription>{lastResult}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-destructive" />
                  Overdue Tasks
                </CardTitle>
                <CardDescription>
                  Get notified about tasks that have passed their deadline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Daily Check</Badge>
                  <Badge variant="outline">Email Alert</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically checks daily for overdue tasks and sends email reminders.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => triggerNotifications('check_overdue')}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Check Overdue Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  Streak Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your consistency milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Milestone Based</Badge>
                  <Badge variant="outline">Celebration</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get congratulated when you reach 7, 14, 30, 60, 90, 180, or 365-day streaks.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => triggerNotifications('check_streaks')}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Check Streaks Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={() => triggerNotifications('manual')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send All Notifications Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>
                History of sent notifications
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNotifications}
              disabled={notificationsLoading}
            >
              {notificationsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications sent yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.slice(0, 10).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant={notification.type === 'overdue_task' ? 'destructive' : 'default'}>
                          {notification.type === 'overdue_task' ? 'Overdue Task' : 'Streak Achievement'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.email_subject}
                      </TableCell>
                      <TableCell>
                        {new Date(notification.sent_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Conditions</CardTitle>
          <CardDescription>
            When and how notifications are triggered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-destructive pl-4">
              <h4 className="font-semibold text-destructive">Overdue Task Alerts</h4>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Triggered daily for tasks past their deadline</li>
                <li>• Only sent once per day per overdue task</li>
                <li>• Includes task details and days overdue</li>
                <li>• Provides actionable suggestions</li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h4 className="font-semibold text-amber-600">Streak Achievement Celebrations</h4>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Sent at milestone streaks: 7, 14, 30, 60, 90, 180, 365 days</li>
                <li>• Based on 80%+ daily goal completion rate</li>
                <li>• Only sent once per milestone achieved</li>
                <li>• Includes motivational content and next goal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};