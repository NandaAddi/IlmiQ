export type EvaluasiHafalan = 'perfect' | 'good' | 'hard' | 'forgotten';

export interface KartuHafalanData {
  interval_days: number;
  ease_factor: number;
  repetition_count: number;
  xp_gained?: number; 
}

export function calculateSM2(
  respon: EvaluasiHafalan,
  durasiDetik: number, // Faktor dinamis baru berdasarkan durasi rekaman
  currentState: KartuHafalanData = { interval_days: 0, ease_factor: 2.50, repetition_count: 0 }
): KartuHafalanData {
  
  let { interval_days, ease_factor, repetition_count } = currentState;
  let baseXP = 0;

  if (respon === 'perfect') {
    interval_days = interval_days === 0 ? 1 : Math.round(interval_days * 2.5);
    ease_factor += 0.1;
    repetition_count += 1;
    baseXP = 50;
    
    // Bonus Dinamis: Jika dia Perfect DAN pembacaannya di bawah 15 detik (ekstra cepat & lancar)
    if (durasiDetik > 0 && durasiDetik <= 15) {
       baseXP += 30;
    }
    // Penalti Dinamis: Menekan perfect tapi bacanya lama sekali
    if (durasiDetik > 60) {
       baseXP -= 20;
    }

  } else if (respon === 'good') {
    interval_days = interval_days === 0 ? 1 : Math.round(interval_days * 2.0);
    repetition_count += 1;
    baseXP = 30;
  } else if (respon === 'hard') {
    interval_days = interval_days === 0 ? 1 : Math.round(interval_days * 1.2);
    ease_factor -= 0.15;
    repetition_count += 1;
    baseXP = 15;
  } else if (respon === 'forgotten') {
    interval_days = 1;
    ease_factor -= 0.2;
    repetition_count = 0;
    baseXP = 5; // Upah tetap mencoba
  }

  if (ease_factor < 1.3) {
    ease_factor = 1.3;
  }
  
  // Mencegah hasil minus
  const absoluteXP = Math.max(0, baseXP);

  return { interval_days, ease_factor, repetition_count, xp_gained: absoluteXP };
}
