import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSurahDetail } from '../lib/equran';
import type { SurahDetail } from '../lib/equran';
import { ArrowLeft, Loader2, Play, Pause, FastForward } from 'lucide-react';
import AyahEvaluator from '../components/quran/AyahEvaluator';
import MissionComplete from '../components/common/MissionComplete';

export default function SurahRead() {
  const { nomor } = useParams();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetching data
  useEffect(() => {
    if (nomor) {
      setLoading(true);
      getSurahDetail(nomor).then(res => {
        setSurah(res);
        setLoading(false);
      });
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [nomor]);

  // Handle Play rate changes globally
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = (ayahIndex: number, audioUrl: string) => {
    // Apabila ayah ini sedang ditekan lagi, pause
    if (playingAyah === ayahIndex && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    // Stop audio lama yang mungkin sedang jalan
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Inisiasi engine pemutar suara baru
    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackRate;
    
    // Auto-next ke ayat berikutnya ketika lagu selesai (Core Spaced-Repetition feature part)
    audio.onended = () => {
      if (surah && ayahIndex + 1 < surah.ayat.length) {
        // Otomatis mainkan index ayah berikutnya
        togglePlay(ayahIndex + 1, surah.ayat[ayahIndex + 1].audio['05']);
        
        // Auto scroll layar ke target bacaan baru
        document.getElementById(`ayah-${surah.ayat[ayahIndex + 1].nomorAyat}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setPlayingAyah(null); // Akhir dari surah
      }
    };
    
    // Putar dan catat indeks state reaktif
    audio.play().then(() => {
      audioRef.current = audio;
      setPlayingAyah(ayahIndex);
    }).catch(e => console.error("Gagal Memutar Murottal:", e));
  };

  const handleSpeedChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(currentIndex + 1) % rates.length]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!surah) return <div className="text-center py-10 font-bold text-slate-500">Modul Surah tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <Link to="/" className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{surah.namaLatin}</h1>
          <p className="text-sm text-slate-500">{surah.arti} • {surah.jumlahAyat} Ayat</p>
        </div>
      </div>

      {/* Global Control Bar yang melayang saat scroll */}
      <div className="bg-emerald-800/95 backdrop-blur text-white p-3 rounded-xl sticky top-20 z-40 shadow-lg flex items-center justify-between">
         <div className="text-sm font-medium pl-2">Pengaturan Murottal</div>
         <button 
           onClick={handleSpeedChange} 
           className="px-4 py-2 bg-white/20 hover:bg-white/30 font-bold rounded-lg text-sm flex items-center gap-2 transition"
         >
            <FastForward className="w-4 h-4" /> {playbackRate}x Speed
         </button>
      </div>

      {/* Lafadz Basmalah */}
      {surah.nomor !== 1 && surah.nomor !== 9 && (
        <div className="text-center font-arabic text-3xl py-8 text-emerald-800 font-semibold" dir="rtl">
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      )}

      {/* Daftar Ayat dan Tajwid */}
      <div className="space-y-4 pb-12">
        {surah.ayat.map((ayah, idx) => (
          <div 
            key={ayah.nomorAyat} 
            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              playingAyah === idx 
                ? 'bg-emerald-50 border-emerald-400 shadow-md scale-[1.01]' 
                : 'bg-white border-slate-100'
            }`}
            id={`ayah-${ayah.nomorAyat}`}
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              {/* Tombol Play Murottal Per Ayat */}
              <button 
                onClick={() => togglePlay(idx, ayah.audio['05'])}
                className={`p-4 rounded-full shrink-0 transition-colors shadow-sm ${
                  playingAyah === idx 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {playingAyah === idx ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Teks Utama Arab (RTL) */}
              <div className="text-right flex-1 break-words">
                <span className="font-arabic text-3xl md:text-4xl leading-[2.5] font-medium text-slate-800" dir="rtl">
                   {ayah.teksArab}
                </span>
              </div>
            </div>
            
            {/* Teks Latin & Terjemahan */}
            <div className="md:pl-[4.5rem]">
              <div className="text-emerald-700 font-bold mb-2 text-lg">
                {ayah.nomorAyat}. {ayah.teksLatin}
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {ayah.teksIndonesia}
              </p>
              
              {/* Evaluasi AI & Spaced Repetition Panel */}
              <AyahEvaluator nomorAyat={ayah.nomorAyat} nomorSurah={surah.nomor} />
            </div>
          </div>
        ))}
      </div>

      {/* MISSION COMPLETE SECTION */}
      <div className="pb-20">
         <MissionComplete topicId={`quran-${surah.nomor}`} topicTitle={surah.namaLatin} xpReward={surah.jumlahAyat * 10} />
      </div>
    </div>
  );
}
