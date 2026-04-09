import { SupabaseClient } from '@supabase/supabase-js';

export interface MemorizationCard {
  surah_number: number;
  ayah_start: number;
  ayah_end: number;
  interval_days: number;
  ease_factor: number;
  repetition_count: number;
}

/**
 * Service to handle Memorization Cards (Spaced Repetition)
 */
export async function getCard(supabase: SupabaseClient, userId: string, surah: number, ayah: number) {
  const { data, error } = await supabase
    .from('memorization_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('surah_number', surah)
    .eq('ayah_start', ayah)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function upsertCard(supabase: SupabaseClient, userId: string, card: MemorizationCard) {
  const { error } = await supabase.from('memorization_cards').upsert({
    user_id: userId,
    surah_number: card.surah_number,
    ayah_start: card.ayah_start,
    ayah_end: card.ayah_end,
    interval_days: card.interval_days,
    ease_factor: card.ease_factor,
    repetition_count: card.repetition_count,
    next_review_date: new Date(Date.now() + card.interval_days * 86400000).toISOString().split('T')[0]
  }, { onConflict: 'user_id, surah_number, ayah_start, ayah_end' });

  if (error) throw error;
  return { success: true };
}
