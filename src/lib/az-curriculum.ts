import type { QuizQuestion, TileGameRound } from "@/lib/curriculum";

export interface AlphabetItem {
  upper: string;
  lower: string;
  isVowel: boolean;
  exampleWord: string;
  emoji: string;
  soundHint: string;
}

export const ALPHABET_AZ: AlphabetItem[] = [
  { upper: "A", lower: "a", isVowel: true, exampleWord: "Apel", emoji: "🍎", soundHint: "Buka mulut lebar: A" },
  { upper: "B", lower: "b", isVowel: false, exampleWord: "Bola", emoji: "⚽", soundHint: "Bunyi beh" },
  { upper: "C", lower: "c", isVowel: false, exampleWord: "Ceri", emoji: "🍒", soundHint: "Bunyi ceh" },
  { upper: "D", lower: "d", isVowel: false, exampleWord: "Domba", emoji: "🐑", soundHint: "Bunyi deh" },
  { upper: "E", lower: "e", isVowel: true, exampleWord: "Ember", emoji: "🪣", soundHint: "Bunyi eh ringan" },
  { upper: "F", lower: "f", isVowel: false, exampleWord: "Foto", emoji: "📷", soundHint: "Gigi atas sentuh bibir: ef" },
  { upper: "G", lower: "g", isVowel: false, exampleWord: "Gajah", emoji: "🐘", soundHint: "Bunyi geh" },
  { upper: "H", lower: "h", isVowel: false, exampleWord: "Harimau", emoji: "🐯", soundHint: "Hembus napas: ha" },
  { upper: "I", lower: "i", isVowel: true, exampleWord: "Ikan", emoji: "🐟", soundHint: "Senyum lebar: I" },
  { upper: "J", lower: "j", isVowel: false, exampleWord: "Jeruk", emoji: "🍊", soundHint: "Bunyi jeh" },
  { upper: "K", lower: "k", isVowel: false, exampleWord: "Kuda", emoji: "🐎", soundHint: "Bunyi kah" },
  { upper: "L", lower: "l", isVowel: false, exampleWord: "Lampu", emoji: "💡", soundHint: "Ujung lidah naik: el" },
  { upper: "M", lower: "m", isVowel: false, exampleWord: "Mangga", emoji: "🥭", soundHint: "Rapatkan bibir: em" },
  { upper: "N", lower: "n", isVowel: false, exampleWord: "Nanas", emoji: "🍍", soundHint: "Lidah di langit mulut: en" },
  { upper: "O", lower: "o", isVowel: true, exampleWord: "Obat", emoji: "💊", soundHint: "Bibir bulat: O" },
  { upper: "P", lower: "p", isVowel: false, exampleWord: "Pisang", emoji: "🍌", soundHint: "Letupkan bibir: peh" },
  { upper: "Q", lower: "q", isVowel: false, exampleWord: "Quran", emoji: "📖", soundHint: "Bunyi ki / kyu" },
  { upper: "R", lower: "r", isVowel: false, exampleWord: "Roda", emoji: "🛞", soundHint: "Getarkan lidah: er" },
  { upper: "S", lower: "s", isVowel: false, exampleWord: "Susu", emoji: "🥛", soundHint: "Desis halus: es" },
  { upper: "T", lower: "t", isVowel: false, exampleWord: "Topi", emoji: "🎩", soundHint: "Bunyi teh" },
  { upper: "U", lower: "u", isVowel: true, exampleWord: "Ular", emoji: "🐍", soundHint: "Bibir monyong: U" },
  { upper: "V", lower: "v", isVowel: false, exampleWord: "Vas", emoji: "🏺", soundHint: "Bunyi veh / ef" },
  { upper: "W", lower: "w", isVowel: false, exampleWord: "Wortel", emoji: "🥕", soundHint: "Bunyi weh" },
  { upper: "X", lower: "x", isVowel: false, exampleWord: "Xilofon", emoji: "🎼", soundHint: "Bunyi eks" },
  { upper: "Y", lower: "y", isVowel: false, exampleWord: "Yoyo", emoji: "🪀", soundHint: "Bunyi yeh" },
  { upper: "Z", lower: "z", isVowel: false, exampleWord: "Zebra", emoji: "🦓", soundHint: "Desis bergetar: zet" },
];

export const CONSONANTS_BZ: AlphabetItem[] = ALPHABET_AZ.filter(
  (item) => !item.isVowel
);

export const VOWELS = ["a", "i", "u", "e", "o"] as const;
export type VowelChar = (typeof VOWELS)[number];

const CUMULATIVE_A_WORDS: Array<{ word: string; syllables: [string, string]; minConsonantIdx: number; emoji: string }> = [
  { word: "ada", syllables: ["a", "da"], minConsonantIdx: 2, emoji: "🙋" },
  { word: "baca", syllables: ["ba", "ca"], minConsonantIdx: 1, emoji: "📖" },
  { word: "dada", syllables: ["da", "da"], minConsonantIdx: 2, emoji: "🫀" },
  { word: "kaca", syllables: ["ka", "ca"], minConsonantIdx: 7, emoji: "🪞" },
  { word: "lama", syllables: ["la", "ma"], minConsonantIdx: 9, emoji: "⏳" },
  { word: "mama", syllables: ["ma", "ma"], minConsonantIdx: 9, emoji: "👩" },
  { word: "nama", syllables: ["na", "ma"], minConsonantIdx: 10, emoji: "🪪" },
  { word: "papa", syllables: ["pa", "pa"], minConsonantIdx: 11, emoji: "👨" },
  { word: "raja", syllables: ["ra", "ja"], minConsonantIdx: 13, emoji: "👑" },
  { word: "saya", syllables: ["sa", "ya"], minConsonantIdx: 19, emoji: "😊" },
  { word: "mata", syllables: ["ma", "ta"], minConsonantIdx: 15, emoji: "👀" },
  { word: "bawa", syllables: ["ba", "wa"], minConsonantIdx: 17, emoji: "🛍️" },
  { word: "zara", syllables: ["za", "ra"], minConsonantIdx: 20, emoji: "⭐" },
];

export interface VowelADrillSheet {
  consonant: string;
  consonantIndex: number;
  learnedPool: string[];
  classicLines: string[];
  reviewLines: string[];
  unlockedWords: Array<{ word: string; syllables: [string, string]; emoji: string }>;
}

/**
 * Menghasilkan latihan baca fokus vokal A (A, BA..ZA) dengan materi lama selalu dilampirkan.
 */
export function buildVowelADrillSheet(consonantLower: string): VowelADrillSheet {
  const idx = CONSONANTS_BZ.findIndex((c) => c.lower === consonantLower);
  const safeIdx = idx >= 0 ? idx : 0;
  const cur = CONSONANTS_BZ[safeIdx].lower;
  const prev = safeIdx > 0 ? CONSONANTS_BZ[safeIdx - 1].lower : null;
  const older = safeIdx > 1 ? CONSONANTS_BZ[safeIdx - 2].lower : null;
  const earliest = safeIdx > 2 ? CONSONANTS_BZ[0].lower : null;

  const learnedPool = [
    "a",
    ...CONSONANTS_BZ.slice(0, safeIdx + 1).map((c) => `${c.lower}a`),
  ];

  const classicLines =
    prev === null
      ? [`a ${cur}a`, `a a`, `${cur}a a`, `${cur}a ${cur}a`]
      : [
          `a ${cur}a`,
          `${cur}a a`,
          `${cur}a ${prev}a`,
          `${prev}a a`,
          `a ${prev}a`,
          `${prev}a ${cur}a`,
        ];

  // Materi lama tetap dilampirkan agar anak tidak lupa huruf sebelumnya
  const reviewLines: string[] = [];
  if (prev && older) {
    reviewLines.push(
      `${cur}a ${older}a`,
      `${older}a ${prev}a`,
      `${cur}a ${earliest ?? older}a`,
      `${earliest ?? older}a a`
    );
  } else if (prev) {
    reviewLines.push(`ba ca`, `ca ba`, `a ba`, `a ca`);
  } else {
    reviewLines.push(`a a`, `ba ba`, `a ba`, `ba a`);
  }

  const unlockedWords = CUMULATIVE_A_WORDS.filter(
    (w) => w.minConsonantIdx <= safeIdx
  );

  return {
    consonant: cur,
    consonantIndex: safeIdx,
    learnedPool,
    classicLines,
    reviewLines,
    unlockedWords,
  };
}

/**
 * Menghasilkan latihan vokal berikutnya (I, U, E, O) yang tetap menggabungkan vokal-vokal sebelumnya.
 */
export function buildNextVowelDrillSheet(
  consonantLower: string,
  vowel: VowelChar
) {
  const idx = CONSONANTS_BZ.findIndex((c) => c.lower === consonantLower);
  const safeIdx = idx >= 0 ? idx : 0;
  const cur = CONSONANTS_BZ[safeIdx].lower;
  const prev = safeIdx > 0 ? CONSONANTS_BZ[safeIdx - 1].lower : "b";

  const vIdx = VOWELS.indexOf(vowel);
  const learnedVowels = VOWELS.slice(0, Math.max(1, vIdx + 1));
  const prevVowel = vIdx > 0 ? VOWELS[vIdx - 1] : "a";

  const focusSyllable = `${cur}${vowel}`;
  const reviewSyllables = learnedVowels.map((v) => `${cur}${v}`);

  const drillLines = [
    `${vowel} ${focusSyllable}`,
    `${focusSyllable} ${cur}${prevVowel}`,
    `${cur}a ${focusSyllable}`,
    `${prev}${vowel} ${focusSyllable}`,
    `${focusSyllable} ${prev}${prevVowel}`,
    `${prev}a ${cur}${vowel}`,
  ];

  return {
    consonant: cur,
    vowel,
    learnedVowels,
    focusSyllable,
    reviewSyllables,
    drillLines,
  };
}

export function buildFrontVowelDrill(
  consonantLower: string,
  vowel: VowelChar = "a"
) {
  const idx = CONSONANTS_BZ.findIndex((c) => c.lower === consonantLower);
  const safeIdx = idx >= 0 ? idx : 2;
  const cur = CONSONANTS_BZ[safeIdx].lower;
  const prev = safeIdx > 0 ? CONSONANTS_BZ[safeIdx - 1].lower : "b";

  // Semua 21 konsonan untuk vokal yang sedang dipilih (ab, ac, ad, ..., az)
  const allConsonantsForVowel = CONSONANTS_BZ.map((c) => `${vowel}${c.lower}`);
  // Semua 5 vokal untuk konsonan yang sedang dipilih (ad, id, ud, ed, od)
  const fiveVowelsForConsonant = VOWELS.map((v) => `${v}${cur}`);

  const lines = [
    `a a${cur}`,
    `${vowel} ${vowel}${cur}`,
    `a${cur} ${vowel}${cur}`,
    `${vowel}${prev} ${vowel}${cur}`,
    `${cur}a a${cur}`,
    `i${cur} o${cur}`,
  ];

  return {
    consonant: cur,
    vowel,
    allConsonantsForVowel,
    fiveVowelsForConsonant,
    lines,
  };
}

/**
 * Menghasilkan 3 huruf lengkap: Huruf Depan B-Z x Vokal a-i-u-e-o x Huruf Akhir b-z (tidak ada yang terlewat).
 */
export function buildCompleteThreeLetterDrill(
  frontConsonant: string,
  vowel: VowelChar,
  endConsonant: string
) {
  const f =
    CONSONANTS_BZ.find((c) => c.lower === frontConsonant)?.lower ?? "b";
  const e =
    CONSONANTS_BZ.find((c) => c.lower === endConsonant)?.lower ?? "d";
  const prevF =
    CONSONANTS_BZ[
      Math.max(0, CONSONANTS_BZ.findIndex((c) => c.lower === f) - 1)
    ].lower;

  // Seluruh 21 kombinasi akhiran b..z untuk huruf depan + vokal terpilih (misal: cab, cac, cad, ..., caz)
  const allEndingsForFront = CONSONANTS_BZ.map((c) => `${f}${vowel}${c.lower}`);

  // Seluruh 5 vokal untuk pasangan depan + akhir terpilih (misal: cad, cid, cud, ced, cod)
  const fiveVowelsPair = VOWELS.map((v) => `${f}${v}${e}`);

  // Latihan baris yang mencampur materi 2 huruf lama + 3 huruf baru
  const lines = [
    `${f}${vowel} ${f}${vowel}${e}`,
    `${f}a ${f}a${e}`,
    `${f}${vowel}${e} ${prevF}${vowel}${e}`,
    `${f}a${e} ${f}i${e}`,
    `${f}u${e} ${f}e${e}`,
    `${f}o${e} ${f}${vowel}${e}`,
  ];

  return {
    frontConsonant: f,
    vowel,
    endConsonant: e,
    allEndingsForFront,
    fiveVowelsPair,
    lines,
  };
}

/**
 * Menghasilkan game susun kata kumulatif untuk tahap vokal A (BA..ZA) + materi lama.
 */
export function buildCumulativeAGameRounds(consonantLower: string): TileGameRound[] {
  const sheet = buildVowelADrillSheet(consonantLower);
  const curSyl = `${sheet.consonant}a`;
  const prevCons =
    sheet.consonantIndex > 0
      ? CONSONANTS_BZ[sheet.consonantIndex - 1].lower
      : "b";
  const prevSyl = `${prevCons}a`;

  const rounds: TileGameRound[] = [
    {
      id: `cum-a-1-${curSyl}`,
      clue: `Materi Baru (${curSyl.toUpperCase()}) + Review Lama: susun "${sheet.consonantIndex === 0 ? "a ba" : `${curSyl} ${prevSyl}`}"`,
      emoji: "🧩",
      speakClue:
        sheet.consonantIndex === 0
          ? "Susun bunyi: a lalu ba."
          : `Susun bunyi baru ${curSyl} digabung materi lama ${prevSyl}.`,
      targetTiles:
        sheet.consonantIndex === 0 ? ["a", "ba"] : [curSyl, prevSyl],
      distractorTiles:
        sheet.consonantIndex === 0 ? ["ca", "da"] : ["a", "za"],
    },
  ];

  if (sheet.unlockedWords.length > 0) {
    const w = sheet.unlockedWords[sheet.unlockedWords.length - 1];
    rounds.push({
      id: `cum-a-word-${w.word}`,
      clue: `Review Kata Bermakna: susun "${w.word.toUpperCase()}"`,
      emoji: w.emoji,
      speakClue: `Susun dua suku kata menjadi kata ${w.word}!`,
      targetTiles: [...w.syllables],
      distractorTiles: [curSyl === w.syllables[0] ? "ma" : curSyl, "a"],
    });
  } else {
    rounds.push({
      id: "cum-a-word-baba",
      clue: `Review: susun "ba ba"`,
      emoji: "🗣️",
      speakClue: "Susun bunyi ba lalu ba.",
      targetTiles: ["ba", "ba"],
      distractorTiles: ["a", "ca"],
    });
  }

  return rounds;
}

const LEVEL1_EXTRA_A_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "🍎 Buah merah manis ini bernama APEL. Huruf apakah di paling depan?",
    speakQuestion: "Buah merah manis bernama Apel. Huruf apakah di paling depan?",
    hint: "Mulut terbuka lebar: A",
    options: ["A", "I", "U", "O"],
    answer: "A",
  },
  {
    prompt: "🐔 Hewan yang berkokok di pagi hari bernama AYAM. Huruf depannya?",
    speakQuestion: "Hewan yang berkokok pagi hari adalah Ayam. Huruf depannya apa?",
    hint: "Bunyi A seperti Apel",
    options: ["A", "E", "I", "U"],
    answer: "A",
  },
  {
    prompt: "☁️ Benda putih lembut di langit bernama AWAN. Huruf awalnya adalah?",
    speakQuestion: "Benda putih di langit adalah Awan. Huruf apakah di paling depan?",
    hint: "Sama dengan awal kata Apel",
    options: ["A", "O", "U", "E"],
    answer: "A",
  },
  {
    prompt: "🔥 Cahaya panas untuk memasak bernama API. Huruf depannya?",
    speakQuestion: "Yang terasa panas di kompor bernama Api. Huruf depannya apa?",
    hint: "Huruf pertama abjad",
    options: ["A", "I", "U", "O"],
    answer: "A",
  },
  {
    prompt: "🍇 Buah kecil ungu ini bernama ANGGUR. Huruf awalnya?",
    speakQuestion: "Buah kecil manis bernama Anggur. Huruf paling depannya adalah?",
    hint: "A - n - g...",
    options: ["A", "B", "C", "D"],
    answer: "A",
  },
  {
    prompt: "💧 Minuman bening penyegar dahaga adalah AIR. Huruf depannya?",
    speakQuestion: "Minuman bening yang kita minum setiap hari adalah Air. Huruf depannya?",
    hint: "A - i - r",
    options: ["A", "E", "I", "O"],
    answer: "A",
  },
  {
    prompt: "👶 Saudara kecil kita bernama ADIK. Huruf paling depannya?",
    speakQuestion: "Saudara yang lebih muda disebut Adik. Huruf depannya adalah?",
    hint: "A - d - i - k",
    options: ["A", "I", "U", "E"],
    answer: "A",
  },
  {
    prompt: "🐊 Hewan bertubuh besar di sungai bernama ALIGATOR. Huruf depannya?",
    speakQuestion: "Hewan besar yang hidup di sungai bernama Aligator. Huruf pertamanya apa?",
    hint: "Huruf pertama abjad",
    options: ["A", "B", "D", "K"],
    answer: "A",
  },
];

export function buildLevel1Questions(letterStep: number): QuizQuestion[] {
  const safeStep = Math.max(0, Math.min(25, letterStep));
  if (safeStep === 0) {
    return LEVEL1_EXTRA_A_QUESTIONS;
  }

  const unlocked = ALPHABET_AZ.slice(0, safeStep + 1);
  const questions: QuizQuestion[] = [];

  // Ambil huruf terbaru + review huruf-huruf sebelumnya hingga total 8 soal
  for (let i = 0; i < 8; i++) {
    const target = unlocked[(unlocked.length - 1 - i + unlocked.length * 4) % unlocked.length];
    const distractors = ALPHABET_AZ.filter((x) => x.upper !== target.upper)
      .slice(0, 3)
      .map((x) => x.upper);
    const options = Array.from(new Set([target.upper, ...distractors])).slice(0, 4);
    questions.push({
      prompt: `${target.emoji} Benda ini bernama ${target.exampleWord.toUpperCase()}. Huruf depannya adalah...`,
      speakQuestion: `Perhatikan gambar dan nama ${target.exampleWord}. Huruf apakah yang ada di paling depan?`,
      hint: target.soundHint,
      options,
      answer: target.upper,
    });
  }
  return questions;
}

/**
 * Menghasilkan 8 soal tebak-tebakan kumulatif: soal baru + soal review dari huruf lama!
 */
export function buildCumulativeAQuestions(consonantLower: string): QuizQuestion[] {
  const sheet = buildVowelADrillSheet(consonantLower);
  const curSyl = `${sheet.consonant}a`;
  const item =
    CONSONANTS_BZ.find((c) => c.lower === sheet.consonant) ?? CONSONANTS_BZ[0];

  const prevChoices = CONSONANTS_BZ.slice(0, sheet.consonantIndex + 1).map(
    (c) => `${c.lower}a`
  );
  const filler = ["ba", "ca", "da", "ga", "ka", "ma", "sa", "za"];
  const optionSet = Array.from(
    new Set([curSyl, ...prevChoices.slice(-2), ...filler])
  ).slice(0, 4);

  const questions: QuizQuestion[] = [
    {
      prompt: `${item.emoji} Huruf baru! Jika huruf ${item.upper} ditambah vokal A, bunyinya adalah...`,
      speakQuestion: `Pertanyaan materi baru! Jika huruf ${item.upper} ditambah vokal A, dibacanya apa?`,
      hint: `Gabungan ${item.lower} + a`,
      options: optionSet,
      answer: curSyl,
    },
    {
      prompt: "🔁 Review Materi Awal: Huruf vokal pertama yang mulut terbuka lebar adalah...",
      speakQuestion:
        "Soal review materi lama agar tetap ingat! Huruf vokal pertama yang diucapkan dengan mulut terbuka lebar adalah?",
      hint: "Apel diawali huruf ini",
      options: ["a", "ba", "ca", "da"],
      answer: "a",
    },
    {
      prompt: `🔊 Gabungan suku kata ${curSyl.toUpperCase()} + A dibaca...`,
      speakQuestion: `Jika suku kata ${curSyl} diikuti huruf a, maka susunan tulisannya adalah?`,
      hint: `Tulis ${curSyl} lalu a`,
      options: [`${curSyl} a`, `a ${curSyl}`, `${curSyl} ${curSyl}`, "a a"],
      answer: `${curSyl} a`,
    },
    {
      prompt: `📖 Manakah pasangan suku kata yang sama dengan "${curSyl.toUpperCase()} ${curSyl.toUpperCase()}"?`,
      speakQuestion: `Pilih tulisan yang berbunyi ${curSyl} ${curSyl}.`,
      hint: "Dua suku kata yang kembar",
      options: [
        `${curSyl} ${curSyl}`,
        `a ${curSyl}`,
        `${curSyl} a`,
        "a a",
      ],
      answer: `${curSyl} ${curSyl}`,
    },
  ];

  // Tambahkan hingga 4 soal review konsonan lama + kata bermakna agar total 8 soal
  for (let back = 1; back <= 4; back++) {
    const olderIdx = Math.max(0, sheet.consonantIndex - back);
    const olderItem = CONSONANTS_BZ[olderIdx];
    const olderSyl = `${olderItem.lower}a`;
    const olderOpts = Array.from(
      new Set([olderSyl, curSyl, "a", "ba", "ca", "ma"])
    ).slice(0, 4);

    questions.push({
      prompt: `🔁 Review Materi Lama (${olderItem.emoji} ${olderItem.exampleWord}): Suku kata depan untuk "${olderItem.exampleWord}" berawalan ${olderItem.upper}+A yaitu...`,
      speakQuestion: `Soal review! Suku kata dari huruf ${olderItem.upper} dan A adalah?`,
      hint: `Huruf ${olderItem.upper} ditambah a`,
      options: olderOpts,
      answer: olderSyl,
    });
  }

  return questions;
}

export const DIGRAPH_DRILLS = [
  {
    id: "ng",
    label: "ng",
    syllables: ["nga", "ngi", "ngu", "nge", "ngo"],
    lines: ["a nga", "nga a", "nga ba", "bu nga", "si nga", "ngo ngi"],
  },
  {
    id: "ny",
    label: "ny",
    syllables: ["nya", "nyi", "nyu", "nye", "nyo"],
    lines: ["a nya", "nya a", "nya ba", "nya nyi", "nya mu", "nyo nyi"],
  },
  {
    id: "sy",
    label: "sy",
    syllables: ["sya", "syi", "syu", "sye", "syo"],
    lines: ["a sya", "sya a", "syu ku", "sya rat", "a syi", "syo sya"],
  },
  {
    id: "kh",
    label: "kh",
    syllables: ["kha", "khi", "khu", "khe", "kho"],
    lines: ["a kha", "kha a", "kha bar", "a khi", "khu sus", "kho kha"],
  },
];
