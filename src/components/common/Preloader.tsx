import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  
  const loadingTexts = [
    "Menyiapkan Pustaka Ilmu...",
    "Menghubungkan Sanad...",
    "Menyinkronkan Hafalan...",
    "IlmiQ Siap untuk Anda!"
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800); // Premium feel delay

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-center flex-col items-center justify-center overflow-hidden transition-opacity duration-1000">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

      <div className="relative flex flex-col items-center scale-110 md:scale-125">
        {/* Animated Geometric Pattern (Islamic Star style) */}
        <div className="relative w-24 h-24 mb-10">
           <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-[30%] rotate-45 animate-[spin_8s_linear_infinite]"></div>
           <div className="absolute inset-0 border-4 border-amber-400/50 rounded-[30%] -rotate-45 animate-[spin_12s_linear_infinite_reverse]"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white animate-pulse" />
           </div>
        </div>

        {/* Branding */}
        <div className="text-center">
           <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
              Ilmi<span className="text-emerald-500">Q</span>
           </h1>
           <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto rounded-full mb-6"></div>
           
           <div className="h-6 overflow-hidden">
             <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-[0.3em] font-mono animate-in slide-in-from-bottom duration-500">
                {loadingTexts[textIndex]}
             </p>
           </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
           <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 animate-[loading-bar_3s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 50%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
