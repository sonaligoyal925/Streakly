-- Fix the data type mismatch in get_overdue_tasks function
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
    au.email::TEXT as user_email,  -- Cast to TEXT to match return type
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';