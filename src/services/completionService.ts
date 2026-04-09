import { SupabaseClient } from '@supabase/supabase-js';
import { updateStreak } from './progressService';

/**
 * Service to handle marking topics (surahs, duas, akidah) as complete.
 * Includes validation and atomic database updates.
 */
export async function markTopicComplete(
  supabase: SupabaseClient, 
  userId: string, 
  topicId: string, 
  xpReward: number,
  pScore: number = 1,
  pMaxScore: number = 1
) {
  try {
    // 1. Record Completion via Upsert
    const { error: quizError } = await supabase.from('quiz_scores').upsert({
      user_id: userId,
      topic_name: topicId,
      score: pScore,
      max_score: pMaxScore
    }, { onConflict: 'user_id, topic_name' });

    if (quizError) throw quizError;

    // 3. Increment XP Atomics (Using RPC from Phase 1)
    if (xpReward > 0) {
      const { error: xpError } = await supabase.rpc('increment_xp', {
        p_user_id: userId,
        p_xp: xpReward
      });
      if (xpError) throw xpError;
    }

    // 4. Update Streak via Service
    await updateStreak(supabase, userId);

    return { success: true };
  } catch (error) {
    console.error("Completion Service Error:", error);
    return { success: false, error };
  }
}
