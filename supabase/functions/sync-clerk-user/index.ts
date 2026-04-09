import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

// Konfigurasi Environment Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Fungsi akan berjalan merespons HTTP POST dari Clerk Webhooks
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // PENTING: Untuk Production, pastikan untuk memvalidasi header "svix-signature" 
  // menggunakan library "svix" (https://docs.clerk.com/webhooks/verify-signatures).
  
  try {
    const payload = await req.json();
    
    // Mengecek apakah tipe event adalah "Pembuatan User Baru"
    if (payload.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, public_metadata } = payload.data;
      
      // Mengambil Email Utama
      const primaryEmail = email_addresses?.find(
        (e: any) => e.id === payload.data.primary_email_address_id
      )?.email_address || email_addresses[0]?.email_address || '';
      
      // Menyiapkan Admin Supabase Client (bypassing RLS)
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Tentukan peran pengguna. Default adalah "student"
      const userRole = public_metadata?.role || 'student';
      
      // Eksekusi insert profile ke tabel "users" milik public schema PWA kita
      const { error } = await supabase.from('users').insert({
        id: id,            -- ID dari sistem Clerk (cth: "user_2aXy...")
        email: primaryEmail,
        first_name: first_name || '',
        last_name: last_name || '',
        role: userRole,
        xp_total: 0,
        level: 1
      });

      if (error) {
        console.error('Kesalahan Insert ke Supabase:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log(`Sukses Sinkronisasi User [${id}] ke Supabase.`);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: 'Abaikan tipe event ini.' }), { status: 200 });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Bad Request' }), { status: 400 });
  }
});
