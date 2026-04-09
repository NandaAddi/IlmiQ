import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, Brain, Loader2 } from 'lucide-react';
import { calculateSM2 } from '../../lib/sm2';
import type { EvaluasiHafalan, KartuHafalanData } from '../../lib/sm2';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from '../../contexts/ProgressContext';
import { getCard, upsertCard } from '../../services/memorizationService';
import { markTopicComplete } from '../../services/completionService';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AyahEvaluatorProps {
  nomorAyat: number;
  nomorSurah: number;
}

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function AyahEvaluator({ nomorAyat, nomorSurah }: AyahEvaluatorProps) {
  const { user } = useUser();
  const { refreshProgress, supabase } = useProgress();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [evaluationDone, setEvaluationDone] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [simulatedCardData, setSimulatedCardData] = useState<KartuHafalanData | null>(null);
  const recordingStartTime = useRef<number>(0);
  const [recordingDurationSecs, setRecordingDurationSecs] = useState<number>(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    async function loadCard() {
      if (!user || !supabase) return;
      try {
        const data = await getCard(supabase, user.id, nomorSurah, nomorAyat);
        if (data) setSimulatedCardData(data);
      } catch (err) {
        console.error("Failed to load card", err);
      }
    }
    loadCard();
  }, [user, nomorSurah, nomorAyat, supabase]);

  const startRecording = () => {
    if (!SpeechRecognition) {
      alert("Maaf, browser Anda tidak mendukung Web Speech API. Mohon gunakan Google Chrome terbaru.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setErrorMessage('');
      setEvaluationDone(false);
      recordingStartTime.current = Date.now();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error("Speech Recognition Error:", event.error);
      
      switch (event.error) {
        case 'network':
          setErrorMessage("⚠️ Gangguan Jaringan. Silakan cek koneksi internet Anda.");
          break;
        case 'not-allowed':
          setErrorMessage("⚠️ Akses Mikrofon ditolak. Mohon aktifkan izin mikrofon.");
          break;
        case 'no-speech':
          setErrorMessage("⚠️ Suara tidak terdeteksi. Silakan coba lagi dengan suara yang lebih jelas.");
          break;
        case 'aborted':
          setErrorMessage("⚠️ Perekaman dibatalkan.");
          break;
        case 'audio-capture':
          setErrorMessage("⚠️ Mikrofon tidak terdeteksi atau sedang digunakan aplikasi lain.");
          break;
        default:
          setErrorMessage(`⚠️ Terjadi kesalahan: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recordingStartTime.current > 0) {
        setRecordingDurationSecs(Math.round((Date.now() - recordingStartTime.current) / 1000));
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSM2Evaluation = async (rating: EvaluasiHafalan) => {
    if (!user || !supabase) return;
    setIsSyncing(true);
    setErrorMessage('');
    
    const currentSimulatedState = simulatedCardData || { interval_days: 0, ease_factor: 2.50, repetition_count: 0 };
    const newStats = calculateSM2(rating, recordingDurationSecs, currentSimulatedState); 
    
    setSimulatedCardData(newStats);
    setEvaluationDone(true);
    
    try {
      // 1. Sync Card via Service
      await upsertCard(supabase, user.id, {
        surah_number: nomorSurah,
        ayah_start: nomorAyat,
        ayah_end: nomorAyat,
        interval_days: newStats.interval_days,
        ease_factor: newStats.ease_factor,
        repetition_count: newStats.repetition_count
      });

      // 2. Sync Progress via Service
      const result = await markTopicComplete(
        supabase,
        user.id,
        `quran-${nomorSurah}-${nomorAyat}`,
        newStats.xp_gained || 0
      );

      if (result.success) {
        await refreshProgress();
      } else {
        setErrorMessage("Gagal menyimpan progress hafalan.");
      }

    } catch (err) {
      console.error("Supabase Sync Error:", err);
      setErrorMessage("Terjadi kesalahan teknis saat sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-600" />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Evaluator</span>
        </div>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
              : 'bg-white text-emerald-600 border border-emerald-100 hover:border-emerald-500 shadow-sm disabled:opacity-50'
          }`}
        >
          {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          {isRecording ? 'SELESAI' : 'SETOR HAFALAN'}
        </button>
      </div>

      {errorMessage && (
         <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4 animate-in fade-in">
           <p className="text-red-700 text-[10px] font-bold leading-tight">{errorMessage}</p>
         </div>
      )}

      {transcript && !errorMessage && (
         <div className="bg-white p-4 rounded-xl border border-emerald-50 mb-4 shadow-sm" dir="rtl">
            <p className="font-arabic text-xl text-emerald-950 leading-relaxed">
              {transcript}
            </p>
         </div>
      )}

      {(transcript || evaluationDone || errorMessage) && !isRecording && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           {evaluationDone ? (
             <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg shadow-emerald-900/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                   <CheckCircle2 className="w-5 h-5 text-white" /> 
                </div>
                <div>
                   <div className="text-xs font-bold">Terdaftar! +{simulatedCardData?.xp_gained} XP</div>
                   <div className="text-[9px] opacity-80 uppercase tracking-widest font-black">Lanjut ayat berikutnya →</div>
                </div>
             </div>
           ) : (
             <div className={isSyncing ? "opacity-40 pointer-events-none" : ""}>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Seberapa lancar lisan Anda?</div>
               <div className="grid grid-cols-4 gap-2">
                 <button onClick={() => handleSM2Evaluation('perfect')} className="flex flex-col items-center gap-1 p-2 bg-white border border-emerald-100 rounded-xl hover:border-emerald-600 hover:shadow-md transition-all group">
                    <div className="text-lg">💎</div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase">Lancar</span>
                 </button>
                 <button onClick={() => handleSM2Evaluation('good')} className="flex flex-col items-center gap-1 p-2 bg-white border border-blue-100 rounded-xl hover:border-blue-600 transition-all group">
                    <div className="text-lg">✅</div>
                    <span className="text-[8px] font-black text-blue-600 uppercase">Baik</span>
                 </button>
                 <button onClick={() => handleSM2Evaluation('hard')} className="flex flex-col items-center gap-1 p-2 bg-white border border-orange-100 rounded-xl hover:border-orange-600 transition-all group">
                    <div className="text-lg">⚠️</div>
                    <span className="text-[8px] font-black text-orange-600 uppercase">Sulit</span>
                 </button>
                 <button onClick={() => handleSM2Evaluation('forgotten')} className="flex flex-col items-center gap-1 p-2 bg-white border border-red-100 rounded-xl hover:border-red-600 transition-all group">
                    <div className="text-lg">❌</div>
                    <span className="text-[8px] font-black text-red-600 uppercase">Lupa</span>
                 </button>
               </div>
               {isSyncing && (
                 <div className="mt-4 flex justify-center">
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                 </div>
               )}
             </div>
           )}
        </div>
      )}
    </div>
  );
}
