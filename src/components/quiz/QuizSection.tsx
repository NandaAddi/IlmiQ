import { useState, useRef } from 'react';
import type { QuizQuestion } from '../../lib/aqidahData';
import { useUser } from '@clerk/clerk-react';
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Star, AlertCircle } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';
import { markTopicComplete } from '../../services/completionService';

interface QuizSectionProps {
  topicId: string;
  questions: QuizQuestion[];
}

export default function QuizSection({ topicId, questions }: QuizSectionProps) {
  const { user } = useUser();
  const { refreshProgress, supabase } = useProgress();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const scoreRef = useRef(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const question = questions[currentQIndex];

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(index);
    const correct = index === question.correctAnswerIndex;
    if (correct) {
      scoreRef.current += 1;
    }
  };

  const handleNext = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Finish Quiz
      setQuizFinished(true);
      await submitScore();
    }
  };

  const submitScore = async () => {
      if(!user) return;
      setIsSubmitting(true);
      setErrorMessage(null);
      const finalScore = scoreRef.current;
      
      const result = await markTopicComplete(
        supabase, 
        user.id, 
        topicId, 
        finalScore * 50, 
        finalScore, 
        questions.length
      );

      if (result.success) {
        await refreshProgress();
      } else {
        setErrorMessage("Gagal menyimpan nilai kuis.");
      }
      setIsSubmitting(false);
  };

  if (questions.length === 0) return null;

  if (quizFinished) {
      return (
          <div className="bg-gradient-to-tr from-emerald-50 to-amber-50 border-2 border-emerald-200 rounded-[2rem] p-10 text-center animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/40 blur-xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                 <div className="relative mb-6">
                    <ShieldCheck className="w-24 h-24 text-emerald-500 relative z-10 drop-shadow-xl animate-bounce" />
                    <Star className="w-12 h-12 text-amber-400 absolute -top-4 -right-4 fill-amber-400 animate-[spin_3s_linear_infinite]" />
                 </div>
                 
                 <h3 className="text-3xl font-black text-emerald-900 mb-2">Misi Selesai!</h3>
                 <p className="text-emerald-700 font-medium mb-8">Kamu menjawab benar {scoreRef.current} dari {questions.length} soal rintangan.</p>
                 
                 <div className="relative bg-white px-8 py-4 rounded-2xl shadow-xl border-b-4 border-emerald-100 flex flex-col items-center gap-1 group-hover:-translate-y-2 transition-transform duration-300 mb-8">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">XP Bertambah</span>
                     <div className="text-3xl font-black text-amber-500">+{scoreRef.current * 50} <span className="text-sm text-slate-400">XP</span></div>
                 </div>

                 <button 
                   onClick={() => window.location.href = '/'}
                   className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 mx-auto hover:bg-emerald-500 transition-colors shadow-lg"
                 >
                   Kembali ke Dashboard <ArrowRight className="w-4 h-4" />
                 </button>

                 {errorMessage && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-red-600 font-bold text-sm animate-pulse">
                       <AlertCircle className="w-4 h-4" /> {errorMessage}
                    </div>
                 )}

                 {isSubmitting && <div className="mt-8 flex justify-center text-emerald-500 bg-white/50 px-4 py-2 rounded-full"><Loader2 className="w-4 h-4 animate-spin" /></div>}
              </div>
          </div>
      );
  }

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm mt-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1.5 bg-emerald-500 transition-all duration-300" style={{ width: `${((currentQIndex) / questions.length) * 100}%`}}></div>
      
      <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-amber-500" />
             Evaluasi Konsep
          </h3>
          <div className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-inner">
              Rintangan {currentQIndex + 1} / {questions.length}
          </div>
      </div>

      <div className="mb-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <p className="text-xl text-slate-800 font-bold leading-relaxed">{question.question}</p>
      </div>

      <div className="space-y-3">
          {question.options.map((opt, idx) => {
              let btnClass = "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md hover:-translate-y-0.5 text-slate-700";
              
              if (selectedAnswer !== null) {
                  if (idx === question.correctAnswerIndex) {
                      btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-4 ring-emerald-500/20 scale-[1.02] shadow-lg z-10 font-bold";
                  } else if (idx === selectedAnswer) {
                      btnClass = "border-red-300 bg-red-50 text-red-800 opacity-80 scale-95";
                  } else {
                      btnClass = "border-slate-100 opacity-40 grayscale";
                  }
              }

              return (
                  <button 
                    key={idx}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`w-full text-left p-5 rounded-2xl border-[3px] transition-all duration-300 font-medium relative ${btnClass}`}
                  >
                      {opt}
                      {/* Check/X Icon inside the selected button */}
                      {selectedAnswer !== null && idx === question.correctAnswerIndex && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 absolute right-5 top-1/2 -translate-y-1/2 animate-in zoom-in" />
                      )}
                  </button>
              )
          })}
      </div>

      {selectedAnswer !== null && (
          <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/20 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition transform hover:scale-105 active:scale-95"
              >
                  Langkah Berikutnya <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      )}
    </div>
  );
}
