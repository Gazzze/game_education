/**
 * EnglishQuest - Game Data
 * Berisi semua bank soal dan konfigurasi data untuk setiap mini-game.
 *
 * Kategori kosakata: Animals, Colors, Numbers, Body, Food, School, Family, Actions
 */

const GameData = {
  //  VOCABULARY DATA — Word Match Game
  //  Setiap entri memiliki: kata (Inggris), arti (Indonesia),
  //  emoji visual, dan kategori.
  vocabulary: [
    // --- Animals (Hewan) ---
    { word: "CAT", meaning: "Kucing", emoji: "🐱", category: "Animals" },
    { word: "DOG", meaning: "Anjing", emoji: "🐶", category: "Animals" },
    { word: "BIRD", meaning: "Burung", emoji: "🐦", category: "Animals" },
    { word: "FISH", meaning: "Ikan", emoji: "🐟", category: "Animals" },
    { word: "RABBIT", meaning: "Kelinci", emoji: "🐰", category: "Animals" },
    { word: "TIGER", meaning: "Harimau", emoji: "🐯", category: "Animals" },
    { word: "ELEPHANT", meaning: "Gajah", emoji: "🐘", category: "Animals" },
    { word: "MONKEY", meaning: "Monyet", emoji: "🐒", category: "Animals" },
    { word: "HORSE", meaning: "Kuda", emoji: "🐴", category: "Animals" },
    { word: "DUCK", meaning: "Bebek", emoji: "🦆", category: "Animals" },

    // --- Colors (Warna) ---
    { word: "RED", meaning: "Merah", emoji: "🔴", category: "Colors" },
    { word: "BLUE", meaning: "Biru", emoji: "🔵", category: "Colors" },
    { word: "GREEN", meaning: "Hijau", emoji: "🟢", category: "Colors" },
    { word: "YELLOW", meaning: "Kuning", emoji: "🟡", category: "Colors" },
    { word: "WHITE", meaning: "Putih", emoji: "⬜", category: "Colors" },
    { word: "BLACK", meaning: "Hitam", emoji: "⬛", category: "Colors" },
    { word: "ORANGE", meaning: "Oranye", emoji: "🟠", category: "Colors" },
    { word: "PURPLE", meaning: "Ungu", emoji: "🟣", category: "Colors" },

    // --- Numbers (Angka) ---
    { word: "ONE", meaning: "Satu", emoji: "1️⃣", category: "Numbers" },
    { word: "TWO", meaning: "Dua", emoji: "2️⃣", category: "Numbers" },
    { word: "THREE", meaning: "Tiga", emoji: "3️⃣", category: "Numbers" },
    { word: "FOUR", meaning: "Empat", emoji: "4️⃣", category: "Numbers" },
    { word: "FIVE", meaning: "Lima", emoji: "5️⃣", category: "Numbers" },

    // --- Food (Makanan) ---
    { word: "APPLE", meaning: "Apel", emoji: "🍎", category: "Food" },
    { word: "BANANA", meaning: "Pisang", emoji: "🍌", category: "Food" },
    { word: "CAKE", meaning: "Kue", emoji: "🎂", category: "Food" },
    { word: "MILK", meaning: "Susu", emoji: "🥛", category: "Food" },
    { word: "BREAD", meaning: "Roti", emoji: "🍞", category: "Food" },
    { word: "EGG", meaning: "Telur", emoji: "🥚", category: "Food" },
    { word: "RICE", meaning: "Nasi", emoji: "🍚", category: "Food" },

    // --- Body Parts (Anggota Tubuh) ---
    { word: "EYE", meaning: "Mata", emoji: "👁️", category: "Body" },
    { word: "EAR", meaning: "Telinga", emoji: "👂", category: "Body" },
    { word: "HAND", meaning: "Tangan", emoji: "✋", category: "Body" },
    { word: "FOOT", meaning: "Kaki", emoji: "🦶", category: "Body" },
    { word: "NOSE", meaning: "Hidung", emoji: "👃", category: "Body" },
    { word: "MOUTH", meaning: "Mulut", emoji: "👄", category: "Body" },

    // --- School (Sekolah) ---
    { word: "BOOK", meaning: "Buku", emoji: "📚", category: "School" },
    { word: "PEN", meaning: "Pena", emoji: "🖊️", category: "School" },
    { word: "TABLE", meaning: "Meja", emoji: "🪑", category: "School" },
    { word: "CHAIR", meaning: "Kursi", emoji: "🪑", category: "School" },
    { word: "BAG", meaning: "Tas", emoji: "🎒", category: "School" },

    // --- Family (Keluarga) ---
    { word: "MOTHER", meaning: "Ibu", emoji: "👩", category: "Family" },
    { word: "FATHER", meaning: "Ayah", emoji: "👨", category: "Family" },
    {
      word: "SISTER",
      meaning: "Kakak/Adik Perempuan",
      emoji: "👧",
      category: "Family",
    },
    {
      word: "BROTHER",
      meaning: "Kakak/Adik Laki-laki",
      emoji: "👦",
      category: "Family",
    },

    // --- Actions (Kata Kerja) ---
    { word: "RUN", meaning: "Berlari", emoji: "🏃", category: "Actions" },
    { word: "JUMP", meaning: "Melompat", emoji: "🤸", category: "Actions" },
    { word: "SLEEP", meaning: "Tidur", emoji: "😴", category: "Actions" },
    { word: "EAT", meaning: "Makan", emoji: "🍽️", category: "Actions" },
    { word: "PLAY", meaning: "Bermain", emoji: "🎮", category: "Actions" },
    { word: "READ", meaning: "Membaca", emoji: "📖", category: "Actions" },
    { word: "WRITE", meaning: "Menulis", emoji: "✍️", category: "Actions" },
    { word: "SWIM", meaning: "Berenang", emoji: "🏊", category: "Actions" },
  ],

  //  SPELLING DATA — Spell It! Game
  //  Pemain menyusun huruf acak menjadi kata yang benar.
  //  Setiap entri punya petunjuk (hint) dan emoji.
  spelling: [
    { word: "CAT", hint: "Hewan peliharaan yang suka tidur", emoji: "🐱" },
    { word: "DOG", hint: "Sahabat setia manusia", emoji: "🐶" },
    { word: "SUN", hint: "Bintang yang selalu menyinari Bumi", emoji: "☀️" },
    { word: "MOON", hint: "Terlihat di malam hari", emoji: "🌙" },
    { word: "STAR", hint: "Bersinar di langit malam", emoji: "⭐" },
    { word: "RAIN", hint: "Air yang turun dari awan", emoji: "🌧️" },
    { word: "TREE", hint: "Tanaman besar dengan akar yang kuat", emoji: "🌳" },
    { word: "CAKE", hint: "Makanan manis untuk ulang tahun", emoji: "🎂" },
    { word: "FISH", hint: "Hewan yang hidup di air", emoji: "🐟" },
    { word: "BIRD", hint: "Hewan yang bisa terbang", emoji: "🐦" },
    { word: "FROG", hint: "Hewan hijau yang suka melompat", emoji: "🐸" },
    { word: "LION", hint: "Raja hutan", emoji: "🦁" },
    { word: "BEAR", hint: "Hewan besar berbulu tebal", emoji: "🐻" },
    { word: "BOOK", hint: "Tempat kita belajar membaca", emoji: "📚" },
    { word: "BALL", hint: "Benda bulat untuk bermain", emoji: "⚽" },
    { word: "HAND", hint: "Bagian tubuh untuk memegang benda", emoji: "✋" },
    { word: "FOOT", hint: "Digunakan untuk berjalan", emoji: "🦶" },
    { word: "MILK", hint: "Minuman putih dari sapi", emoji: "🥛" },
    { word: "RICE", hint: "Makanan pokok orang Indonesia", emoji: "🍚" },
    { word: "JUMP", hint: "Melambung ke atas", emoji: "🤸" },
    { word: "SWIM", hint: "Bergerak di dalam air", emoji: "🏊" },
    { word: "BLUE", hint: "Warna langit cerah", emoji: "🔵" },
    { word: "PINK", hint: "Warna campuran merah dan putih", emoji: "🌸" },
    { word: "PLAY", hint: "Bersenang-senang bersama teman", emoji: "🎮" },
    { word: "SLEEP", hint: "Beristirahat dengan memejamkan mata", emoji: "😴" },
    { word: "APPLE", hint: "Buah merah yang renyah dan manis", emoji: "🍎" },
    { word: "GRAPE", hint: "Buah ungu berbentuk kecil-kecil", emoji: "🍇" },
    {
      word: "TIGER",
      hint: "Kucing besar berbelang hitam dan oranye",
      emoji: "🐯",
    },
    { word: "SNAKE", hint: "Hewan melata yang tidak berkaki", emoji: "🐍" },
    { word: "HORSE", hint: "Hewan yang bisa ditunggangi", emoji: "🐴" },
  ],

  //  SENTENCE DATA — Sentence Builder Game
  //  Pemain menyusun kata-kata acak menjadi kalimat yang benar.
  //  'words' adalah array kata yang akan diacak.
  //  'answer' adalah urutan yang benar (dipakai untuk pengecekan).
  sentences: [
    {
      words: ["I", "have", "a", "cat"],
      answer: "I have a cat",
      meaning: "Saya punya seekor kucing",
      hint: "🐱",
    },
    {
      words: ["She", "likes", "to", "read", "books"],
      answer: "She likes to read books",
      meaning: "Dia suka membaca buku",
      hint: "📚",
    },
    {
      words: ["The", "dog", "is", "big"],
      answer: "The dog is big",
      meaning: "Anjing itu besar",
      hint: "🐶",
    },
    {
      words: ["I", "love", "my", "family"],
      answer: "I love my family",
      meaning: "Saya mencintai keluargaku",
      hint: "👨‍👩‍👧",
    },
    {
      words: ["She", "eats", "an", "apple"],
      answer: "She eats an apple",
      meaning: "Dia makan sebuah apel",
      hint: "🍎",
    },
    {
      words: ["We", "go", "to", "school"],
      answer: "We go to school",
      meaning: "Kita pergi ke sekolah",
      hint: "🏫",
    },
    {
      words: ["He", "can", "swim", "fast"],
      answer: "He can swim fast",
      meaning: "Dia bisa berenang cepat",
      hint: "🏊",
    },
    {
      words: ["The", "sun", "is", "bright"],
      answer: "The sun is bright",
      meaning: "Matahari itu terang",
      hint: "☀️",
    },
    {
      words: ["I", "drink", "cold", "milk"],
      answer: "I drink cold milk",
      meaning: "Saya minum susu dingin",
      hint: "🥛",
    },
    {
      words: ["They", "play", "in", "the", "park"],
      answer: "They play in the park",
      meaning: "Mereka bermain di taman",
      hint: "🌳",
    },
    {
      words: ["My", "mother", "is", "kind"],
      answer: "My mother is kind",
      meaning: "Ibuku baik hati",
      hint: "👩",
    },
    {
      words: ["The", "bird", "can", "fly"],
      answer: "The bird can fly",
      meaning: "Burung itu bisa terbang",
      hint: "🐦",
    },
    {
      words: ["I", "have", "two", "hands"],
      answer: "I have two hands",
      meaning: "Saya punya dua tangan",
      hint: "✋",
    },
    {
      words: ["She", "sings", "a", "happy", "song"],
      answer: "She sings a happy song",
      meaning: "Dia menyanyikan lagu yang ceria",
      hint: "🎵",
    },
    {
      words: ["The", "cat", "drinks", "milk"],
      answer: "The cat drinks milk",
      meaning: "Kucing itu minum susu",
      hint: "🐱",
    },
  ],

  //  LISTENING DATA — Listen & Pick Game
  //  Pemain mendengarkan kata via TTS lalu memilih jawaban.
  //  'options' berisi 4 pilihan, satu di antaranya adalah 'word'.
  listening: [
    {
      word: "APPLE",
      options: ["Apple", "Orange", "Banana", "Grape"],
      emoji: "🍎",
      meaning: "Apel",
    },
    {
      word: "ELEPHANT",
      options: ["Tiger", "Lion", "Elephant", "Horse"],
      emoji: "🐘",
      meaning: "Gajah",
    },
    {
      word: "RAINBOW",
      options: ["Sunny", "Rainbow", "Thunder", "Cloud"],
      emoji: "🌈",
      meaning: "Pelangi",
    },
    {
      word: "BUTTERFLY",
      options: ["Butterfly", "Bee", "Ant", "Spider"],
      emoji: "🦋",
      meaning: "Kupu-kupu",
    },
    {
      word: "STRAWBERRY",
      options: ["Mango", "Strawberry", "Lemon", "Peach"],
      emoji: "🍓",
      meaning: "Stroberi",
    },
    {
      word: "CHOCOLATE",
      options: ["Candy", "Chocolate", "Cookie", "Cake"],
      emoji: "🍫",
      meaning: "Cokelat",
    },
    {
      word: "UMBRELLA",
      options: ["Raincoat", "Hat", "Umbrella", "Scarf"],
      emoji: "☂️",
      meaning: "Payung",
    },
    {
      word: "BICYCLE",
      options: ["Car", "Bus", "Bicycle", "Train"],
      emoji: "🚲",
      meaning: "Sepeda",
    },
    {
      word: "MOUNTAIN",
      options: ["Ocean", "Mountain", "Valley", "Desert"],
      emoji: "⛰️",
      meaning: "Gunung",
    },
    {
      word: "HOSPITAL",
      options: ["School", "Market", "Hospital", "Library"],
      emoji: "🏥",
      meaning: "Rumah Sakit",
    },
    {
      word: "DOCTOR",
      options: ["Teacher", "Doctor", "Pilot", "Chef"],
      emoji: "👨‍⚕️",
      meaning: "Dokter",
    },
    {
      word: "TELEPHONE",
      options: ["Computer", "Telephone", "Camera", "Radio"],
      emoji: "📞",
      meaning: "Telepon",
    },
    {
      word: "GARDEN",
      options: ["Forest", "Garden", "Farm", "Park"],
      emoji: "🏡",
      meaning: "Kebun",
    },
    {
      word: "HAPPY",
      options: ["Sad", "Angry", "Happy", "Scared"],
      emoji: "😊",
      meaning: "Senang",
    },
    {
      word: "BEAUTIFUL",
      options: ["Ugly", "Beautiful", "Small", "Heavy"],
      emoji: "💐",
      meaning: "Cantik/Indah",
    },
  ],

  //  QUIZ DATA — Quick Quiz Game
  //  Kuis pilihan ganda campuran semua materi.
  //  'answer' harus sama persis (case-sensitive) dengan salah satu 'options'.
  quiz: [
    {
      question: 'What is the English word for "Kucing"?',
      options: ["Dog", "Cat", "Bird", "Fish"],
      answer: "Cat",
      emoji: "🐱",
    },
    {
      question: "What color is the sky on a clear day?",
      options: ["Red", "Green", "Blue", "Yellow"],
      answer: "Blue",
      emoji: "🌤️",
    },
    {
      question: "How many legs does a dog have?",
      options: ["Two", "Four", "Six", "Eight"],
      answer: "Four",
      emoji: "🐶",
    },
    {
      question: "What do we use to write?",
      options: ["Book", "Pen", "Bag", "Table"],
      answer: "Pen",
      emoji: "✏️",
    },
    {
      question: '"Apel" in English is...?',
      options: ["Orange", "Banana", "Apple", "Grape"],
      answer: "Apple",
      emoji: "🍎",
    },
    {
      question: "Which animal can fly?",
      options: ["Dog", "Cat", "Fish", "Bird"],
      answer: "Bird",
      emoji: "🦅",
    },
    {
      question: 'What is "Buku" in English?',
      options: ["Pen", "Book", "Bag", "Chair"],
      answer: "Book",
      emoji: "📚",
    },
    {
      question: "The color of the sun is...?",
      options: ["Blue", "Green", "Yellow", "Red"],
      answer: "Yellow",
      emoji: "☀️",
    },
    {
      question: '"Berlari" in English is...?',
      options: ["Jump", "Sleep", "Run", "Swim"],
      answer: "Run",
      emoji: "🏃",
    },
    {
      question: "Which one is a fruit?",
      options: ["Pen", "Book", "Banana", "Chair"],
      answer: "Banana",
      emoji: "🍌",
    },
    {
      question: "What is the number after FOUR?",
      options: ["Three", "Five", "Six", "Two"],
      answer: "Five",
      emoji: "5️⃣",
    },
    {
      question: "Your mother's son is your...?",
      options: ["Sister", "Father", "Brother", "Uncle"],
      answer: "Brother",
      emoji: "👦",
    },
    {
      question: "We use our _____ to see.",
      options: ["Ears", "Nose", "Eyes", "Hands"],
      answer: "Eyes",
      emoji: "👀",
    },
    {
      question: '"Matahari" in English is...?',
      options: ["Moon", "Star", "Sun", "Sky"],
      answer: "Sun",
      emoji: "☀️",
    },
    {
      question: "Which animal lives in water?",
      options: ["Tiger", "Eagle", "Fish", "Monkey"],
      answer: "Fish",
      emoji: "🐠",
    },
    {
      question: "What do we drink when we are thirsty?",
      options: ["Food", "Water", "Book", "Air"],
      answer: "Water",
      emoji: "💧",
    },
    {
      question: 'The opposite of "big" is...?',
      options: ["Large", "Long", "Small", "Heavy"],
      answer: "Small",
      emoji: "🔍",
    },
    {
      question: '"Sekolah" in English is...?',
      options: ["Hospital", "Library", "School", "Market"],
      answer: "School",
      emoji: "🏫",
    },
    {
      question: "Which color is a banana?",
      options: ["Red", "Blue", "Green", "Yellow"],
      answer: "Yellow",
      emoji: "🍌",
    },
    {
      question: "We _____ at night to rest.",
      options: ["Run", "Sleep", "Swim", "Jump"],
      answer: "Sleep",
      emoji: "😴",
    },
  ],

  //  ACHIEVEMENTS
  //  Sistem pencapaian berdasarkan statistik pemain.
  //  'condition' adalah fungsi yang menerima stats dan
  //  mengembalikan true/false apakah achievement sudah terbuka.
  achievements: [
    {
      id: "first_game",
      icon: "🎮",
      title: "First Step",
      desc: "Mainkan game pertamamu",
      condition: (stats) => stats.gamesPlayed >= 1,
    },
    {
      id: "perfect",
      icon: "💯",
      title: "Perfect!",
      desc: "Raih skor 100% di satu game",
      condition: (stats) => stats.perfectGames >= 1,
    },
    {
      id: "vocab_master",
      icon: "📚",
      title: "Vocab Master",
      desc: "Selesaikan Word Match 3x",
      condition: (stats) => stats.vocabPlayed >= 3,
    },
    {
      id: "spell_wizard",
      icon: "✨",
      title: "Spell Wizard",
      desc: "Selesaikan Spell It! 3x",
      condition: (stats) => stats.spellingPlayed >= 3,
    },
    {
      id: "grammar_pro",
      icon: "🧩",
      title: "Grammar Pro",
      desc: "Selesaikan Sentence Builder 3x",
      condition: (stats) => stats.sentencePlayed >= 3,
    },
    {
      id: "listener",
      icon: "👂",
      title: "Great Listener",
      desc: "Selesaikan Listen & Pick 3x",
      condition: (stats) => stats.listeningPlayed >= 3,
    },
    {
      id: "quiz_champ",
      icon: "🎯",
      title: "Quiz Champion",
      desc: "Selesaikan Quick Quiz 5x",
      condition: (stats) => stats.quizPlayed >= 5,
    },
    {
      id: "star_collector",
      icon: "⭐",
      title: "Star Collector",
      desc: "Kumpulkan total 15 bintang",
      condition: (stats) => stats.totalStars >= 15,
    },
    {
      id: "xp_100",
      icon: "⚡",
      title: "Power Up!",
      desc: "Kumpulkan 100 XP",
      condition: (stats) => stats.xp >= 100,
    },
    {
      id: "xp_500",
      icon: "🏆",
      title: "Champion",
      desc: "Kumpulkan 500 XP",
      condition: (stats) => stats.xp >= 500,
    },
  ],

  //  MASCOT TIPS
  //  Pesan motivasi yang berputar di speech bubble maskot.
  tips: [
    "Practice every day to improve faster! 📅",
    "Don't worry about mistakes – they help you learn! 😊",
    "Try to use new words in a sentence! 💬",
    "Listen carefully to how words are pronounced! 👂",
    "Reading books helps you learn new words! 📚",
    "Great job! Keep going! 🚀",
    "You can do it! 💪",
    "Spelling practice makes perfect! ✏️",
    "Every word you learn is a superpower! ⚡",
    "Learning English opens doors to the world! 🌍",
  ],
};

/**
 * Acak urutan elemen array menggunakan algoritma Fisher-Yates.
 * Membuat salinan baru agar array asli tidak berubah.
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Ambil sejumlah elemen secara acak dari sebuah array.
 * Dipakai untuk memilih soal secara random setiap sesi game.
 */
function getRandomItems(arr, count) {
  return shuffleArray(arr).slice(0, count);
}

/**
 * Sanitasi input string dari pengguna untuk mencegah XSS.
 * Karakter HTML berbahaya (< > & " ') dikonversi ke entitas HTML.
 * Dibatasi maksimal 100 karakter.
 */
function sanitizeInput(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim()
    .substring(0, 100);
}
