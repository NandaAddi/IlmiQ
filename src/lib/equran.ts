// Base URL untuk eQuran.id API v2
const API_BASE_URL = 'https://equran.id/api/v2';

export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends Surah {
  ayat: Ayah[];
  suratSelanjutnya: boolean | object;
  suratSebelumnya: boolean | object;
}

/**
 * Fetch daftar seluruh surah (114 Surah)
 */
export async function getSurahList(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/surat`);
    if (!response.ok) throw new Error('Gagal memuat daftar Surah');
    const resData = await response.json();
    return resData.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetch detail satu surah beserta seluruh ayatnya
 * @param nomor Nomor surah (1 - 114)
 */
export async function getSurahDetail(nomor: number | string): Promise<SurahDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/surat/${nomor}`);
    if (!response.ok) throw new Error(`Gagal memuat detail Surah ${nomor}`);
    const resData = await response.json();
    return resData.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
