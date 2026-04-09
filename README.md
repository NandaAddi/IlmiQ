# 🌟 IlmiQ - PAI Learning Adventure

IlmiQ adalah platform pembelajaran Pendidikan Agama Islam (PAI) berbasis gamifikasi yang dirancang untuk membantu siswa SMP memahami Al-Qur'an, Doa Harian, dan Akidah dengan cara yang seru dan berkelanjutan.

## ✨ Fitur Utama

- **🚀 Gamified Pathways:** Peta petualangan belajar yang interaktif untuk Al-Qur'an, Doa, dan Akidah.
- **🧠 Spaced Repetition (SM-2):** Algoritma pintar untuk menghitung jadwal muraja'ah (hafalan) yang optimal bagi siswa.
- **🎙️ AI Ayah Evaluator:** Penilaian hafalan otomatis menggunakan Web Speech API untuk mendeteksi akurasi bacaan.
- **👨‍🏫 Teacher Dashboard:** Portal khusus guru untuk memantau progres, statistik XP, dan stabilitas hafalan murid secara real-time.
- **⚡ Atomic Progress:** Sistem reward XP dan Streak yang aman dan terintegrasi dengan Supabase.
- **🛡️ Global Resilience:** Dilengkapi dengan Error Boundary untuk stabilitas aplikasi yang maksimal.

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Auth:** Clerk Authentication
- **Backend/Database:** Supabase (PostgreSQL)
- **Gamification Logic:** Custom Service Layer for XP & Streaks

## 🚀 Persiapan Pengembangan

1. **Clone Repository:**
   ```bash
   git clone https://github.com/username/ilmiq.git
   cd ilmiq
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Buat file `.env` di root direktori:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

5. **Build Produksi:**
   ```bash
   npm run build
   ```

## 🔐 Keamanan & Audit

Proyek ini telah melalui audit teknis menyeluruh mencakup:
- Proteksi Route Guru (RBAC).
- Validasi data sisi server (RPC).
- Penanganan kebocoran instance Supabase client.
- Sinkronisasi status pembelajaran global.

---
Dikembangkan dengan ❤️ untuk kemajuan pendidikan Islam.
