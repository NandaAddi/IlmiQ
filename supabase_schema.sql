-- =========================================================================================
-- DATABASE SCHEMA ILMIQ - FIXED VERSION
-- Jalankan kode ini di fitur "SQL Editor" pada proyek Supabase Anda.
-- =========================================================================================

-- Enable UUID extension (untuk class id, dsb)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Tabel Users (Menyimpan profil tersinkronisasi dari Clerk)
CREATE TABLE IF NOT EXISTS public.users (
  -- id di set sebagai TEXT karena kita akan menggunakan clerk_id ("user_2xxxxxx")
  id TEXT PRIMARY KEY, 
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2) Tabel Kelas (Dibuat oleh Guru)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- Contoh: KELAS-VII-A
  name TEXT NOT NULL,
  teacher_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3) Tabel Anggota Kelas (Relasi Siswa & Kelas)
CREATE TABLE IF NOT EXISTS public.class_members (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (class_id, student_id)
);

-- 4) Tabel Progress/Motivasi Harian Siswa
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  total_ayah_memorized INTEGER DEFAULT 0
);

-- 5) Tabel Kartu Hafalan (Spaced Repetition / Algoritma SM-2)
CREATE TABLE IF NOT EXISTS public.memorization_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  ayah_start INTEGER NOT NULL,
  ayah_end INTEGER NOT NULL,
  repetition_count INTEGER DEFAULT 0,
  ease_factor NUMERIC(3, 2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_ayah UNIQUE (user_id, surah_number, ayah_start, ayah_end)
);

-- =========================================================================================
-- B. MENGAKTIFKAN ROW LEVEL SECURITY (RLS)
-- =========================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- RLS: TABEL USERS 
--
-- Siswa / User bisa membaca datanya sendiri
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING ( (auth.jwt() ->> 'sub') = id );

-- Semua orang bisa melihat profil (untuk leaderboard/dashboard)
CREATE POLICY "Anyone can view profiles" 
ON public.users FOR SELECT 
USING ( true );

-- Bypass untuk sync (upsert)
CREATE POLICY "Users can update own profile" 
ON public.users FOR ALL
USING ( (auth.jwt() ->> 'sub') = id );

--
-- RLS: TABEL KELAS
--
CREATE POLICY "Guru bisa kelola kelasnya sendiri" 
ON public.classes FOR ALL
USING ( (auth.jwt() ->> 'sub') = teacher_id );

CREATE POLICY "Semua orang bisa melihat kelas" 
ON public.classes FOR SELECT 
USING ( true );

--
-- RLS: CLASS MEMBERS
--
CREATE POLICY "Users can join classes"
ON public.class_members FOR INSERT
WITH CHECK ( (auth.jwt() ->> 'sub') = student_id );

CREATE POLICY "Users can view their class memberships"
ON public.class_members FOR SELECT
USING ( (auth.jwt() ->> 'sub') = student_id OR EXISTS (
  SELECT 1 FROM public.classes WHERE id = class_members.class_id AND teacher_id = (auth.jwt() ->> 'sub')
));

--
-- RLS: USER PROGRESS
--
CREATE POLICY "Users can manage own progress"
ON public.user_progress FOR ALL
USING ( (auth.jwt() ->> 'sub') = user_id );

CREATE POLICY "Teachers can view student progress"
ON public.user_progress FOR SELECT
USING ( true ); -- Sederhananya dibolehkan untuk semua (untuk leaderboard)

--
-- RLS: KARTU HAFALAN (Memorization Cards)
--
CREATE POLICY "Siswa atur kartu hafalan sendiri" 
ON public.memorization_cards FOR ALL
USING ( (auth.jwt() ->> 'sub') = user_id );

CREATE POLICY "Guru dapat membaca kartu hafalan anak muridnya"
ON public.memorization_cards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    WHERE cm.student_id = memorization_cards.user_id
    AND c.teacher_id = (auth.jwt() ->> 'sub')
  )
);

-- =========================================================================================
-- 6) Tabel Nilai Kuis Kognitif (Akidah / Doa)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_topic UNIQUE (user_id, topic_name)
);

ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Siswa atur hasil kuis sendiri" 
ON public.quiz_scores FOR ALL
USING ( (auth.jwt() ->> 'sub') = user_id );

CREATE POLICY "Guru dapat melihat hasil kuis anak muridnya"
ON public.quiz_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    WHERE cm.student_id = quiz_scores.user_id
    AND c.teacher_id = (auth.jwt() ->> 'sub')
  )
);

-- =========================================================================================
-- 7) Fungsi (RPC) untuk update XP secara Atomic
-- =========================================================================================
CREATE OR REPLACE FUNCTION increment_xp(p_user_id TEXT, p_xp INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE user_progress 
  SET total_xp = total_xp + p_xp, last_activity = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
