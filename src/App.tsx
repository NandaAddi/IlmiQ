import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SurahRead from './pages/SurahRead';
import DuaRead from './pages/DuaRead';
import AqidahChapter from './pages/AqidahChapter';
import TeacherDashboard from './pages/TeacherDashboard';
import { ProgressProvider, useProgress } from './contexts/ProgressContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Preloader from './components/common/Preloader';

/**
 * Komponen UserSync: Memastikan ID Clerk Anda terdaftar di Database Supabase.
 * Tanpa ini, Anda tidak bisa membuat kelas karena aturan "Foreign Key".
 */
function UserSync({ onRoleSet }: { onRoleSet: (role: string) => void }) {
  const { user } = useUser();
  const { supabase } = useProgress();

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      if (user && supabase) {
        try {
          
          // 1. Cek apakah user sudah ada dan apa role-nya
          const { data: existingUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          const currentRole = existingUser?.role || 'student';

          // 2. Sinkronisasi data dasar
          const { error } = await supabase.from('users').upsert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName || user.username || 'User IlmiQ',
            avatar_url: user.imageUrl,
            role: currentRole // Gunakan role yang sudah ada
          }, { onConflict: 'id' });

          if (!error && !cancelled) {
            onRoleSet(currentRole);
            // Pastikan baris progress ada
            await supabase.from('user_progress').upsert({
              user_id: user.id,
              total_xp: 0,
              current_streak: 0
            }, { onConflict: 'user_id' });
          }
        } catch (e) {
          console.error("Terjadi error saat sinkronisasi:", e);
        }
      }
    }
    sync();
    return () => {
      cancelled = true;
    };
  }, [user, supabase]); // Dikeluarkan onRoleSet dari dependencies untuk menghindari re-render

  return null;
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default function App() {
  const [userRole, setUserRole] = useState<string>('student');

  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="p-8 bg-white rounded-xl border border-red-200 shadow-sm max-w-lg text-center">
          <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Kunci API Clerk Hilang!</h2>
          <p className="text-slate-600">Pastikan `VITE_CLERK_PUBLISHABLE_KEY` ada di file `.env.local`.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ErrorBoundary>
        <Preloader />
        <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0">
          <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="font-black text-2xl text-emerald-600 flex items-center gap-2 tracking-tight">
                 <BookOpen className="w-7 h-7" /> IlmiQ
              </Link>
              <div className="flex items-center gap-5">
                <SignedIn>
                  {(userRole === 'teacher' || userRole === 'admin') && (
                    <Link to="/teacher" className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-wider">
                       Guru
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                   <Link to="/" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition">Login</Link>
                </SignedOut>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <SignedOut>
               <div className="flex flex-col items-center justify-center mt-12 animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-8 text-center max-w-md">
                     <h1 className="text-3xl font-black text-slate-800 mb-3">Selamat Datang di IlmiQ</h1>
                     <p className="text-slate-500">Silakan login untuk menyimpan riwayat hafalan dan XP Supabase Anda.</p>
                  </div>
                  <SignIn />
               </div>
            </SignedOut>
            
            <SignedIn>
              <ProgressProvider>
                <UserSync onRoleSet={setUserRole} />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/surah/:nomor" element={<SurahRead />} />
                  <Route path="/doa/:id" element={<DuaRead />} />
                  <Route path="/akidah/:id" element={<AqidahChapter />} />
                  <Route path="/teacher" element={(userRole === 'teacher' || userRole === 'admin') ? <TeacherDashboard /> : <Navigate to="/" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProgressProvider>
            </SignedIn>
          </main>
        </div>
      </BrowserRouter>
      </ErrorBoundary>
    </ClerkProvider>
  );
}
