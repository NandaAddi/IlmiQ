export interface DuaDetail {
  id: string;
  category: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  targetClass: 7 | 8 | 9;
  numericId: number;
}


export const duaList: DuaDetail[] = [
  {
    id: "doa-belajar",
    category: "Harian",
    title: "Doa Sebelum Belajar",
    arabic: "رَضِتُ بِاللهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا وَرَسُولًا رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا",
    latin: "Radhitu billahi rabba wabil islami dina wabi muhammadin nabiyya warasula. Rabbi zidni 'ilman warzuqni fahman.",
    translation: "Kami ridho Allah Swt sebagai Tuhanku, Islam sebagai agamaku, dan Nabi Muhammad sebagai Nabi dan Rasul. Ya Allah, tambahkanlah kepadaku ilmu dan berikanlah aku pengertian yang baik.",
    targetClass: 7,
    numericId: 1
  },
  {
    id: "doa-tidur",
    category: "Harian",
    title: "Doa Sebelum Tidur",
    arabic: "بِاسْمِكَ اللّٰهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
    latin: "Bismika allahumma ahya wa bismika amut.",
    translation: "Dengan nama-Mu ya Allah aku hidup, dan dengan nama-Mu aku mati.",
    targetClass: 7,
    numericId: 2
  },
  {
    id: "doa-makan",
    category: "Harian",
    title: "Doa Sebelum Makan",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    latin: "Allahumma barik lana fima razaqtana waqina 'adzaban-nar.",
    translation: "Ya Allah, berkahilah kami atas rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka.",
    targetClass: 7,
    numericId: 3
  },
  {
    id: "doa-ortu",
    category: "Keluarga",
    title: "Doa Untuk Kedua Orang Tua",
    arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    latin: "Rabbighfir li, wa li walidayya, warham huma kama rabbayani shaghira.",
    translation: "Ya Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku. Sayangilah keduanya sebagaimana keduanya menyayangiku di waktu kecil.",
    targetClass: 8,
    numericId: 4
  },
  {
    id: "doa-kebaikan-dunia-akhirat",
    category: "Umum",
    title: "Doa Kebaikan Dunia Akhirat (Sapu Jagat)",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    latin: "Rabbana atina fid-dunya hasanah wa fil 'akhirati hasanah wa qina 'adzaban-nar.",
    translation: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.",
    targetClass: 9,
    numericId: 5
  }
];

export const getDuaList = () => {
    return duaList;
}

export const getDuaDetail = (id: string) => {
    return duaList.find(d => d.id === id) || null;
}
