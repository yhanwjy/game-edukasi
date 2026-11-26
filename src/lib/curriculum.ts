import type { EducationLevel } from "@/types/student";
import { ALPHABET_AZ, CONSONANTS_BZ } from "@/lib/az-curriculum";

export interface QuizQuestion {
  prompt: string;
  speakQuestion: string;
  hint: string;
  options: string[];
  answer: string;
}

export interface LessonCard {
  id: string;
  symbol: string;
  breakdown?: string;
  exampleWord: string;
  emoji: string;
  tip: string;
  speakLesson: string;
}

export interface TileGameRound {
  id: string;
  clue: string;
  emoji: string;
  speakClue: string;
  targetTiles: string[];
  distractorTiles: string[];
}

export interface PairMatchItem {
  id: string;
  left: string;
  right: string;
}

export interface ReadingStage {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  description: string;
  recommendedFor: EducationLevel[];
  lessons: LessonCard[];
  gameRounds: TileGameRound[];
  questions: QuizQuestion[];
}

export interface WritingStage {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  description: string;
  recommendedFor: EducationLevel[];
  targets: Array<{
    text: string;
    speakPrompt: string;
    hint: string;
  }>;
}

export interface MathStage {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  description: string;
  recommendedFor: EducationLevel[];
  lessons: LessonCard[];
  pairGames: PairMatchItem[];
  questions: QuizQuestion[];
}

export interface LogicStage {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  description: string;
  recommendedFor: EducationLevel[];
  lessons: LessonCard[];
  pairGames: PairMatchItem[];
  questions: QuizQuestion[];
}

export const READING_STAGES: ReadingStage[] = [
  {
    id: "read-1-vokal",
    levelNumber: 1,
    title: "Level 1: Fokus Vokal A & Kenal Huruf A–Z",
    badge: "A & A–Z",
    description: "Mulai dari huruf A dulu, lalu mengenal lengkap 26 huruf A sampai Z.",
    recommendedFor: ["TK"],
    lessons: [
      {
        id: "v-a",
        symbol: "A  a",
        breakdown: "Langkah 1: Kenali Vokal A lebih dulu!",
        exampleWord: "Apel",
        emoji: "🍎",
        tip: "Sebelum ke I-U-E-O, kuasai huruf A dan gabungannya (BA–ZA)",
        speakLesson: "Ini huruf A. Dibaca a, seperti pada kata Apel. Kita akan fokus belajar A dulu sebelum ke vokal lainnya.",
      },
    ],
    gameRounds: [
      {
        id: "rg-v1",
        clue: "Susun 2 huruf awal: A lalu B",
        emoji: "🍎⚽",
        speakClue: "Susun huruf vokal pertama A, lalu huruf konsonan pertama B.",
        targetTiles: ["A", "B"],
        distractorTiles: ["C", "Z"],
      },
      {
        id: "rg-v2",
        clue: "Review A & huruf akhir: A lalu Z",
        emoji: "🍎🦓",
        speakClue: "Susun huruf paling awal A lalu huruf paling akhir Z.",
        targetTiles: ["A", "Z"],
        distractorTiles: ["B", "M"],
      },
    ],
    questions: [
      {
        prompt: "🍎 Buah manis berwarna merah. Huruf vokal apakah di paling depan?",
        speakQuestion:
          "Aku buah manis berwarna merah. Huruf vokal apakah di paling depan namaku?",
        hint: "Mulut terbuka lebar: A...",
        options: ["A", "B", "C", "Z"],
        answer: "A",
      },
      {
        prompt: "🦓 Hewan belang hitam putih di akhir abjad (Zebra) diawali huruf...",
        speakQuestion:
          "Hewan belang hitam putih yang namanya di paling akhir abjad adalah Zebra. Huruf depannya apa?",
        hint: "Huruf ke-26 paling akhir",
        options: ["A", "M", "S", "Z"],
        answer: "Z",
      },
      {
        prompt: "⚽ Aku bulat dan sering ditendang (Bola). Huruf depanku setelah A adalah...",
        speakQuestion:
          "Aku benda bulat bernama Bola. Huruf apakah di paling depan namaku?",
        hint: "Huruf kedua dalam abjad",
        options: ["A", "B", "C", "D"],
        answer: "B",
      },
    ],
  },
  {
    id: "read-2-vokal-a",
    levelNumber: 2,
    title: "Level 2: Fokus Vokal A (A, BA sampai ZA + Review)",
    badge: "A, BA–ZA",
    description: "Belajar A, BA, CA, DA ... sampai ZA. Setiap naik huruf, materi lama ikut diulang!",
    recommendedFor: ["TK"],
    lessons: [],
    gameRounds: [
      {
        id: "rg-a1",
        clue: "Rangkai kata awal: ba + ca",
        emoji: "📖",
        speakClue: "Susun dua suku kata vokal A menjadi kata baca!",
        targetTiles: ["ba", "ca"],
        distractorTiles: ["da", "a"],
      },
    ],
    questions: [
      {
        prompt: "📖 Jika B+A = BA, dan C+A = CA, gabungan BA dan CA dibaca...",
        speakQuestion:
          "Jika ba digabung dengan ca, menjadi kata apa?",
        hint: "Kegiatan melihat tulisan di buku",
        options: ["baca", "dada", "kaca", "mama"],
        answer: "baca",
      },
    ],
  },
  {
    id: "read-3-vokal-lain",
    levelNumber: 3,
    title: "Level 3: Naik Vokal I, U, E, O (BI–ZI s/d BO–ZO)",
    badge: "I · U · E · O",
    description: "Setelah lancar vokal A (BA–ZA), naik ke I, U, E, O lengkap B–Z + review vokal sebelumnya!",
    recommendedFor: ["TK", "SD"],
    lessons: [],
    gameRounds: [
      {
        id: "rg-io1",
        clue: "Gabung vokal A & I: ba + bi",
        emoji: "🗣️",
        speakClue: "Gabungkan suku kata vokal A dan vokal I: ba lalu bi.",
        targetTiles: ["ba", "bi"],
        distractorTiles: ["bu", "bo"],
      },
      {
        id: "rg-io2",
        clue: "Gabung vokal U: bu + ku",
        emoji: "📚",
        speakClue: "Susun kata benda untuk dibaca menggunakan vokal U: bu lalu ku.",
        targetTiles: ["bu", "ku"],
        distractorTiles: ["ba", "ko"],
      },
    ],
    questions: [
      {
        prompt: "📚 Kumpulan kertas berisi cerita memakai vokal U: '... - ku'",
        speakQuestion:
          "Lengkapi suku kata dengan vokal U di depan kata benda untuk membaca, titik-titik ku.",
        hint: "B ditambah U",
        options: ["ba", "bi", "bu", "bo"],
        answer: "bu",
      },
      {
        prompt: "🔁 Review Vokal A + I: Pakaian berwarna biru memakai suku kata...",
        speakQuestion:
          "Soal review! Kata biru diawali suku kata dari B dan I, yaitu?",
        hint: "B ditambah I",
        options: ["ba", "bi", "be", "bo"],
        answer: "bi",
      },
      {
        prompt: "⚽ Benda bulat untuk bermain memakai vokal O: '... - la'",
        speakQuestion:
          "Benda bulat untuk bermain sepak bola, lengkapi suku kata vokal O di depannya!",
        hint: "B ditambah O",
        options: ["ba", "bi", "bu", "bo"],
        answer: "bo",
      },
    ],
  },
  {
    id: "read-4-huruf-depan",
    levelNumber: 4,
    title: "Level 4: Vokal Depan Lengkap (ab–az s/d ob–oz)",
    badge: "ab–az · ad–od",
    description: "Semua pola vokal di depan konsonan B sampai Z (termasuk ad id ud ed od).",
    recommendedFor: ["TK", "SD"],
    lessons: [],
    gameRounds: [
      {
        id: "rg-hd1",
        clue: "Rangkai kata saudara muda: ad + ik",
        emoji: "👶",
        speakClue: "Rangkai kata saudara kandung yang lebih muda: ad lalu ik.",
        targetTiles: ["ad", "ik"],
        distractorTiles: ["ud", "ang"],
      },
      {
        id: "rg-hd2",
        clue: "Rangkai hewan laut berkumis: ud + ang",
        emoji: "🦐",
        speakClue: "Susun nama hewan laut yang enak dimasak: ud lalu ang.",
        targetTiles: ["ud", "ang"],
        distractorTiles: ["id", "ol"],
      },
    ],
    questions: [
      {
        prompt: "👶 Saudara yang lebih muda dari kita disebut '... - ik'",
        speakQuestion:
          "Saudara yang usianya lebih muda dari kita. Suku kata vokal di depannya apa?",
        hint: "Bunyi a diikuti huruf d",
        options: ["ad", "id", "ud", "od"],
        answer: "ad",
      },
      {
        prompt: "🦐 Hewan air berkumis dan lezat adalah '... - ang'",
        speakQuestion:
          "Hewan berkumis yang hidup di air. Suku kata dua huruf di depannya adalah?",
        hint: "Bunyi u diikuti huruf d",
        options: ["ad", "id", "ud", "ed"],
        answer: "ud",
      },
      {
        prompt: "🔁 Review Vokal A: Kata 'ad-ik' jika digabung dengan kata 'sa-ya' berarti?",
        speakQuestion:
          "Review materi sebelumnya! Jika ada kata adik dan saya, artinya adik milik siapa?",
        hint: "Saya = aku",
        options: ["Adik saya", "Buku saya", "Bola saya", "Ibu saya"],
        answer: "Adik saya",
      },
      {
        prompt: "🕌 Hari raya umat Islam adalah '... - ul fitri'",
        speakQuestion: "Lengkapi awal kata hari raya umat Islam, titik-titik ul fitri.",
        hint: "Bunyi i diikuti d",
        options: ["ad", "id", "ud", "od"],
        answer: "id",
      },
      {
        prompt: "🌀 Gerakan berputar atau surat selebaran disebut '... - ar'",
        speakQuestion: "Lengkapi kata titik-titik ar dengan huruf vokal depan.",
        hint: "Bunyi e diikuti d",
        options: ["ad", "ed", "id", "od"],
        answer: "ed",
      },
      {
        prompt: "🪥 Pasta gigi untuk menyikat gigi sering disebut '... - ol'",
        speakQuestion: "Benda untuk menggosok gigi agar bersih, suku kata depannya?",
        hint: "Bunyi o diikuti d",
        options: ["ad", "id", "ed", "od"],
        answer: "od",
      },
      {
        prompt: "☁️ Ruang di atas bumi tempat awan melayang disebut '... - ara'",
        speakQuestion: "Lengkapi kata tempat awan dan burung terbang: titik-titik ara.",
        hint: "u diikuti d",
        options: ["ad", "id", "ud", "od"],
        answer: "ud",
      },
      {
        prompt: "👦 Anak laki-laki pemberani bernama '... - i' atau '... - am'",
        speakQuestion: "Lengkapi nama yang diawali huruf a dan m: titik-titik am.",
        hint: "a diikuti m",
        options: ["am", "im", "um", "om"],
        answer: "am",
      },
    ],
  },
  {
    id: "read-5-tiga-huruf",
    levelNumber: 5,
    title: "Level 5: Pola 3 Huruf Lengkap (Semua Depan B–Z × Akhir b–z)",
    badge: "3 Huruf A–Z",
    description: "Lengkap semua huruf depan B–Z dan akhiran b–z (bab–baz, cab–caz, dab–daz ... zab–zaz)!",
    recommendedFor: ["TK", "SD"],
    lessons: [],
    gameRounds: [
      {
        id: "rg-3h1",
        clue: "Susun kata 3 huruf berawalan C: 'c' 'a' 't'",
        emoji: "🎨",
        speakClue: "Susun tiga huruf berawalan C untuk mewarnai dinding: cat.",
        targetTiles: ["c", "a", "t"],
        distractorTiles: ["b", "o"],
      },
      {
        id: "rg-3h2",
        clue: "Susun kata 3 huruf berawalan J: 'j' 'a' 'm'",
        emoji: "⏰",
        speakClue: "Susun tiga huruf berawalan J penunjuk waktu: jam.",
        targetTiles: ["j", "a", "m"],
        distractorTiles: ["t", "s"],
      },
      {
        id: "rg-3h3",
        clue: "Review + 3 huruf: 't' 'a' 's'",
        emoji: "🎒",
        speakClue: "Susun tiga huruf tempat membawa buku sekolah: tas.",
        targetTiles: ["t", "a", "s"],
        distractorTiles: ["b", "e"],
      },
    ],
    questions: [
      {
        prompt: "⏰ Benda 3 huruf berawalan J untuk melihat waktu adalah...",
        speakQuestion:
          "Benda tiga huruf yang diawali huruf J dan dipakai di tangan atau dinding untuk melihat waktu adalah?",
        hint: "J - A - M",
        options: ["jam", "jem", "jom", "jas"],
        answer: "jam",
      },
      {
        prompt: "🎨 Cairan 3 huruf berawalan C untuk mewarnai tembok adalah...",
        speakQuestion:
          "Benda tiga huruf berawalan huruf C yang digunakan untuk mewarnai dinding adalah?",
        hint: "C - A - T",
        options: ["cat", "cet", "cit", "cot"],
        answer: "cat",
      },
      {
        prompt: "⛽ Bahan bakar kendaraan 3 huruf berawalan G adalah...",
        speakQuestion:
          "Kata tiga huruf berawalan G yang sering dipakai untuk memasak di dapur adalah?",
        hint: "G - A - S",
        options: ["gas", "gos", "gis", "gus"],
        answer: "gas",
      },
      {
        prompt: "🔁 Review B-A-D + 2 huruf: Tubuh manusia disebut '... - an'",
        speakQuestion:
          "Review materi sebelumnya! Bagian tubuh kita disebut titik-titik an. Pilih tiga huruf di depannya.",
        hint: "B - A - D",
        options: ["bad", "bed", "bid", "bod"],
        answer: "bad",
      },
      {
        prompt: "🎒 Tempat menyimpan buku ke sekolah adalah...",
        speakQuestion: "Benda tiga huruf yang digendong ke sekolah berisi buku adalah?",
        hint: "T - A - S",
        options: ["tas", "tes", "tis", "tos"],
        answer: "tas",
      },
      {
        prompt: "⚽ Benda bulat masuk ke gawang disebut...",
        speakQuestion: "Jika bola berhasil masuk ke gawang, wasit berteriak kata tiga huruf apa?",
        hint: "G - O - L",
        options: ["gol", "gal", "gil", "gul"],
        answer: "gol",
      },
      {
        prompt: "🪑 Alas kaki di depan pintu rumah disebut...",
        speakQuestion: "Alas kaki untuk membersihkan sepatu sebelum masuk rumah berawalan huruf K dan berakhir T adalah?",
        hint: "ka - set",
        options: ["set", "sat", "sit", "sot"],
        answer: "set",
      },
      {
        prompt: "🩺 Tenaga kesehatan penolong ibu melahirkan disebut '... - an'",
        speakQuestion: "Tenaga kesehatan di puskesmas yang menolong ibu melahirkan, 3 huruf depannya adalah?",
        hint: "B - I - D",
        options: ["bad", "bed", "bid", "bod"],
        answer: "bid",
      },
    ],
  },
  {
    id: "read-6-sambung",
    levelNumber: 6,
    title: "Level 6: Huruf Sambung ng & ny",
    badge: "ng & ny",
    description: "Mengenal bunyi gabungan konsonan ng, ny, sy, dan kh.",
    recommendedFor: ["TK", "SD"],
    lessons: [
      {
        id: "hs-ng",
        symbol: "ng",
        breakdown: "n + g = ng (nga, ngi, ngu)",
        exampleWord: "bu-nga",
        emoji: "🌸",
        tip: "Bunyi sengau di hidung: ngggg",
        speakLesson: "N dan G digabung berbunyi eng, seperti pada kata bu-nga.",
      },
      {
        id: "hs-ny",
        symbol: "ny",
        breakdown: "n + y = ny (nya, nyi, nyu)",
        exampleWord: "nya-nyi",
        emoji: "🎤",
        tip: "Bunyi lembut ny seperti pada nyanyi",
        speakLesson: "N dan Y digabung berbunyi eny, seperti pada kata nya-nyi.",
      },
      {
        id: "hs-singa",
        symbol: "si-nga",
        breakdown: "si + ng + a = si-nga",
        exampleWord: "si-nga",
        emoji: "🦁",
        tip: "Pisahkan si dan nga dengan jelas",
        speakLesson: "Kata si-nga memakai huruf sambung N G A.",
      },
    ],
    gameRounds: [
      {
        id: "rg-hs1",
        clue: "Rangkai kata tumbuhan indah: bu + nga",
        emoji: "🌸",
        speakClue: "Rangkai dua suku kata menjadi nama tumbuhan harum di taman!",
        targetTiles: ["bu", "nga"],
        distractorTiles: ["nya", "si"],
      },
      {
        id: "rg-hs2",
        clue: "Rangkai kata kegiatan melantunkan lagu: nya + nyi",
        emoji: "🎤",
        speakClue: "Susun kata kegiatan bersuara merdu memakai huruf ny!",
        targetTiles: ["nya", "nyi"],
        distractorTiles: ["nga", "ku"],
      },
    ],
    questions: [
      {
        prompt: "🌸 Aku harum dan mekar indah di taman: 'bu - ...'",
        speakQuestion:
          "Aku mekar indah dan harum di taman. Lengkapi suku kata akhirnya!",
        hint: "Pakai huruf sambung N dan G",
        options: ["nga", "nya", "na", "ga"],
        answer: "nga",
      },
      {
        prompt: "🦁 Aku dijuluki raja hutan bersurai lebat: 'si - ...'",
        speakQuestion:
          "Hewan gagah yang dijuluki raja hutan. Lengkapi suku kata terakhirnya!",
        hint: "Si ditambah nga",
        options: ["nya", "nga", "ma", "la"],
        answer: "nga",
      },
      {
        prompt: "🦟 Aku serangga kecil yang suka berdengung di malam hari: '... - muk'",
        speakQuestion:
          "Serangga kecil yang suka berdengung malam hari. Suku kata pertamaku apa?",
        hint: "Pakai huruf sambung N dan Y",
        options: ["nya", "nga", "sya", "kha"],
        answer: "nya",
      },
    ],
  },
  {
    id: "read-7-gabung-kata",
    levelNumber: 7,
    title: "Level 7: Rangkai Kata Bersuku Kata",
    badge: "Rangkai Kata",
    description: "Membaca dan menyusun kata panjang dengan 3–4 suku kata.",
    recommendedFor: ["SD"],
    lessons: [
      {
        id: "rk-1",
        symbol: "se·pa·tu",
        breakdown: "se + pa + tu",
        exampleWord: "sepatu",
        emoji: "👟",
        tip: "Baca per suku kata lalu gabungkan cepat",
        speakLesson: "Se, pa, tu. Jika digabung dibaca: sepatu.",
      },
      {
        id: "rk-2",
        symbol: "ke·la·pa",
        breakdown: "ke + la + pa",
        exampleWord: "kelapa",
        emoji: "🥥",
        tip: "Tiga suku kata berurutan",
        speakLesson: "Ke, la, pa. Jika digabung dibaca: kelapa.",
      },
      {
        id: "rk-3",
        symbol: "ku·pu·ku·pu",
        breakdown: "ku + pu + ku + pu",
        exampleWord: "kupukupu",
        emoji: "🦋",
        tip: "Kata ulang 4 suku kata",
        speakLesson: "Ku, pu, ku, pu. Dibaca kupu-kupu.",
      },
    ],
    gameRounds: [
      {
        id: "rg-rk1",
        clue: "Rangkai alas kaki sekolah: se + pa + tu",
        emoji: "👟",
        speakClue: "Susun tiga suku kata menjadi benda yang dipakai di kaki saat ke sekolah!",
        targetTiles: ["se", "pa", "tu"],
        distractorTiles: ["ke", "la"],
      },
      {
        id: "rg-rk2",
        clue: "Rangkai buah di pantai: ke + la + pa",
        emoji: "🥥",
        speakClue: "Susun tiga suku kata menjadi nama buah air segar di pantai!",
        targetTiles: ["ke", "la", "pa"],
        distractorTiles: ["se", "tu"],
      },
    ],
    questions: [
      {
        prompt: "👟 Aku dipakai di kaki bersama kaus kaki ke sekolah: se - pa - ...",
        speakQuestion:
          "Aku dipakai di kaki bersama kaus kaki saat pergi ke sekolah. Suku kata terakhirku apa?",
        hint: "Berbunyi tu",
        options: ["tu", "ta", "ti", "to"],
        answer: "tu",
      },
      {
        prompt: "🥥 Pohonku tinggi di pantai dan airku segar diminum: ke - la - ...",
        speakQuestion:
          "Pohonku tinggi di pantai, buahku berisi air segar. Lengkapi kata namaku!",
        hint: "Ke - la - pa",
        options: ["pa", "pi", "pu", "po"],
        answer: "pa",
      },
    ],
  },
  {
    id: "read-8-tanpa-pemisah",
    levelNumber: 8,
    title: "Level 8: Baca Lancar Tanpa Pemisah Kata",
    badge: "Lancar Baca",
    description: "Membaca kalimat utuh tanpa tanda hubung dan memahami isinya.",
    recommendedFor: ["SD", "SMP", "SMA", "Universitas"],
    lessons: [
      {
        id: "tp-1",
        symbol: "Saya suka buku",
        breakdown: "Baca utuh tanpa jeda tanda hubung",
        exampleWord: "Saya suka baca buku cerita",
        emoji: "📖",
        tip: "Lihat seluruh kata sekaligus, jangan dieja per huruf",
        speakLesson: "Mari membaca lancar tanpa pemisah: Saya suka baca buku cerita.",
      },
      {
        id: "tp-2",
        symbol: "Ibu ke pasar",
        breakdown: "Memahami siapa, melakukan apa, di mana",
        exampleWord: "Ibu pergi ke pasar pagi ini",
        emoji: "🛒",
        tip: "Pahami arti kalimat saat membaca",
        speakLesson: "Ibu pergi ke pasar pagi ini. Siapa yang pergi? Ibu. Ke mana? Ke pasar.",
      },
    ],
    gameRounds: [
      {
        id: "rg-tp1",
        clue: "Susun kalimat utuh: 'Saya' 'baca' 'buku'",
        emoji: "📖",
        speakClue: "Susun tiga kata utuh berikut menjadi kalimat yang benar: Saya baca buku.",
        targetTiles: ["Saya", "baca", "buku"],
        distractorTiles: ["tidur", "meja"],
      },
      {
        id: "rg-tp2",
        clue: "Susun kalimat: 'Adik' 'minum' 'susu'",
        emoji: "🥛",
        speakClue: "Susun kalimat lengkap: Adik minum susu.",
        targetTiles: ["Adik", "minum", "susu"],
        distractorTiles: ["sepatu", "lari"],
      },
    ],
    questions: [
      {
        prompt: "Bacalah: 'Adik bermain layangan di lapangan.' Di mana adik bermain?",
        speakQuestion:
          "Dengarkan kalimat berikut. Adik bermain layangan di lapangan. Di manakah adik bermain?",
        hint: "Cari keterangan tempat di akhir kalimat",
        options: ["Di lapangan", "Di dapur", "Di kamar", "Di kolam"],
        answer: "Di lapangan",
      },
      {
        prompt: "Bacalah: 'Bunga melati mekar harum setiap pagi.' Bunga apakah yang disebut?",
        speakQuestion:
          "Dengarkan kalimat ini. Bunga melati mekar harum setiap pagi. Bunga apakah yang mekar?",
        hint: "Berwarna putih dan harum",
        options: ["Melati", "Mawar", "Anggrek", "Matahari"],
        answer: "Melati",
      },
      {
        prompt: "Dalam kalimat 'Ani membaca soal dengan cermat', arti kata CERMAT adalah...",
        speakQuestion:
          "Ani membaca soal dengan cermat. Kata apakah yang artinya sama dengan cermat?",
        hint: "Artinya sangat hati-hati",
        options: ["Teliti", "Tergesa", "Bising", "Lupa"],
        answer: "Teliti",
      },
    ],
  },
  {
    id: "read-9-analitik",
    levelNumber: 9,
    title: "Level 9: Literasi Analitis & Akademik",
    badge: "SMP–Kuliah",
    description: "Ide pokok, majas bahasa, dan pemahaman teks ilmiah.",
    recommendedFor: ["SMP", "SMA", "Universitas"],
    lessons: [
      {
        id: "an-1",
        symbol: "Ide Pokok",
        breakdown: "Kalimat Utama + Kalimat Penjelas",
        exampleWord: "Inti sebuah paragraf",
        emoji: "📝",
        tip: "Biasanya berada di awal (deduktif) atau akhir (induktif)",
        speakLesson: "Kalimat utama memuat gagasan pokok yang dijelaskan oleh kalimat penjelas.",
      },
      {
        id: "an-2",
        symbol: "Personifikasi",
        breakdown: "Majas gaya bahasa",
        exampleWord: "Angin berbisik lembut",
        emoji: "🍃",
        tip: "Benda mati digambarkan punya sifat manusia",
        speakLesson: "Majas personifikasi mengumpamakan benda mati seolah hidup seperti manusia.",
      },
      {
        id: "an-3",
        symbol: "Abstrak",
        breakdown: "Ringkasan Jurnal Ilmiah",
        exampleWord: "Tujuan · Metode · Hasil",
        emoji: "🎓",
        tip: "Ringkasan singkat di bagian awal karya ilmiah",
        speakLesson: "Abstrak adalah ringkasan singkat tujuan, metode, dan hasil pada artikel ilmiah.",
      },
    ],
    gameRounds: [
      {
        id: "rg-an1",
        clue: "Susun urutan struktur jurnal: 'Abstrak' → 'Metode' → 'Hasil'",
        emoji: "🎓",
        speakClue: "Urutkan bagian artikel ilmiah: Abstrak, lalu Metode, lalu Hasil.",
        targetTiles: ["Abstrak", "Metode", "Hasil"],
        distractorTiles: ["Lampiran", "Sampul"],
      },
    ],
    questions: [
      {
        prompt: "Kalimat yang memuat gagasan utama sebuah paragraf disebut...",
        speakQuestion:
          "Dalam struktur paragraf, kalimat apakah yang memuat gagasan utama?",
        hint: "Menjadi inti bahasan paragraf",
        options: ["Kalimat Utama", "Kalimat Tanya", "Kalimat Penjelas", "Antonim"],
        answer: "Kalimat Utama",
      },
      {
        prompt: "'Angin malam berbisik lembut.' Kalimat ini menggunakan majas...",
        speakQuestion:
          "Angin malam berbisik lembut. Gaya bahasa atau majas apakah yang digunakan?",
        hint: "Benda mati bertingkah seperti manusia",
        options: ["Personifikasi", "Hiperbola", "Metafora", "Ironi"],
        answer: "Personifikasi",
      },
      {
        prompt: "Ringkasan tujuan, metode, dan hasil di awal jurnal ilmiah disebut...",
        speakQuestion:
          "Ringkasan tujuan, metode, dan hasil di bagian awal artikel ilmiah disebut apa?",
        hint: "Terdiri dari 150–250 kata di awal makalah",
        options: ["Abstrak", "Lampiran", "Daftar Pustaka", "Glosarium"],
        answer: "Abstrak",
      },
    ],
  },
];

export const WRITING_STAGES: WritingStage[] = [
  {
    id: "write-1-az",
    levelNumber: 1,
    title: "Level 1: Tracing Lengkap Huruf A–Z",
    badge: "Huruf A–Z",
    description: "Menebalkan seluruh 26 huruf A sampai Z dengan garis panduan.",
    recommendedFor: ["TK"],
    targets: ALPHABET_AZ.map((item) => ({
      text: item.lower,
      speakPrompt: `Ayo tebalkan huruf ${item.upper}, seperti kata ${item.exampleWord}!`,
      hint: `${item.emoji} ${item.exampleWord} — ${item.soundHint}`,
    })),
  },
  {
    id: "write-2-suku",
    levelNumber: 2,
    title: "Level 2: Suku Kata ba–za, ad–od & bad–bod",
    badge: "ba–za · bad",
    description: "Menulis suku kata 2 huruf B–Z, pola ad-id-ud, hingga bad-bed-bod.",
    recommendedFor: ["TK", "SD"],
    targets: [
      ...CONSONANTS_BZ.map((c) => ({
        text: `${c.lower}a`,
        speakPrompt: `Ayo tulis suku kata ${c.lower}a!`,
        hint: `Gabungkan huruf ${c.lower} dan a`,
      })),
      { text: "ad", speakPrompt: "Tulis huruf depan vokal a dan d: ad!", hint: "Huruf a dulu baru d" },
      { text: "id", speakPrompt: "Tulis huruf depan vokal i dan d: id!", hint: "Huruf i dulu baru d" },
      { text: "bad", speakPrompt: "Tulis suku kata tiga huruf: bad!", hint: "b - a - d" },
      { text: "bed", speakPrompt: "Tulis pola tiga huruf: bed!", hint: "b - e - d" },
      { text: "bod", speakPrompt: "Tulis pola tiga huruf: bod!", hint: "b - o - d" },
    ],
  },
  {
    id: "write-3-sambung",
    levelNumber: 3,
    title: "Level 3: Huruf Sambung ng, ny & Kata",
    badge: "ng · ny · kata",
    description: "Menulis bunyi ng, ny, dan kata utuh tanpa pemisah.",
    recommendedFor: ["SD"],
    targets: [
      { text: "nga", speakPrompt: "Tulis huruf sambung n g a: nga!", hint: "Rangkaikan n, g, dan a" },
      { text: "nya", speakPrompt: "Tulis huruf sambung n y a: nya!", hint: "Rangkaikan n, y, dan a" },
      { text: "buku", speakPrompt: "Tulis kata utuh tanpa pemisah: buku!", hint: "b - u - k - u" },
    ],
  },
  {
    id: "write-4-akademik",
    levelNumber: 4,
    title: "Level 4: Angka, Rumus & Notasi",
    badge: "123 & Rumus",
    description: "Menulis angka, simbol aljabar, hingga notasi matematika.",
    recommendedFor: ["SMP", "SMA", "Universitas"],
    targets: [
      { text: "1 2 3", speakPrompt: "Tulis angka satu, dua, tiga!", hint: "Beri jarak rapi antar angka" },
      { text: "2x+4", speakPrompt: "Tulis bentuk aljabar dua x tambah empat!", hint: "Variabel x dan konstanta" },
      { text: "Σx/n", speakPrompt: "Tulis rumus rata-rata sigma x dibagi n!", hint: "Simbol sigma diikuti x per n" },
    ],
  },
];

export const MATH_STAGES: MathStage[] = [
  {
    id: "math-1-visual",
    levelNumber: 1,
    title: "Level 1: Hitung Benda & Angka 1–10",
    badge: "TK Dasar",
    description: "Belajar mengenal angka, menghitung benda, dan tambah kurang kecil.",
    recommendedFor: ["TK"],
    lessons: [
      {
        id: "m1-l1",
        symbol: "2 + 1 = 3",
        breakdown: "🍎🍎 + 🍎 = 🍎🍎🍎",
        exampleWord: "Penjumlahan = digabung",
        emoji: "🍎",
        tip: "Hitung semua buah setelah digabung",
        speakLesson: "Dua apel ditambah satu apel sama dengan tiga apel.",
      },
      {
        id: "m1-l2",
        symbol: "5 - 2 = 3",
        breakdown: "⭐⭐⭐⭐⭐ dikurang 2 = ⭐⭐⭐",
        exampleWord: "Pengurangan = diambil",
        emoji: "⭐",
        tip: "Hitung sisa benda yang belum diambil",
        speakLesson: "Lima bintang dikurangi dua bintang sisanya tiga bintang.",
      },
    ],
    pairGames: [
      { id: "pm1", left: "🍎🍎 + 🍎", right: "3" },
      { id: "pm2", left: "⭐⭐⭐ + ⭐⭐", right: "5" },
      { id: "pm3", left: "4 - 2", right: "2" },
    ],
    questions: [
      {
        prompt: "🍎🍎 + 🍎 = berapa jumlah apel seluruhnya?",
        speakQuestion:
          "Ada dua apel ditambah satu apel lagi. Berapa jumlah apel seluruhnya?",
        hint: "Hitung satu per satu: 1, 2, 3",
        options: ["2", "3", "4", "5"],
        answer: "3",
      },
      {
        prompt: "⭐⭐⭐ + ⭐⭐ = berapa jumlah bintang?",
        speakQuestion:
          "Tiga bintang ditambah dua bintang. Berapa semua bintangnya?",
        hint: "3 jari ditambah 2 jari",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        prompt: "🎈🎈🎈🎈🎈 - 🎈🎈 = sisa balonnya berapa?",
        speakQuestion:
          "Ada lima balon, lalu dua balon meletus. Berapa sisa balon sekarang?",
        hint: "5 dikurangi 2",
        options: ["2", "3", "4", "5"],
        answer: "3",
      },
      {
        prompt: "🍌🍌🍌 + 🍌 = berapa jumlah pisang semuanya?",
        speakQuestion: "Tiga pisang ditambah satu pisang. Berapa jumlah pisang semuanya?",
        hint: "3 ditambah 1",
        options: ["3", "4", "5", "6"],
        answer: "4",
      },
      {
        prompt: "🐟🐟🐟🐟 - 🐟 = berapa sisa ikannya?",
        speakQuestion: "Empat ikan di kolam, satu ikan berenang pergi. Berapa sisa ikannya?",
        hint: "4 dikurangi 1",
        options: ["2", "3", "4", "5"],
        answer: "3",
      },
      {
        prompt: "🍓🍓🍓 + 🍓🍓🍓 = berapa semua stroberinya?",
        speakQuestion: "Tiga stroberi ditambah tiga stroberi lagi. Berapa jumlah seluruhnya?",
        hint: "3 + 3",
        options: ["5", "6", "7", "8"],
        answer: "6",
      },
      {
        prompt: "🚗🚗 + 🚗🚗🚗 = ada berapa mobil mainan?",
        speakQuestion: "Dua mobil ditambah tiga mobil mainan. Berapa semuanya?",
        hint: "2 + 3",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        prompt: "🍪🍪🍪🍪🍪🍪 - 🍪🍪 = sisa kue ada berapa?",
        speakQuestion: "Ada enam kue, dimakan dua kue. Sisa kue sekarang ada berapa?",
        hint: "6 dikurangi 2",
        options: ["3", "4", "5", "6"],
        answer: "4",
      },
    ],
  },
  {
    id: "math-2-dasar",
    levelNumber: 2,
    title: "Level 2: Tambah & Kurang Puluhan",
    badge: "SD Awal",
    description: "Cara cepat menjumlah dan mengurang bilangan puluhan.",
    recommendedFor: ["SD"],
    lessons: [
      {
        id: "m2-l1",
        symbol: "15 + 12",
        breakdown: "(10+10) + (5+2) = 27",
        exampleWord: "Pisah puluhan & satuan",
        emoji: "🧮",
        tip: "Jumlahkan puluhan dulu agar lebih mudah",
        speakLesson: "Lima belas tambah dua belas: puluhan sepuluh tambah sepuluh dua puluh, satuan lima tambah dua tujuh, jadi dua puluh tujuh.",
      },
      {
        id: "m2-l2",
        symbol: "40 - 16",
        breakdown: "40 - 10 = 30, lalu 30 - 6 = 24",
        exampleWord: "Kurangi bertahap",
        emoji: "➖",
        tip: "Kurangi puluhannya dulu baru satuannya",
        speakLesson: "Empat puluh dikurangi enam belas: kurangi sepuluh jadi tiga puluh, kurangi enam jadi dua puluh empat.",
      },
    ],
    pairGames: [
      { id: "pm2-1", left: "15 + 12", right: "27" },
      { id: "pm2-2", left: "40 - 16", right: "24" },
      { id: "pm2-3", left: "28 + 14", right: "42" },
    ],
    questions: [
      {
        prompt: "15 + 12 = ?",
        speakQuestion: "Berapakah lima belas ditambah dua belas?",
        hint: "Satuan 5+2=7, puluhan 1+1=2",
        options: ["25", "27", "28", "37"],
        answer: "27",
      },
      {
        prompt: "40 - 16 = ?",
        speakQuestion: "Berapakah empat puluh dikurangi enam belas?",
        hint: "40 - 10 = 30, lalu kurangi 6",
        options: ["22", "24", "26", "34"],
        answer: "24",
      },
      {
        prompt: "28 + 14 = ?",
        speakQuestion: "Berapakah dua puluh delapan ditambah empat belas?",
        hint: "28 + 10 = 38, ditambah 4",
        options: ["32", "40", "42", "44"],
        answer: "42",
      },
    ],
  },
  {
    id: "math-3-kalibagi",
    levelNumber: 3,
    title: "Level 3: Perkalian, Pembagian & Pecahan",
    badge: "SD Lanjut",
    description: "Memahami konsep kali, bagi, dan pecahan sederhana.",
    recommendedFor: ["SD"],
    lessons: [
      {
        id: "m3-l1",
        symbol: "7 × 8 = 56",
        breakdown: "Penjumlahan berulang 8 sebanyak 7 kali",
        exampleWord: "7 × 7 = 49, + 7 = 56",
        emoji: "✖️",
        tip: "Gunakan patokan perkalian yang sudah hafal",
        speakLesson: "Tujuh dikali delapan adalah lima puluh enam.",
      },
      {
        id: "m3-l2",
        symbol: "1/2 dari 20",
        breakdown: "20 dibagi 2 bagian sama besar = 10",
        exampleWord: "Setengah = bagi 2",
        emoji: "🍊",
        tip: "Pecahan 1/2 berarti dibagi 2 rata",
        speakLesson: "Setengah dari dua puluh artinya dua puluh dibagi dua, hasilnya sepuluh.",
      },
    ],
    pairGames: [
      { id: "pm3-1", left: "7 × 8", right: "56" },
      { id: "pm3-2", left: "72 ÷ 9", right: "8" },
      { id: "pm3-3", left: "1/2 dari 20", right: "10" },
    ],
    questions: [
      {
        prompt: "7 × 8 = ?",
        speakQuestion: "Berapakah hasil dari tujuh dikali delapan?",
        hint: "7 × 7 = 49, tambah 7 lagi",
        options: ["48", "54", "56", "64"],
        answer: "56",
      },
      {
        prompt: "72 ÷ 9 = ?",
        speakQuestion: "Tujuh puluh dua dibagi sembilan sama dengan berapa?",
        hint: "9 dikali berapa hasilnya 72?",
        options: ["6", "7", "8", "9"],
        answer: "8",
      },
      {
        prompt: "1/2 dari 20 buah jeruk adalah...",
        speakQuestion: "Setengah dari dua puluh buah jeruk ada berapa buah?",
        hint: "20 dibagi 2",
        options: ["5", "8", "10", "12"],
        answer: "10",
      },
    ],
  },
  {
    id: "math-4-aljabar",
    levelNumber: 4,
    title: "Level 4: Aljabar & Geometri",
    badge: "SMP",
    description: "Persamaan linear satu variabel dan luas bangun datar.",
    recommendedFor: ["SMP"],
    lessons: [
      {
        id: "m4-l1",
        symbol: "3x + 2 = 20",
        breakdown: "3x = 20 - 2 = 18  →  x = 6",
        exampleWord: "Pindahkan konstanta ke ruas kanan",
        emoji: "📐",
        tip: "Kurangi dulu kedua sisi dengan 2",
        speakLesson: "Untuk mencari nilai x pada tiga x tambah dua sama dengan dua puluh, kurangi dua puluh dengan dua menjadi delapan belas, lalu bagi tiga hasilnya enam.",
      },
    ],
    pairGames: [
      { id: "pm4-1", left: "3x + 2 = 20", right: "x = 6" },
      { id: "pm4-2", left: "Luas Δ (a=10, t=6)", right: "30 cm²" },
    ],
    questions: [
      {
        prompt: "Jika 3x + 2 = 20, berapakah nilai x?",
        speakQuestion:
          "Jika tiga x ditambah dua sama dengan dua puluh, berapakah nilai x?",
        hint: "3x = 20 - 2 = 18",
        options: ["5", "6", "7", "8"],
        answer: "6",
      },
      {
        prompt: "Luas segitiga dengan alas 10 cm dan tinggi 6 cm adalah...",
        speakQuestion:
          "Hitung luas segitiga yang memiliki alas sepuluh sentimeter dan tinggi enam sentimeter.",
        hint: "1/2 × alas × tinggi",
        options: ["16 cm²", "30 cm²", "60 cm²", "20 cm²"],
        answer: "30 cm²",
      },
    ],
  },
  {
    id: "math-5-lanjut",
    levelNumber: 5,
    title: "Level 5: Kalkulus, Trigonometri & Statistika",
    badge: "SMA–Kuliah",
    description: "Trigonometri sudut istimewa, turunan, dan rata-rata statistik.",
    recommendedFor: ["SMA", "Universitas"],
    lessons: [
      {
        id: "m5-l1",
        symbol: "sin(30°) = 0,5",
        breakdown: "Turunan axⁿ = a·n·xⁿ⁻¹",
        exampleWord: "f(x) = 4x² + 3x  →  f'(x) = 8x + 3",
        emoji: "📊",
        tip: "Hafalkan nilai sudut istimewa 0°, 30°, 45°, 60°, 90°",
        speakLesson: "Sinus tiga puluh derajat bernilai setengah atau nol koma lima. Turunan empat x kuadrat tambah tiga x adalah delapan x tambah tiga.",
      },
    ],
    pairGames: [
      { id: "pm5-1", left: "sin(30°) × 12", right: "6" },
      { id: "pm5-2", left: "f'(2) dari 4x²+3x", right: "19" },
      { id: "pm5-3", left: "Mean [12,18,20,30]", right: "20" },
    ],
    questions: [
      {
        prompt: "Nilai dari sin(30°) × 12 adalah...",
        speakQuestion: "Berapakah nilai sinus tiga puluh derajat dikali dua belas?",
        hint: "sin(30°) = 0,5",
        options: ["4", "6", "8", "12"],
        answer: "6",
      },
      {
        prompt: "Turunan pertama f(x) = 4x² + 3x di x = 2 adalah...",
        speakQuestion:
          "Tentukan nilai turunan pertama dari empat x kuadrat ditambah tiga x saat x sama dengan dua.",
        hint: "f'(x) = 8x + 3",
        options: ["11", "16", "19", "22"],
        answer: "19",
      },
      {
        prompt: "Rata-rata dari data [12, 18, 20, 30] adalah...",
        speakQuestion:
          "Hitung nilai rata-rata dari empat angka: dua belas, delapan belas, dua puluh, dan tiga puluh.",
        hint: "Jumlahkan semua lalu bagi 4",
        options: ["18", "20", "22", "25"],
        answer: "20",
      },
    ],
  },
];

export const LOGIC_STAGES: LogicStage[] = [
  {
    id: "logic-1-cocok",
    levelNumber: 1,
    title: "Level 1: Tebak Pola & Logika Dasar",
    badge: "TK–SD",
    description: "Melatih pengamatan pola warna, urutan angka, dan daya ingat.",
    recommendedFor: ["TK", "SD"],
    lessons: [
      {
        id: "lg1-l1",
        symbol: "🔴 🔵 🔴 🔵",
        breakdown: "Pola berulang selang-seling",
        exampleWord: "Merah, Biru, Merah, Biru",
        emoji: "🧩",
        tip: "Lihat dua bagian pertama untuk menebak bagian berikutnya",
        speakLesson: "Pola adalah urutan yang berulang secara teratur, misalnya merah, biru, merah, biru.",
      },
    ],
    pairGames: [
      { id: "pl1-1", left: "2, 4, 6, ...", right: "8" },
      { id: "pl1-2", left: "🔴 🔵 🔴 ...", right: "🔵" },
      { id: "pl1-3", left: "5, 10, 15, ...", right: "20" },
    ],
    questions: [
      {
        prompt: "Lanjutkan pola berikut: 🔴 🔵 🔴 🔵 🔴 ...",
        speakQuestion:
          "Perhatikan pola warna merah, biru, merah, biru, merah. Warna apakah selanjutnya?",
        hint: "Bergantian merah dan biru",
        options: ["🔴 Merah", "🔵 Biru", "🟢 Hijau", "🟡 Kuning"],
        answer: "🔵 Biru",
      },
      {
        prompt: "Lanjutkan urutan angka: 2, 4, 6, 8, ...",
        speakQuestion:
          "Lanjutkan urutan bilangan genap: dua, empat, enam, delapan, lalu berapa?",
        hint: "Selalu ditambah 2",
        options: ["9", "10", "11", "12"],
        answer: "10",
      },
      {
        prompt: "Lanjutkan pola bentuk: 🔺 ⬛ 🔺 ⬛ 🔺 ...",
        speakQuestion: "Pola segitiga, kotak, segitiga, kotak, segitiga. Bentuk selanjutnya apa?",
        hint: "Bergantian segitiga dan kotak",
        options: ["🔺 Segitiga", "⬛ Kotak", "⭕ Lingkaran", "⭐ Bintang"],
        answer: "⬛ Kotak",
      },
      {
        prompt: "Urutan melompat 5: 5, 10, 15, 20, ...",
        speakQuestion: "Urutan kelipatan lima: lima, sepuluh, lima belas, dua puluh, selanjutnya?",
        hint: "Tambah 5 dari 20",
        options: ["22", "24", "25", "30"],
        answer: "25",
      },
      {
        prompt: "Manakah yang termasuk buah? 🍎 Apel, 🚗 Mobil, 🪑 Kursi, ✏️ Pensil",
        speakQuestion: "Dari pilihan berikut, manakah yang termasuk buah yang bisa dimakan?",
        hint: "Tumbuh di pohon dan manis",
        options: ["🍎 Apel", "🚗 Mobil", "🪑 Kursi", "✏️ Pensil"],
        answer: "🍎 Apel",
      },
      {
        prompt: "Urutan mundur: 10, 9, 8, 7, ...",
        speakQuestion: "Hitung mundur dari sepuluh: sepuluh, sembilan, delapan, tujuh, lalu?",
        hint: "Satu angka sebelum 7",
        options: ["5", "6", "8", "9"],
        answer: "6",
      },
      {
        prompt: "Jika hari ini Senin, besok adalah hari...",
        speakQuestion: "Jika hari ini adalah hari Senin, maka besok adalah hari apa?",
        hint: "Hari kedua dalam seminggu",
        options: ["Minggu", "Selasa", "Rabu", "Kamis"],
        answer: "Selasa",
      },
    ],
  },
  {
    id: "logic-2-hafalan",
    levelNumber: 2,
    title: "Level 2: Kuis Hafalan & Deduksi",
    badge: "SMP–Kuliah",
    description: "Barisan Fibonacci, silogisme logika, dan hafalan konsep.",
    recommendedFor: ["SMP", "SMA", "Universitas"],
    lessons: [
      {
        id: "lg2-l1",
        symbol: "1, 1, 2, 3, 5, 8",
        breakdown: "Suku berikutnya = jumlah 2 suku sebelumnya",
        exampleWord: "5 + 8 = 13",
        emoji: "🧠",
        tip: "Barisan Fibonacci menjumlahkan dua angka terakhir",
        speakLesson: "Pada barisan Fibonacci, setiap angka diperoleh dari jumlah dua angka sebelumnya.",
      },
    ],
    pairGames: [
      { id: "pl2-1", left: "Fibonacci setelah 5, 8", right: "13" },
      { id: "pl2-2", left: "Paus ∈ Mamalia", right: "Bernapas Paru-paru" },
    ],
    questions: [
      {
        prompt: "Lanjutkan deret Fibonacci: 1, 1, 2, 3, 5, 8, ...",
        speakQuestion:
          "Lanjutkan barisan Fibonacci: satu, satu, dua, tiga, lima, delapan, angka berikutnya adalah?",
        hint: "Jumlahkan dua angka terakhir (5 + 8)",
        options: ["11", "12", "13", "15"],
        answer: "13",
      },
      {
        prompt: "Semua mamalia bernapas dengan paru-paru. Paus adalah mamalia. Kesimpulannya?",
        speakQuestion:
          "Semua mamalia bernapas dengan paru-paru, dan paus adalah mamalia. Maka kesimpulan yang benar adalah?",
        hint: "Silogisme deduktif",
        options: [
          "Paus bernapas dengan paru-paru",
          "Paus bernapas dengan insang",
          "Paus adalah ikan",
          "Tidak bisa disimpulkan",
        ],
        answer: "Paus bernapas dengan paru-paru",
      },
    ],
  },
];

export function getStageByNumber<T extends { levelNumber: number }>(
  stages: T[],
  levelNumber: number
): T {
  return (
    stages.find((s) => s.levelNumber === levelNumber) ?? stages[0]
  );
}

export function getDefaultReadingStageId(level: EducationLevel): string {
  const match = READING_STAGES.find((s) => s.recommendedFor.includes(level));
  return match?.id ?? READING_STAGES[0].id;
}

export function getDefaultWritingStageId(level: EducationLevel): string {
  const match = WRITING_STAGES.find((s) => s.recommendedFor.includes(level));
  return match?.id ?? WRITING_STAGES[0].id;
}

export function getDefaultMathStageId(level: EducationLevel): string {
  const match = MATH_STAGES.find((s) => s.recommendedFor.includes(level));
  return match?.id ?? MATH_STAGES[0].id;
}

export function getDefaultLogicStageId(level: EducationLevel): string {
  const match = LOGIC_STAGES.find((s) => s.recommendedFor.includes(level));
  return match?.id ?? LOGIC_STAGES[0].id;
}
