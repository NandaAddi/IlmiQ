import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service to handle user progress like Streaks and daily goals
 */
export async function updateStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data: progress } = await supabase
    .from('user_progress')
    .select('current_streak, last_activity')
    .eq('user_id', userId)
    .maybeSingle();

  let streak = progress?.current_streak || 0;
  
  if (progress?.last_activity) {
      const lastDate = new Date(progress.last_activity);
      const today = new Date();
      
      // Reset times to midnight to compare days accurately
      lastDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
          // Logged in yesterday -> increment streak
          streak += 1;
      } else if (diffDays > 1) {
          // Missed a day -> reset streak
          streak = 1;
      }
      // If diffDays === 0, they already did activity today, streak stays same
  } else {
      // First activity ever
      streak = 1;
  }

  // Update streak logic inside the database. The `last_activity` is generally updated alongside XP.
  await supabase.from('user_progress').update({
    current_streak: streak
  }).eq('user_id', userId);

  return streak;
}
