import { useEffect, useState } from 'react';
import { Users, AlertCircle, PlusCircle, CheckCircle, Search, Copy, Presentation, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from '../contexts/ProgressContext';

interface ClassData {
  id: string;
  name: string;
  code: string;
  studentCount: number;
}

interface StudentProgress {
  id: string;
  name: string;
  xp: number;
  streak: number;
  status: 'good' | 'at-risk' | 'excellent';
  lastActivity: string;
  quizAvg: number;
}

export default function TeacherDashboard() {
  const { user } = useUser();
  const { supabase } = useProgress();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClass, setActiveClass] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creationError, setCreationError] = useState('');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTeacherData() {
      if (!user) return;
      setLoading(true);

      // Verify Role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      setRole(userData?.role || 'student');

      if (userData?.role !== 'teacher' && userData?.role !== 'admin') {
        setLoading(false);
        return;
      }

      // Fetch classes of this teacher
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);

      if (classesData && classesData.length > 0) {
        // Map to get student counts (simulated for now, or we can fetch count)
        const formattedClasses = await Promise.all(classesData.map(async (c: any) => {
           const { count } = await supabase
             .from('class_members')
             .select('*', { count: 'exact', head: true })
             .eq('class_id', c.id);
           return {
             id: c.id,
             name: c.name,
             code: c.code,
             studentCount: count || 0
           };
        }));
        setClasses(formattedClasses);
        setActiveClass(formattedClasses[0]);
      }
      setLoading(false);
    }
    fetchTeacherData();
  }, [user, supabase]);

  useEffect(() => {
    async function fetchStudents() {
      if (!activeClass || !user || !supabase) return;

      // Fetch members of the active class, join with users and their progress
      const { data: members, error: fetchError } = await supabase
        .from('class_members')
        .select(`
          student_id,
          student:student_id (
            full_name,
            avatar_url,
            user_progress (
              total_xp,
              current_streak,
              last_activity
            ),
            quiz_scores (
              score,
              max_score
            )
          )
        `)
        .eq('class_id', activeClass.id);

      if (fetchError) {
        console.error("Error fetching students:", fetchError);
        return;
      }

      if (members) {
        const formattedStudents: StudentProgress[] = members.map((m: any) => {
          const student = m.student;
          // user_progress usually comes as an array or single object depending on relationship
          const progressData = Array.isArray(student?.user_progress) 
            ? student.user_progress[0] 
            : student?.user_progress;
            
          const progress = progressData || { total_xp: 0, current_streak: 0, last_activity: 'Belum ada' };
          
          let status: 'good' | 'at-risk' | 'excellent' = 'good';
          if (progress.total_xp > 1000) status = 'excellent';
          
          const lastDate = progress.last_activity ? new Date(progress.last_activity) : null;
          const diffDays = lastDate ? (Date.now() - lastDate.getTime()) / (1000 * 3600 * 24) : 99;
          if (diffDays > 3) status = 'at-risk';

          let quizAvg = 0;
          if (student?.quiz_scores && student.quiz_scores.length > 0) {
              const totalScore = student.quiz_scores.reduce((acc: number, q: any) => acc + (q.score / q.max_score) * 100, 0);
              quizAvg = Math.round(totalScore / student.quiz_scores.length);
          }

          return {
            id: m.student_id,
            name: student?.full_name || 'Siswa #' + m.student_id.substring(0, 4),
            xp: progress.total_xp || 0,
            streak: progress.current_streak || 0,
            status: status,
            lastActivity: progress.last_activity || 'Belum ada',
            quizAvg: quizAvg
          };
        });
        setStudents(formattedStudents);
      }
    }
    fetchStudents();
  }, [activeClass, user, supabase]);

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateClass = async () => {
    if (!newClassName || !user || !supabase) return;
    
    if (newClassName.trim().length < 3) {
      setCreationError("Nama kelas minimal 3 karakter.");
      return;
    }

    setCreationError('');
    const code = generateClassCode();

    const { data, error } = await supabase
      .from('classes')
      .insert({
        teacher_id: user.id,
        name: newClassName.trim(),
        code: code
      })
      .select()
      .single();

    if (error) {
       setCreationError("Gagal: " + error.message);
    } else {
      const newC = { id: data.id, name: data.name, code: data.code, studentCount: 0 };
      setClasses([...classes, newC]);
      setActiveClass(newC);
      setIsCreatingClass(false);
      setNewClassName('');
    }
  };

  const copyCode = () => {
    if (activeClass) {
      navigator.clipboard.writeText(activeClass.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (role && role !== 'teacher' && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-red-100 shadow-xl shadow-red-900/5 text-center px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
             <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Akses Terbatas!</h2>
          <p className="text-slate-500 max-w-sm mb-8">Maaf, halaman ini hanya dapat diakses oleh akun dengan peran **Guru** atau **Admin**. Silakan hubungi administrator jika Anda seharusnya memiliki akses ini.</p>
          <a href="/" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-105 active:scale-95">Kembali ke Beranda</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 relative overflow-hidden select-none">
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-emerald-300 mb-4 uppercase tracking-widest backdrop-blur">
             <Presentation className="w-3 h-3" /> Teacher Portal
           </div>
           <h1 className="text-2xl md:text-3xl font-black mb-2">Manajemen Kelas & Murid</h1>
           <p className="text-slate-300 text-sm opacity-80 max-w-md leading-relaxed">
             Pantau grafik hafalan dan kestabilan muraja'ah siswa Anda melalui algoritma Spaced Repetition (SM-2).
           </p>
        </div>
        <button 
          onClick={() => setIsCreatingClass(true)}
          className="relative z-10 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-emerald-900/20 transition transform hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5"/> Buat Ruang Kelas
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-32 -translate-y-32"></div>
      </div>

      {isCreatingClass && (
        <div className="bg-white border-2 border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl shadow-emerald-600/5">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nama Kelas</label>
              <input 
                className="w-full px-4 py-3 outline-none border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all rounded-xl text-sm font-semibold" 
                placeholder="Misal: VII-A Agama Islam" 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                autoFocus
              />
              {creationError && <p className="text-red-500 text-[10px] font-bold mt-2 animate-bounce flex items-center gap-1.5"><AlertCircle className="w-3 h-3"/> {creationError}</p>}
            </div>
            <div className="flex gap-2 w-full md:w-auto h-fit mt-auto">
              <button onClick={() => { setIsCreatingClass(false); setCreationError(''); }} className="flex-1 md:flex-none hover:bg-slate-100 text-slate-500 px-6 py-3 rounded-xl text-sm font-bold transition">Batal</button>
              <button onClick={handleCreateClass} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition">Rilis Kelas</button>
            </div>
        </div>
      )}

      {classes.length === 0 && !isCreatingClass ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
           <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-medium">Anda belum memiliki kelas aktif.</p>
           <button onClick={() => setIsCreatingClass(true)} className="text-emerald-600 font-bold text-sm mt-2">Buat kelas pertama sekarang →</button>
        </div>
      ) : activeClass && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Nama Rombel</h3>
                <div className="text-xl font-bold text-slate-800">{activeClass.name}</div>
            </div>
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Populasi Murid</h3>
                <div className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500 inline" /> {activeClass.studentCount} Terdaftar
                </div>
            </div>
            
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 shadow-sm relative group overflow-hidden">
                <h3 className="text-emerald-700/80 text-[10px] font-bold uppercase tracking-widest mb-1">Akses Kode Gabung</h3>
                <div className="text-2xl font-mono font-black text-emerald-900 tracking-wider">
                   {activeClass.code}
                </div>
                <button 
                  onClick={copyCode}
                  className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white text-emerald-600 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                >
                    {copied ? <CheckCircle className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/30">
              <div>
                 <h2 className="font-bold text-slate-800">Analitik Hafalan Aktif</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Berdasarkan data SM-2 Supabase</p>
              </div>
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" />
                <input 
                  type="text" 
                  placeholder="Cari siswa..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 text-slate-700 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all" 
                />
              </div>
            </div>
            
            <div className="divide-y divide-slate-50">
               {filteredStudents.length === 0 ? (
                 <div className="p-10 text-center text-slate-400 text-sm">Belum ada murid di kelas ini.</div>
               ) : filteredStudents.map((student) => (
                 <div key={student.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200 font-bold flex items-center justify-center text-slate-500 text-sm">
                         {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{student.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">Aktif: <span className="text-slate-600">{student.lastActivity}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-center w-16">
                          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">XP</div>
                          <div className="font-black text-amber-500">{student.xp}</div>
                       </div>
                       <div className="text-center w-16">
                          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Streak</div>
                          <div className="font-black text-orange-500">{student.streak}</div>
                       </div>
                       <div className="text-center w-16">
                          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Kuis</div>
                          <div className="font-black text-purple-500">{student.quizAvg}</div>
                       </div>
                       <div className="w-32 flex justify-end">
                          {student.status === 'at-risk' && (
                             <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                                <AlertCircle className="w-3 h-3"/> At-Risk
                             </span>
                          )}
                          {student.status === 'excellent' && (
                             <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                <CheckCircle className="w-3 h-3"/> Excellent
                             </span>
                          )}
                          {student.status === 'good' && (
                             <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                Stable
                             </span>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            {classes.length > 1 && (
              <div className="p-4 bg-slate-50 border-t flex justify-center gap-2">
                 {classes.map(c => (
                   <button 
                    key={c.id} 
                    onClick={() => setActiveClass(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeClass.id === c.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
                   >
                     {c.name}
                   </button>
                 ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
