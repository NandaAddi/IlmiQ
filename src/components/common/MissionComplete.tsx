import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { CheckCircle2, Loader2, Trophy, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';
import { markTopicComplete } from '../../services/completionService';

interface MissionCompleteProps {
  topicId: string;
  topicTitle: string;
  xpReward?: number;
}

export default function MissionComplete({ topicId, topicTitle, xpReward = 100 }: MissionCompleteProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const { refreshProgress, supabase } = useProgress();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      if (!user || !supabase) return;
      const { data } = await supabase
        .from('quiz_scores')
        .select('id')
        .eq('topic_name', topicId)
        .maybeSingle();
      
      if (data) {
        setIsCompleted(true);
      }
    }
    checkStatus();
  }, [user, topicId, supabase]);

  const handleComplete = async () => {
    if (!user || isCompleted || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await markTopicComplete(supabase, user.id, topicId, xpReward);
    
    if (result.success) {
      await refreshProgress();
      setIsCompleted(true);
    } else {
      setErrorMessage("Gagal menyelesaikan misi. Silakan coba lagi.");
    }
    setIsSubmitting(false);
  };

  if (isCompleted) {
    return (
      <div className="bg-emerald-600 text-white rounded-[2rem] p-8 text-center shadow-xl animate-in zoom-in duration-500">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black mb-2">Misi Selesai!</h3>
        <p className="text-emerald-100 mb-6 font-medium">Kamu telah menuntaskan misi {topicTitle}. Surat/Misi berikutnya kini telah terbuka!</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-black flex items-center gap-2 mx-auto hover:bg-emerald-50 transition-colors"
        >
          Kembali ke Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-[2rem] p-10 text-center shadow-lg group">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Trophy className="w-20 h-20 text-emerald-500 relative z-10 group-hover:scale-110 transition-transform duration-500" />
          <Star className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 fill-amber-400 animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-2">Selesaikan Misi Ini?</h3>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">Tandai misi {topicTitle} sebagai selesai untuk membuka tantangan berikutnya dan dapatkan XP!</p>
      
      <button
        onClick={handleComplete}
        disabled={isSubmitting}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-3 mx-auto"
      >
        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
        Tuntaskan Misi <span className="text-emerald-300">+{xpReward} XP</span>
      </button>

      {errorMessage && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-600 font-bold text-sm animate-pulse">
           <AlertCircle className="w-4 h-4" /> {errorMessage}
        </div>
      )}
    </div>
  );
}
