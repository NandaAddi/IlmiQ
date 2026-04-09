import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAqidahDetail } from '../lib/aqidahData';
import type { AqidahChapter as AqidahChapterType } from '../lib/aqidahData';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import QuizSection from '../components/quiz/QuizSection';

export default function AqidahChapter() {
  const { id } = useParams();
  const [chapter, setChapter] = useState<AqidahChapterType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetching data
  useEffect(() => {
    if (id) {
      setLoading(true);
      const res = getAqidahDetail(id);
      setChapter(res);
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

  if (!chapter) return <div className="text-center py-10 font-bold text-slate-500">Materi Akidah tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <Link to="/" className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{chapter.title}</h1>
          <p className="text-sm text-slate-500">Materi Kelas {chapter.targetClass}</p>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="p-8 rounded-2xl border-2 transition-all duration-300 bg-white border-slate-100">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                     <BookOpen className="w-5 h-5"/>
                </div>
                <div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi Modul</div>
                     <p className="text-sm text-slate-700">{chapter.description}</p>
                </div>
            </div>
            
            <div className="prose prose-emerald max-w-none text-slate-700 leading-loose">
               {/* Karena ini simple mock, kita asumsikan content mendukung markdown (tapi di render plain/pre-wrap sederhana dulu) */}
               <div className="whitespace-pre-wrap">
                   {chapter.content}
               </div>
            </div>
        </div>

        {/* QUIZ SECTION (COGNITIVE EVALUATION) */}
        {chapter.quiz && chapter.quiz.length > 0 && (
           <QuizSection topicId={`aqidah-${chapter.id}`} questions={chapter.quiz} />
        )}
      </div>
    </div>
  );
}
