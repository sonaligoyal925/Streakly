import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'check_overdue' | 'check_streaks' | 'manual';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type }: NotificationRequest = await req.json();

    let sentNotifications = 0;

    if (type === 'check_overdue' || type === 'manual') {
      // Check for overdue tasks
      console.log('Checking for overdue tasks...');
      const { data: overdueTasks, error: overdueError } = await supabase
        .rpc('get_overdue_tasks');

      console.log('Overdue tasks query result:', { overdueTasks, overdueError });

      if (overdueError) {
        console.error('Error fetching overdue tasks:', overdueError);
      } else if (overdueTasks && overdueTasks.length > 0) {
        for (const task of overdueTasks) {
          const subject = `⏰ Task Overdue: ${task.task_title}`;
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">📋 Task Overdue Reminder</h2>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #991b1b; margin: 0 0 8px 0;">${task.task_title}</h3>
                <p style="margin: 0; color: #7f1d1d;">
                  This task was due on <strong>${new Date(task.deadline).toLocaleDateString()}</strong> 
                  and is now <strong>${task.days_overdue} day${task.days_overdue > 1 ? 's' : ''} overdue</strong>.
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #374151;">What you can do:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                  <li>Mark the task as completed if you've finished it</li>
                  <li>Update the deadline if you need more time</li>
                  <li>Break down the task into smaller, manageable steps</li>
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Stay on track with your goals! 🎯<br>
                The Goal Tracker Team
              </p>
            </div>
          `;

          const emailResponse = await resend.emails.send({
            from: "Goal Tracker <onboarding@resend.dev>",
            to: [task.user_email],
            subject: subject,
            html: htmlContent,
          });

          if (emailResponse.error) {
            console.error('Error sending overdue email:', emailResponse.error);
          } else {
            // Record the notification
            await supabase.from('notifications').insert({
              user_id: task.user_id,
              type: 'overdue_task',
              task_id: task.task_id,
              email_subject: subject,
              email_body: htmlContent
            });
            sentNotifications++;
            console.log(`Sent overdue notification for task: ${task.task_title}`);
          }
        }
      } else {
        console.log('No overdue tasks found or overdue tasks array is empty');
      }
    }

    if (type === 'check_streaks' || type === 'manual') {
      // Check for streak achievements
      console.log('Checking for streak achievements...');
      const { data: streakData, error: streakError } = await supabase
        .rpc('get_user_streaks');

      console.log('Streak data query result:', { streakData, streakError });

      if (streakError) {
        console.error('Error fetching streak data:', streakError);
      } else if (streakData && streakData.length > 0) {
        for (const streak of streakData) {
          if (streak.is_milestone) {
            const subject = `🔥 Congratulations! ${streak.current_streak}-Day Streak Achieved!`;
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #f59e0b; margin: 0; font-size: 32px;">🔥</h1>
                  <h2 style="color: #d97706; margin: 8px 0;">Streak Achievement Unlocked!</h2>
                </div>
                
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 24px;">${streak.current_streak} Days Strong!</h3>
                  <p style="margin: 0; opacity: 0.9;">You've maintained your goal completion streak for ${streak.current_streak} consecutive days!</p>
                </div>

                <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="margin: 0 0 8px 0; color: #92400e;">🎯 Your Achievement</h4>
                  <p style="margin: 0; color: #a16207;">
                    Consistency is the key to success! You've completed at least 80% of your daily goals for 
                    <strong>${streak.current_streak} consecutive days</strong>. This level of dedication is truly impressive!
                  </p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="margin: 0 0 8px 0; color: #166534;">🚀 Keep Going!</h4>
                  <p style="margin: 0; color: #15803d;">
                    You're building powerful habits that will serve you well. 
                    ${streak.current_streak < 30 ? 'Can you reach 30 days?' : 
                      streak.current_streak < 60 ? 'Can you reach 60 days?' : 
                      streak.current_streak < 90 ? 'Can you reach 90 days?' : 
                      streak.current_streak < 180 ? 'Can you reach 180 days?' : 
                      'You\'re on track for a full year streak!'}
                  </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
                  Keep up the amazing work! 💪<br>
                  The Goal Tracker Team
                </p>
              </div>
            `;

            const emailResponse = await resend.emails.send({
              from: "Goal Tracker <onboarding@resend.dev>",
              to: [streak.user_email],
              subject: subject,
              html: htmlContent,
            });

            if (emailResponse.error) {
              console.error('Error sending streak email:', emailResponse.error);
            } else {
              // Record the notification
              await supabase.from('notifications').insert({
                user_id: streak.user_id,
                type: 'streak_achievement',
                streak_count: streak.current_streak,
                email_subject: subject,
                email_body: htmlContent
              });
              sentNotifications++;
              console.log(`Sent streak achievement notification: ${streak.current_streak} days`);
            }
          }
        }
      } else {
        console.log('No streak achievements found or streak data array is empty');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: sentNotifications,
        message: `Successfully sent ${sentNotifications} notifications`
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);