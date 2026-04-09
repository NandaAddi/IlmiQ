import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDuaDetail } from '../lib/duaData';
import type { DuaDetail } from '../lib/duaData';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AyahEvaluator from '../components/quran/AyahEvaluator';
import MissionComplete from '../components/common/MissionComplete';

export default function DuaRead() {
  const { id } = useParams();
  const [dua, setDua] = useState<DuaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetching data
  useEffect(() => {
    if (id) {
      setLoading(true);
      const res = getDuaDetail(id);
      setDua(res);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!dua) return <div className="text-center py-10 font-bold text-slate-500">Modul Doa tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <Link to="/" className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dua.title}</h1>
          <p className="text-sm text-slate-500">Kategori {dua.category} • Materi Kelas {dua.targetClass}</p>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="p-6 rounded-2xl border-2 transition-all duration-300 bg-white border-slate-100 mb-6">
            <div className="text-right mb-6 break-words">
                <span className="font-arabic text-4xl md:text-5xl leading-[2.5] font-medium text-slate-800" dir="rtl">
                    {dua.arabic}
                </span>
            </div>
            
            <div>
              <div className="text-emerald-700 font-bold mb-2 text-lg">
                {dua.latin}
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {dua.translation}
              </p>
            </div>
        </div>

        {/* Evaluasi AI & Spaced Repetition Panel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-2">Evaluasi Hafalan Lisan</h2>
            <p className="text-xs text-slate-500 mb-4">Setor hafalan doa ini dengan suara Anda. Algoritma akan menandai kefasihan dan ritme hafalan Anda.</p>
            {/* We pass 999 as surah number to distinct dua in the memorization cards system */}
            <AyahEvaluator nomorAyat={dua.numericId} nomorSurah={999} />
        </div>
      </div>

      {/* MISSION COMPLETE SECTION */}
      <div className="pb-12">
        <MissionComplete topicId={dua.id} topicTitle={dua.title} xpReward={75} />
      </div>
    </div>
  );
}
