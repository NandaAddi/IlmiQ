import { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from '../../contexts/ProgressContext';
import { Users, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function JoinClass() {
  const { user } = useUser();
  const { supabase } = useProgress();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [myClasses, setMyClasses] = useState<{ id: string, name: string }[]>([]);

  // Fetch classes already joined
  useMemo(() => {
    async function fetchMyClasses() {
      if (!user) return;
      const { data } = await supabase
        .from('class_members')
        .select('class:class_id(id, name)')
        .eq('student_id', user.id);
      
      if (data) {
        setMyClasses(data.map((item: any) => item.class));
      }
    }
    fetchMyClasses();
  }, [user, supabase]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length < 4) return;
    
    setLoading(true);
    setMessage(null);

    try {
      // 1. Find class by code
      const { data: classData, error: findError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (findError || !classData) {
        setMessage({ type: 'error', text: 'Kode kelas tidak ditemukan.' });
        setLoading(false);
        return;
      }

      // 2. Check if already member
      const isMember = myClasses.some(c => c.id === classData.id);
      if (isMember) {
        setMessage({ type: 'error', text: 'Anda sudah bergabung di kelas ini.' });
        setLoading(false);
        return;
      }

      // 3. Join
      const { error: joinError } = await supabase
        .from('class_members')
        .insert({
          class_id: classData.id,
          student_id: user.id
        });

      if (joinError) throw joinError;

      setMessage({ type: 'success', text: `Berhasil bergabung ke kelas ${classData.name}!` });
      setMyClasses([...myClasses, classData]);
      setCode('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal bergabung. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Ruang Kelas</h3>
            <p className="text-xs text-slate-500">Gabung dengan kelas guru Anda</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Kode Kelas (Contoh: ABCDEF)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all"
            maxLength={10}
          />
          <button 
            type="submit"
            disabled={loading || code.length < 4}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Gabung
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-xs font-bold">{message.text}</p>
          </div>
        )}

        {myClasses.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Kelas Saya</p>
            <div className="flex flex-wrap gap-2">
              {myClasses.map(c => (
                <div key={c.id} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
