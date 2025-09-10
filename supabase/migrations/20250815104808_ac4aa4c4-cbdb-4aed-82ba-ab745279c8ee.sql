-- Update the 'overdue' task to 'pending' so it can be detected by notifications
UPDATE public.tasks 
SET status = 'pending' 
WHERE status = 'overdue' AND deadline < CURRENT_DATE;

-- Also create a test overdue task for demonstration
INSERT INTO public.tasks (title, description, date, deadline, priority, status, user_id, time)
SELECT 
  'Test Overdue Task',
  'This is a test task that should trigger a notification',
  '2025-08-13'::date,
  '2025-08-13'::date,  -- Yesterday's deadline
  'high',
  'pending',
  user_id,
  '09:00'
FROM public.tasks 
LIMIT 1;