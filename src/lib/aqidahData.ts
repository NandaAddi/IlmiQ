export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface AqidahChapter {
  id: string;
  title: string;
  targetClass: 7 | 8 | 9;
  description: string;
  content: string; // Markdown / HTML string 
  quiz: QuizQuestion[];
}

export const aqidahList: AqidahChapter[] = [
  {
    id: "rukun-iman",
    title: "Memahami 6 Rukun Iman",
    targetClass: 7,
    description: "Fondasi dasar keimanan seorang Muslim kepada Allah, Malaikat, Kitab, Rasul, Hari Kiamat dan Qada Qadar.",
    content: `Rukun Iman adalah pilar keimanan yang harus diyakini oleh setiap muslim. Terdiri dari 6 pilar utama:
1. **Iman Kepada Allah**: Meyakini tiada tuhan selain Allah.
2. **Iman Kepada Malaikat**: Meyakini keberadaan makhluk gaib ciptaan Allah dari cahaya.
3. **Iman Kepada Kitab-Kitab Allah**: Meyakini ajaran yang diturunkan melalui wahyu (Taurat, Zabur, Injil, Al-Qur'an).
4. **Iman Kepada Rasul-Rasul Allah**: Meyakini para utusan pembawa peringatan dan kabar gembira.
5. **Iman Kepada Hari Kiamat**: Meyakini kehancuran alam semesta dan hari pembalasan.
6. **Iman Kepada Qada dan Qadar**: Meyakini takdir baik dan buruk berasal dari Allah.`,
    quiz: [
      {
        question: "Berapakah jumlah Rukun Iman yang wajib diyakini oleh seorang Muslim?",
        options: ["4", "5", "6", "10"],
        correctAnswerIndex: 2
      },
      {
        question: "Iman kepada kitab-kitab Allah merupakan Rukun Iman yang ke?",
        options: ["Satu", "Dua", "Tiga", "Empat"],
        correctAnswerIndex: 2
      },
       {
        question: "Meyakini bahwa segala sesuatu yang terjadi di dunia ini sudah ditetapkan oleh Allah Swt disebut iman kepada?",
        options: ["Malaikat", "Rasul", "Hari Penimbangan", "Qada dan Qadar"],
        correctAnswerIndex: 3
      }
    ]
  },
  {
    id: "sifat-wajib-allah",
    title: "Sifat Wajib Bagi Allah Swt",
    targetClass: 8,
    description: "Mengenal sifat-sifat kesempurnaan yang wajib melekat pada dzat Allah.",
    content: `Allah Swt memiliki 20 sifat wajib yang sempurna. Beberapa di antaranya:
- **Wujud** (Ada): Sebagaimana adanya alam semesta bukti adanya Pencipta.
- **Qidam** (Terdahulu): Allah tidak berawal.
- **Baqa** (Kekal): Allah tidak berakhir/binasa.
- **Mukhalafatuhu lil hawadits** (Berbeda dengan makhluk).
- **Qiyamuhu binafsihi** (Berdiri Sendiri).
- **Wahdaniyah** (Maha Esa).
- **Qudrat** (Maha Kuasa).
- **Iradat** (Berkehendak).`,
    quiz: [
      {
        question: "Salah satu sifat wajib bagi Allah adalah 'Wujud', yang artinya?",
        options: ["Terdahulu", "Kekal", "Ada", "Berkuasa"],
        correctAnswerIndex: 2
      },
      {
        question: "Sifat 'Wahdaniyah' bermakna bahwa Allah itu?",
        options: ["Berdiri Sendiri", "Maha Esa / Tunggal", "Berbeda dengan makhluk", "Kekal"],
        correctAnswerIndex: 1
      }
    ]
  }
];

export const getAqidahList = () => {
    return aqidahList;
}

export const getAqidahDetail = (id: string) => {
    return aqidahList.find(a => a.id === id) || null;
}
