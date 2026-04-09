import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Konfigurasi Supabase tidak lengkap di .env.local");
}

/**
 * Client Supabase dengan Integrasi Clerk JWT.
 * Membuat instance baru setiap dipanggil, komponen harus membungkusnya dengan useMemo.
 * Menggunakan custom fetch untuk menyuntikkan token dari Clerk secara dinamis.
 */
export const createClerkSupabaseClient = (clerkGetToken: any) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Penting: Clerk yang mengelola sesi, bukan Supabase
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        try {
          const token = await clerkGetToken({ template: 'supabase' });

          const headers = new Headers(options?.headers);
          headers.set('apikey', supabaseAnonKey);
          
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }

          return fetch(url, { ...options, headers });
        } catch (error) {
          console.error("❌ Terjadi kesalahan saat mengambil JWT dari Clerk:", error);
          throw new Error("Sesi tidak valid atau telah berakhir. Harap muat ulang halaman.");
        }
      },
    },
  });
};
