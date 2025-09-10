-- Create notifications table to track sent notifications and prevent duplicates
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('overdue_task', 'streak_achievement')),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  streak_count INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at);

-- Create function to check for overdue tasks
CREATE OR REPLACE FUNCTION public.get_overdue_tasks()
RETURNS TABLE(
  task_id UUID,
  user_id UUID,
  user_email TEXT,
  task_title TEXT,
  deadline DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.user_id,
    au.email as user_email,
    t.title as task_title,
    t.deadline,
    (CURRENT_DATE - t.deadline)::INTEGER as days_overdue
  FROM public.tasks t
  JOIN auth.users au ON t.user_id = au.id
  WHERE t.status = 'pending' 
    AND t.deadline < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.task_id = t.id 
        AND n.type = 'overdue_task'
        AND n.sent_at::DATE = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate user streaks
CREATE OR REPLACE FUNCTION public.get_user_streaks()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  current_streak INTEGER,
  is_milestone BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_completion AS (
    SELECT 
      t.user_id,
      t.date,
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE t.status = 'completed') as completed_tasks,
      CASE 
        WHEN COUNT(*) FILTER (WHERE t.status = 'completed') * 100.0 / COUNT(*) >= 80 
        THEN 1 
        ELSE 0 
      END as day_completed
    FROM public.tasks t
    WHERE t.date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY t.user_id, t.date
  ),
  streak_calc AS (
    SELECT 
      dc.user_id,
      SUM(dc.day_completed) OVER (
        PARTITION BY dc.user_id 
        ORDER BY dc.date DESC 
        ROWS UNBOUNDED PRECEDING
      ) as current_streak
    FROM daily_completion dc
    WHERE dc.date <= CURRENT_DATE
    ORDER BY dc.user_id, dc.date DESC
  ),
  user_streaks AS (
    SELECT DISTINCT ON (sc.user_id)
      sc.user_id,
      sc.current_streak
    FROM streak_calc sc
    ORDER BY sc.user_id, current_streak DESC
  )
  SELECT 
    us.user_id,
    au.email as user_email,
    us.current_streak::INTEGER,
    (us.current_streak IN (7, 14, 30, 60, 90, 180, 365))::BOOLEAN as is_milestone
  FROM user_streaks us
  JOIN auth.users au ON us.user_id = au.id
  WHERE us.current_streak >= 7
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = us.user_id 
        AND n.type = 'streak_achievement'
        AND n.streak_count = us.current_streak
        AND n.sent_at::DATE = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;