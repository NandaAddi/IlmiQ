import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSurahList } from '../lib/equran';
import { getDuaList } from '../lib/duaData';
import { getAqidahList } from '../lib/aqidahData';
import type { Surah } from '../lib/equran';
import type { DuaDetail } from '../lib/duaData';
import type { AqidahChapter } from '../lib/aqidahData';
import { Loader2, Search, Trophy, Flame, Layers, BookOpen, Star, Shield, ArrowRight, Book, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from '../contexts/ProgressContext';
import JoinClass from '../components/common/JoinClass';

type TabView = 'quran' | 'doa' | 'akidah';
const getLevelInfo = (xp: number) => {
    if (xp < 501) return { title: "Mubtadi'", level: 1, base: 0, nextXp: 501 };
    if (xp < 2001) return { title: "Thalibul 'Ilm", level: 2, base: 501, nextXp: 2001 };
    if (xp < 5001) return { title: "Salik", level: 3, base: 2001, nextXp: 5001 };
    return { title: "Hafizh Muda", level: 4, base: 5001, nextXp: 10000 }; // Max tier logic
}

export default function Dashboard() {
  const { user } = useUser();
  const { stats, completedTopics } = useProgress();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [duas, setDuas] = useState<DuaDetail[]>([]);
  const [aqidahs, setAqidahs] = useState<AqidahChapter[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('quran');
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      setSurahs(await getSurahList());
      setDuas(getDuaList());
      setAqidahs(getAqidahList());
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.namaLatin.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredDuas = duas.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAqidahs = aqidahs.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const levelInfo = getLevelInfo(stats.xp);
  const xpNeededInTier = levelInfo.nextXp - levelInfo.base;
  const xpGainedInTier = stats.xp - levelInfo.base;
  const progressPercent = Math.min(100, Math.max(0, (xpGainedInTier / xpNeededInTier) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. GAMIFIED PROFILE HEADER */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 justify-between">
           <div className="flex items-center gap-5">
              <div className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-full blur p-1 
                                 opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                 <div className="w-20 h-20 bg-slate-800 rounded-full relative z-10 flex items-center justify-center font-black text-2xl text-white border-2 border-slate-700 shadow-inner">
                    {user?.firstName?.charAt(0) || 'S'}
                 </div>
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-[10px] font-black text-amber-950 px-3 py-1 rounded-full border-2 border-slate-900 z-20 shadow-lg">
                    LV. {levelInfo.level}
                 </div>
              </div>
              
              <div>
                 <div className="inline-flex items-center gap-1.5 text-amber-400 font-black text-[10px] uppercase tracking-widest mb-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Student Rank
                 </div>
                 <h1 className="text-2xl md:text-3xl font-black text-white shrink-0">
                    {levelInfo.title}
                 </h1>
                 <p className="text-slate-400 text-sm mt-1">{user?.fullName || 'Petualang Ilmu'}</p>
              </div>
           </div>

           <div className="flex gap-4 self-start md:self-auto">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
                 <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Streak
                 </div>
                 <div className="text-xl md:text-2xl font-black text-white">{stats.streak} <span className="text-xs text-slate-500 uppercase">Hari</span></div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
                 <div className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Total XP
                 </div>
                 <div className="text-xl md:text-2xl font-black text-white">{stats.xp.toLocaleString()} <span className="text-xs text-slate-500">XP</span></div>
              </div>
           </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
           <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 font-mono">
              <span>{levelInfo.base} XP</span>
              <span className="text-amber-300">Menuju {(levelInfo.nextXp).toLocaleString()} XP</span>
           </div>
           <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
               <div 
                 className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-1000 ease-out relative"
                 style={{ width: `${progressPercent}%` }}
               >
                  <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
               </div>
           </div>
        </div>
      </section>

      {/* 2. DAILY GOALS WIDGET */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
         <div className="absolute right-0 top-0 p-8 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
            <Star className="w-48 h-48 text-emerald-900" />
         </div>
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-emerald-900 flex items-center gap-2">
                   ⚡ Misi Harian Anda
                </h2>
                <span className="text-xs font-bold text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">
                   {stats.streak % 7} / 7 Reward
                </span>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
                 <button 
                   onClick={() => {
                      const nextSurah = surahs.find(s => !completedTopics.includes(`quran-${s.nomor}-1`));
                      if (nextSurah) window.location.href = `/surah/${nextSurah.nomor}`;
                   }}
                   className="flex-1 bg-white/60 hover:bg-white backdrop-blur-sm p-4 rounded-2xl border border-white transition flex items-center justify-between cursor-pointer shadow-sm shadow-emerald-900/5 text-left w-full group/mission"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover/mission:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4"/>
                       </div>
                       <div>
                          <div className="text-slate-800 font-bold text-sm">Baca 1 Misi Al-Qur'an</div>
                          <div className="text-amber-500 text-xs font-bold">+50 XP</div>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/mission:translate-x-1 transition-transform"/>
                 </button>

                 <button 
                    onClick={() => {
                        const nextAqidah = aqidahs.find(a => !completedTopics.includes(`aqidah-${a.id}`));
                        if (nextAqidah) window.location.href = `/akidah/${nextAqidah.id}`;
                    }}
                    className="flex-1 bg-white/60 hover:bg-white backdrop-blur-sm p-4 rounded-2xl border border-white transition flex items-center justify-between cursor-pointer shadow-sm shadow-emerald-900/5 text-left w-full group/mission"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover/mission:scale-110 transition-transform">
                          <Layers className="w-4 h-4"/>
                       </div>
                       <div>
                          <div className="text-slate-800 font-bold text-sm">Selesaikan 1 Kuis Akidah</div>
                          <div className="text-amber-500 text-xs font-bold">+150 XP</div>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/mission:translate-x-1 transition-transform"/>
                 </button>
            </div>
         </div>
      </section>

      {/* JOIN CLASS SECTION */}
      <JoinClass />

      {/* 3. QUEST MAP MENU BAR */}
      <h2 className="text-2xl font-black text-slate-800 text-center font-serif mt-12 mb-6">Jelajahi Peta Petualangan</h2>
      
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto sticky top-20 z-40">
         <button 
            onClick={() => setActiveTab('quran')}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${activeTab === 'quran' ? 'bg-emerald-50 border border-emerald-200 shadow-sm text-emerald-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
         >
            <BookOpen className={`w-5 h-5 mb-1.5 ${activeTab === 'quran' ? 'text-emerald-500' : ''}`}/>
            <span className="text-[10px] font-black uppercase tracking-widest">Al-Qur'an</span>
         </button>
         <button 
            onClick={() => setActiveTab('doa')}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${activeTab === 'doa' ? 'bg-blue-50 border border-blue-200 shadow-sm text-blue-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
         >
            <Book className={`w-5 h-5 mb-1.5 ${activeTab === 'doa' ? 'text-blue-500' : ''}`}/>
            <span className="text-[10px] font-black uppercase tracking-widest">Doa Harian</span>
         </button>
         <button 
            onClick={() => setActiveTab('akidah')}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${activeTab === 'akidah' ? 'bg-amber-50 border border-amber-200 shadow-sm text-amber-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
         >
            <Layers className={`w-5 h-5 mb-1.5 ${activeTab === 'akidah' ? 'text-amber-500' : ''}`}/>
            <span className="text-[10px] font-black uppercase tracking-widest">Akidah</span>
         </button>
      </div>

      {/* SEARCH BOX FOR PATHWAYS */}
      <div className="relative max-w-md mx-auto">
         <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
         <input 
            type="text" 
            placeholder={`Cari Misi ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3.5 w-full bg-white border-2 border-slate-100 rounded-2xl text-slate-600 font-bold focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
         />
      </div>

      {/* 4. PATHWAYS RENDERING */}
      <section className="py-8 pl-8 pr-4 overflow-hidden relative">
        <div className="absolute left-[3.25rem] top-12 bottom-12 w-1.5 bg-slate-100 rounded-full"></div>

        <div className="space-y-12 relative z-10 max-w-2xl mx-auto">
          {activeTab === 'quran' && filteredSurahs.map((surah) => {
            const isCompleted = completedTopics.includes(`quran-${surah.nomor}-1`);
            const originalIdx = surahs.findIndex(s => s.nomor === surah.nomor);
            const isLocked = originalIdx !== 0 && !completedTopics.includes(`quran-${surahs[originalIdx - 1].nomor}-1`);
            
            return (
            <div key={surah.nomor} className={`relative group ${isLocked ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
               <div className={`absolute -left-[32px] md:-left-[54px] top-1/2 -translate-y-1/2 w-10 md:w-16 h-10 md:h-16 bg-white rounded-full border-[3px] flex items-center justify-center font-black md:text-lg transition-all duration-500 shadow-sm z-20 ${
                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                  isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : 
                  'border-emerald-100 text-emerald-400 group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}>
                 {isLocked ? <Lock className="w-4 h-4 md:w-6 md:h-6" /> : (
                    isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-xs md:text-lg">{surah.nomor}</span>
                 )}
               </div>
               
               <Link to={`/surah/${surah.nomor}`} className={`block ml-6 md:ml-12 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-white shadow-sm transition-all duration-300 transform relative overflow-hidden ${
                  isLocked ? 'cursor-not-allowed' : 'hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-emerald-50/30'
               }`}>
                  {isCompleted && (
                    <div className="absolute top-6 right-6">
                       <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tuntas
                       </div>
                    </div>
                  )}

                  <div className="pr-16">
                     <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Misi Lisan • {surah.jumlahAyat} Ayah</div>
                     <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{surah.namaLatin}</h3>
                     <p className="text-slate-500 text-sm mb-4 line-clamp-2">{surah.arti}</p>
                     
                     <div className="flex flex-wrap gap-2">
                        {surah.nomor > 70 && (
                          <span className="px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                             Target Kls 7
                          </span>
                        )}
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 transition-colors ${
                           isLocked ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                        }`}>
                           {isLocked ? 'Terkunci' : isCompleted ? 'Buka Lagi' : 'Mainkan'} <ArrowRight className="w-3 h-3" />
                        </span>
                     </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-5 font-arabic text-8xl pointer-events-none group-hover:text-emerald-600 transition-colors duration-500">{surah.nama}</div>
               </Link>
            </div>
          )})}

          {activeTab === 'doa' && filteredDuas.map((doa) => {
            const isCompleted = completedTopics.includes(doa.id);
            const originalIdx = duas.findIndex(d => d.id === doa.id);
            const isLocked = originalIdx !== 0 && !completedTopics.includes(duas[originalIdx - 1].id);

            return (
            <div key={doa.id} className={`relative group ${isLocked ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
               <div className={`absolute -left-[32px] md:-left-[54px] top-1/2 -translate-y-1/2 w-10 md:w-16 h-10 md:h-16 bg-white rounded-full border-[3px] flex items-center justify-center transition-all duration-500 shadow-sm z-20 ${
                  isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 
                  isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : 
                  'border-blue-100 text-blue-400 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
               }`}>
                 {isLocked ? <Lock className="w-4 h-4 md:w-5 md:h-5" /> : (
                    isCompleted ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                 )}
               </div>
               
               <Link to={`/doa/${doa.id}`} className={`block ml-6 md:ml-12 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-white shadow-sm transition-all duration-300 transform relative overflow-hidden ${
                  isLocked ? 'cursor-not-allowed' : 'hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50/30'
               }`}>
                  {isCompleted && (
                    <div className="absolute top-6 right-6">
                       <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tuntas
                       </div>
                    </div>
                  )}

                  <div className="pr-12 md:pr-16">
                     <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Hafalan Kelas {doa.targetClass} • {doa.category}</div>
                     <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{doa.title}</h3>
                     <div className="mt-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center w-fit gap-1 transition-colors ${
                           isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                           {isLocked ? 'Terkunci' : 'Kupas Misi'} <ArrowRight className="w-3 h-3" />
                        </span>
                     </div>
                  </div>
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                      <Book className="w-32 h-32 text-blue-900" />
                  </div>
               </Link>
            </div>
          )})}

          {activeTab === 'akidah' && filteredAqidahs.map((akidah) => {
            const isCompleted = completedTopics.includes(`aqidah-${akidah.id}`);
            const originalIdx = aqidahs.findIndex(a => a.id === akidah.id);
            const isLocked = originalIdx !== 0 && !completedTopics.includes(`aqidah-${aqidahs[originalIdx - 1].id}`);

            return (
             <div key={akidah.id} className={`relative group ${isLocked ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
               <div className={`absolute -left-[32px] md:-left-[54px] top-1/2 -translate-y-1/2 w-10 md:w-16 h-10 md:h-16 bg-white rounded-full border-[3px] flex items-center justify-center font-black md:text-lg transition-all duration-500 shadow-sm z-20 ${
                  isCompleted ? 'bg-amber-500 border-amber-500 text-white' : 
                  isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : 
                  'border-amber-100 text-amber-400 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
               }`}>
                  {isLocked ? <Lock className="w-4 h-4 md:w-6 md:h-6" /> : (
                    isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span>{originalIdx + 1}</span>
                  )}
               </div>

               <Link to={`/akidah/${akidah.id}`} className={`block ml-6 md:ml-12 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-white shadow-sm transition-all duration-300 transform relative overflow-hidden ${
                  isLocked ? 'cursor-not-allowed' : 'hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-amber-50/20'
               }`}>
                  {isCompleted && (
                    <div className="absolute top-6 right-6">
                       <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tuntas
                       </div>
                    </div>
                  )}

                  <div className="pr-12 md:pr-16 relative z-10">
                     <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Bahan Bacaan & Kuis Ujian</div>
                     <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-amber-700 transition-colors">{akidah.title}</h3>
                     <p className="text-slate-500 text-sm mb-4 line-clamp-2">{akidah.description}</p>
                     
                     <div className="mt-4 flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                            {akidah.quiz.length} Tantangan Kuis
                          </span>
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 transition-colors shadow-md ${
                           isLocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white group-hover:bg-amber-500'
                        }`}>
                           {isLocked ? 'Terkunci' : 'Masuk'} <ArrowRight className="w-3 h-3" />
                        </span>
                     </div>
                  </div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-5 font-arabic text-7xl pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
                     <Layers className="w-40 h-40" />
                  </div>
               </Link>
             </div>
          )})}

          {((activeTab === 'quran' && filteredSurahs.length === 0) || 
            (activeTab === 'doa' && filteredDuas.length === 0) || 
            (activeTab === 'akidah' && filteredAqidahs.length === 0)) && (
             <div className="ml-12 text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                 <p className="text-slate-500 font-bold">Quest misi tidak ditemukan.</p>
             </div>
          )}
        </div>
      </section>

    </div>
  );
}
