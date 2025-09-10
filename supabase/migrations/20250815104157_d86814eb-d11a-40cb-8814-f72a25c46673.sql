-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a daily cron job to check for overdue tasks and streak achievements at 9 AM every day
SELECT cron.schedule(
  'daily-notification-check',
  '0 9 * * *', -- At 9:00 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://vkugrwvdbqenfsssycfs.supabase.co/functions/v1/send-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWdyd3ZkYnFlbmZzc3N5Y2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDM2NjcsImV4cCI6MjA2OTYxOTY2N30.1bc0slTt4hbGZ3BwWzRAVD_whEwE14bVN758O8hmwLo"}'::jsonb,
        body:='{"type": "manual"}'::jsonb
    ) as request_id;
  $$
);