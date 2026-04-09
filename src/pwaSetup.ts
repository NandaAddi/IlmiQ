/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register';

// Mendaftarkan Service Worker dan Cache
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Update IlmiQ versi terbaru tersedia.');
    // Di produksi, biasanya kita memunculkan pop-up "Muat Ulang Halaman" di sini
  },
  onOfflineReady() {
    console.log('Aplikasi IlmiQ ini telah sukses masuk ke mode Offline! Aset dan Al-Qur\'an telah di-cache.');
  },
});

export default updateSW;
