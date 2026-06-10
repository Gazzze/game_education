//  PLAYER DATA MANAGER
//  Menyimpan semua data pemain ke localStorage agar tidak hilang
const PlayerData = (() => {
  // Kunci yang dipakai untuk menyimpan data di localStorage
  const STORAGE_KEY = "englishquest_data";

  // Nilai default jika belum ada data tersimpan
  function getDefault() {
    return {
      name: "Player",
      avatar: "🦁",
      level: 1,
      xp: 0,
      totalStars: 0,
      gamesPlayed: 0,
      perfectGames: 0,
      // Counter per jenis game (untuk achievement)
      vocabPlayed: 0,
      spellingPlayed: 0,
      sentencePlayed: 0,
      listeningPlayed: 0,
      quizPlayed: 0,
      // Skor terbaik per game type
      bestScores: {},
      // Papan skor lokal
      leaderboard: [],
      // Persentase kemajuan per skill
      progress: {
        vocabulary: 0,
        spelling: 0,
        sentence: 0,
        listening: 0,
      },
    };
  }

  // Membaca data dari localStorage, gabungkan dengan default
  // agar tidak error saat ada field baru yang belum ada di data lama
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefault();
      const parsed = JSON.parse(raw);
      // Merge dengan default supaya field baru tidak undefined
      return { ...getDefault(), ...parsed };
    } catch (e) {
      // Jika data localStorage rusak/korup, pakai default
      console.warn("Data pemain gagal dibaca, menggunakan default:", e);
      return getDefault();
    }
  }

  // Menyimpan data ke localStorage
  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Gagal menyimpan data:", e);
    }
  }

  // Getter sederhana
  function get() {
    return load();
  }
  function getStats() {
    return load();
  }
  function getName() {
    return load().name;
  }
  function getAvatar() {
    return load().avatar;
  }

  // Simpan nama dan avatar pemain
  function setPlayer(name, avatar) {
    const data = load();
    // Sanitasi nama sebelum disimpan (mencegah XSS)
    data.name = sanitizeInput(name) || "Player";
    data.avatar = avatar || "🦁";
    save(data);
  }

  // Tambah XP dan hitung apakah pemain naik level
  function addXP(amount) {
    const data = load();
    data.xp += amount;

    const xpPerLevel = 100;
    const newLevel = Math.floor(data.xp / xpPerLevel) + 1;
    const leveledUp = newLevel > data.level;
    data.level = newLevel;

    save(data);
    return { leveledUp, newLevel };
  }

  // Catat hasil game setelah pemain selesai bermain
  function recordGameResult(gameType, stars, score, totalQ, correctQ) {
    const data = load();

    data.gamesPlayed++;
    data.totalStars = (data.totalStars || 0) + stars;

    // Tandai perfect game jika semua soal benar
    if (correctQ === totalQ) data.perfectGames++;

    // Tambah counter untuk game yang dimainkan
    const counterMap = {
      vocabulary: "vocabPlayed",
      spelling: "spellingPlayed",
      sentence: "sentencePlayed",
      listening: "listeningPlayed",
      quiz: "quizPlayed",
    };
    if (counterMap[gameType]) {
      data[counterMap[gameType]] = (data[counterMap[gameType]] || 0) + 1;
    }

    // Simpan skor terbaik per game type
    if (!data.bestScores) data.bestScores = {};
    if (!data.bestScores[gameType] || score > data.bestScores[gameType]) {
      data.bestScores[gameType] = score;
    }

    // Update progress (ambil nilai tertinggi antara lama vs baru)
    if (!data.progress) data.progress = {};
    const progressMap = {
      vocabulary: "vocabulary",
      spelling: "spelling",
      sentence: "sentence",
      listening: "listening",
      quiz: "vocabulary", // quiz turut meningkatkan progress vocabulary
    };
    const progressKey = progressMap[gameType];
    if (progressKey) {
      const newPct = Math.round((correctQ / totalQ) * 100);
      data.progress[progressKey] = Math.min(
        100,
        Math.max(data.progress[progressKey] || 0, newPct),
      );
    }

    // Update leaderboard lokal
    if (!data.leaderboard) data.leaderboard = [];
    const entry = data.leaderboard.find((e) => e.name === data.name);
    if (entry) {
      // Update data pemain yang sudah ada di leaderboard
      entry.stars = data.totalStars;
      entry.xp = data.xp;
      entry.avatar = data.avatar;
    } else {
      // Tambah pemain baru ke leaderboard
      data.leaderboard.push({
        name: data.name,
        avatar: data.avatar,
        stars: data.totalStars,
        xp: data.xp,
      });
    }
    // Urutkan berdasarkan bintang, lalu XP sebagai tiebreaker
    data.leaderboard.sort((a, b) => b.stars - a.stars || b.xp - a.xp);

    save(data);
    return data;
  }

  function getLeaderboard() {
    return load().leaderboard || [];
  }

  return {
    get,
    getStats,
    getName,
    getAvatar,
    setPlayer,
    addXP,
    recordGameResult,
    getLeaderboard,
  };
})();

//  Mengontrol logika inti game: timer, skor, nyawa, feedback, dan transisi ke layar hasil.
const GameEngine = (() => {
  // State game saat ini
  let currentGame = null;
  let lives = 3;
  let timerInterval = null;
  let timeLeft = 30;
  let totalTime = 30;
  let combo = 0; // streak jawaban benar berturut-turut
  let currentScore = 0;

  // Mulai game baru berdasarkan tipe yang dipilih
  function start(gameType) {
    currentGame = gameType;
    lives = 3;
    combo = 0;
    currentScore = 0;

    // Reset tampilan HUD
    updateLives();
    updateScore(0);
    showScreen("game-screen");

    // Judul game yang muncul di topbar
    const titles = {
      vocabulary: "📚 Word Match",
      spelling: "✏️ Spell It!",
      sentence: "🧩 Sentence Builder",
      listening: "🎵 Listen & Pick",
      quiz: "🎯 Quick Quiz",
    };
    document.getElementById("game-title-bar").textContent =
      titles[gameType] || gameType;

    AudioEngine.play("start");

    // Panggil init() dari masing-masing modul game
    switch (gameType) {
      case "vocabulary":
        VocabularyGame.init();
        break;
      case "spelling":
        SpellingGame.init();
        break;
      case "sentence":
        SentenceGame.init();
        break;
      case "listening":
        ListeningGame.init();
        break;
      case "quiz":
        QuizGame.init();
        break;
    }
  }

  // Update tampilan nomor soal di topbar (misal: "3 / 10")
  function updateCounter(current, total) {
    const el = document.getElementById("q-counter");
    if (el) el.textContent = `${current} / ${total}`;
  }

  // Update tampilan skor di HUD
  function updateScore(score) {
    currentScore = score;
    const el = document.getElementById("current-score");
    if (el) el.textContent = score;
  }

  // Mulai countdown timer
  // onExpire dipanggil saat waktu habis
  function startTimer(seconds, onExpire) {
    clearInterval(timerInterval);
    timeLeft = seconds;
    totalTime = seconds;
    updateTimerUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (onExpire) onExpire();
      }
    }, 1000);
  }

  // Hentikan timer (dipanggil saat pemain menjawab)
  function stopTimer() {
    clearInterval(timerInterval);
  }

  // Update tampilan timer (angka + progress bar bawah)
  function updateTimerUI() {
    const timerEl = document.getElementById("timer-display");
    if (timerEl) {
      timerEl.textContent = `⏱ ${timeLeft}`;
      // Warna merah saat waktu hampir habis
      timerEl.style.color = timeLeft <= 5 ? "#FF6B6B" : "";
    }

    const strip = document.getElementById("timer-strip");
    if (strip) {
      strip.style.width = `${(timeLeft / totalTime) * 100}%`;
      strip.style.transition = "width 1s linear";
      // Strip merah saat waktu kritis
      if (timeLeft <= 5) {
        strip.style.background = "linear-gradient(90deg, #FF6B6B, #FF4444)";
      } else {
        strip.style.background = "";
      }
    }
  }

  // Kurangi nyawa saat jawaban salah.
  // Mengembalikan true jika nyawa habis (game over).
  function loseLife() {
    if (lives > 0) lives--;
    updateLives();
    return lives === 0; // true = game over
  }

  // Render tampilan nyawa (❤️ = sisa, 🖤 = hilang)
  function updateLives() {
    const el = document.getElementById("lives-display");
    if (el) {
      el.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
    }
  }

  // Hitung poin per jawaban
  // Bonus: +waktu tersisa, +combo streak
  function calculatePoints(isCorrect) {
    if (!isCorrect) {
      combo = 0; // reset streak saat salah
      return 0;
    }
    combo++;
    const base = 100;
    const timeBonus = timeLeft;
    const comboBonus = combo > 1 ? Math.floor(base * 0.1 * (combo - 1)) : 0;
    return base + timeBonus + comboBonus;
  }

  // Tampilkan overlay feedback benar/salah sebentar
  function showFeedback(isCorrect, message) {
    const overlay = document.getElementById("feedback-overlay");
    const box = document.getElementById("feedback-box");
    const icon = document.getElementById("feedback-icon");
    const msg = document.getElementById("feedback-msg");

    if (!overlay) return;

    overlay.style.display = "flex";
    box.className = "feedback-box " + (isCorrect ? "correct" : "wrong");
    icon.textContent = isCorrect ? "✅" : "❌";
    msg.textContent = message;

    // Sembunyikan otomatis setelah 1 detik
    setTimeout(() => {
      overlay.style.display = "none";
    }, 1000);
  }

  // Dipanggil setiap game selesai — hitung bintang, XP, tampilkan hasil
  function endGame({ score, correct, total, startTime }) {
    stopTimer();

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const pct = correct / total;

    // Hitung bintang berdasarkan persentase benar
    const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0;
    const xpGain = stars * 25 + correct * 5;

    // Simpan hasil ke data pemain
    PlayerData.recordGameResult(currentGame, stars, score, total, correct);
    const { leveledUp, newLevel } = PlayerData.addXP(xpGain);

    // Simpan bintang terbaik per game ke localStorage
    const bestStars = Math.max(
      parseInt(localStorage.getItem(`stars_${currentGame}`) || "0"),
      stars,
    );
    localStorage.setItem(`stars_${currentGame}`, bestStars);

    // Tampilkan layar hasil
    showScreen("result-screen");

    // Pilih trophy berdasarkan persentase benar
    const trophy =
      pct === 1
        ? "🏆"
        : pct >= 0.8
          ? "🎖️"
          : pct >= 0.6
            ? "🥈"
            : pct >= 0.4
              ? "🥉"
              : "📝";
    document.getElementById("result-trophy").textContent = trophy;

    // Judul hasil
    const title =
      pct === 1
        ? "PERFECT! 🎉"
        : pct >= 0.8
          ? "Excellent! 🌟"
          : pct >= 0.6
            ? "Good Job! 👍"
            : pct >= 0.4
              ? "Keep Going! 💪"
              : "Try Again! 📚";
    document.getElementById("result-title").textContent = title;
    document.getElementById("result-subtitle").textContent =
      `${correct} dari ${total} soal benar`;

    // Isi statistik hasil
    document.getElementById("res-score").textContent = score;
    document.getElementById("res-stars").textContent =
      "⭐".repeat(stars) || "☆☆☆";
    document.getElementById("res-correct").textContent = `${correct}/${total}`;
    document.getElementById("res-time").textContent = `${elapsed}s`;
    document.getElementById("result-stars-row").textContent =
      "⭐".repeat(stars) + "☆".repeat(3 - stars);
    document.getElementById("result-xp-gain").textContent =
      `+${xpGain} XP gained!`;

    // Putar suara dan efek fireworks sesuai hasil
    if (stars > 0) {
      AudioEngine.play(stars === 3 ? "level_up" : "coin");
      Fireworks.start();
    } else {
      AudioEngine.play("wrong");
    }

    // Notifikasi level up (ditunda agar tidak menimpa animasi hasil)
    if (leveledUp) {
      setTimeout(
        () => showToast(`🎉 Level Up! Kamu sekarang Level ${newLevel}!`),
        1500,
      );
      setTimeout(() => AudioEngine.play("level_up"), 1500);
    }

    // Cek achievement yang baru terbuka
    const stats = PlayerData.getStats();
    const newlyUnlocked = GameData.achievements.filter((a) =>
      a.condition(stats),
    );
    if (newlyUnlocked.length > 0) {
      setTimeout(() => {
        showToast(`🏅 Achievement Unlocked: ${newlyUnlocked[0].title}!`);
        AudioEngine.play("coin");
      }, 2500);
    }
  }

  function getCurrentGame() {
    return currentGame;
  }

  // Getter skor saat ini (dipakai oleh modul game jika perlu referensi skor live)
  function getCurrentScore() {
    return currentScore;
  }

  // Paksa game berakhir karena nyawa habis.
  // Dipanggil dari modul game setelah loseLife() mengembalikan true.
  // Menerima data sesi saat ini agar layar hasil tetap menampilkan statistik.
  function gameOver({ score, correct, total, startTime }) {
    stopTimer();
    AudioEngine.play("wrong");
    showToast("💀 Nyawa habis! Game Over!");

    // Tampilkan layar hasil setelah jeda singkat agar toast sempat terbaca
    setTimeout(() => {
      endGame({ score, correct, total, startTime });
    }, 800);
  }

  return {
    start,
    updateCounter,
    updateScore,
    startTimer,
    stopTimer,
    loseLife,
    calculatePoints,
    showFeedback,
    endGame,
    gameOver,
    getCurrentGame,
    getCurrentScore,
  };
})();

//  SCREEN MANAGER
//  Mengatur perpindahan antar layar (loading, home, game, result)
function showScreen(id) {
  // Sembunyikan semua layar
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
    if (screen.id !== "loading-screen") screen.style.display = "";
  });

  // Tampilkan layar yang dituju
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    if (id !== "loading-screen") target.style.display = "block";
  }

  window.scrollTo(0, 0);
}

//  Modal untuk memasukkan nama dan memilih avatar di awal
let selectedAvatar = "🦁"; // avatar default

function showPlayerSetup() {
  AudioEngine.play("click");

  // Isi nama sebelumnya jika sudah pernah disimpan
  const savedName = PlayerData.getName();
  const input = document.getElementById("player-name-input");
  if (input && savedName !== "Player") input.value = savedName;

  document.getElementById("player-setup-modal").style.display = "flex";
}

// Dipanggil saat pemain mengklik salah satu emoji avatar
function selectAvatar(el, avatar) {
  selectedAvatar = avatar;
  // Hapus highlight dari semua pilihan lalu tandai yang dipilih
  document
    .querySelectorAll(".avatar-opt")
    .forEach((a) => a.classList.remove("selected"));
  el.classList.add("selected");
  AudioEngine.play("click");
}

// Dipanggil saat tombol "Let's Go!" diklik
function confirmPlayer() {
  const input = document.getElementById("player-name-input");
  const name = input ? input.value.trim() : "";

  // Validasi: nama tidak boleh kosong
  if (!name || name.length < 1) {
    input.style.borderColor = "var(--primary)";
    input.placeholder = "Nama tidak boleh kosong!";
    setTimeout(() => {
      input.style.borderColor = "";
      input.placeholder = "Masukkan namamu...";
    }, 2000);
    return;
  }

  // Simpan data pemain
  PlayerData.setPlayer(name, selectedAvatar);
  document.getElementById("player-setup-modal").style.display = "none";

  // Refresh UI home dan tampilkan sapaan
  updateHomeUI();
  showToast(`Halo ${sanitizeInput(name)}! Siap belajar? 🚀`);
  AudioEngine.play("start");

  // Update avatar maskot dengan pilihan pemain
  const avatarEl = document.getElementById("mascot-avatar");
  if (avatarEl) avatarEl.textContent = selectedAvatar;

  // Tampilkan tips random di speech bubble maskot
  const bubble = document.getElementById("mascot-bubble");
  if (bubble && GameData.tips) {
    const tips = GameData.tips;
    bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
  }
}

function updateHomeUI() {
  const data = PlayerData.get();

  // Nama, level, dan total bintang di navbar
  const nameEl = document.getElementById("player-name-display");
  const levelEl = document.getElementById("player-level");
  const starsEl = document.getElementById("total-stars");
  if (nameEl) nameEl.textContent = sanitizeInput(data.name);
  if (levelEl) levelEl.textContent = data.level;
  if (starsEl) starsEl.textContent = data.totalStars || 0;

  // Progress bar per skill
  const progress = data.progress || {};
  ["vocabulary", "spelling", "sentence", "listening"].forEach((key) => {
    const pct = progress[key] || 0;
    const bar = document.getElementById(`prog-${key}`);
    const label = document.getElementById(`pct-${key}`);
    if (bar) bar.style.width = pct + "%";
    if (label) label.textContent = pct + "%";
  });

  // XP bar (hitung XP dalam level saat ini saja, bukan total)
  const xpPerLevel = 100;
  const xpInLevel = (data.xp || 0) % xpPerLevel;
  const xpPct = (xpInLevel / xpPerLevel) * 100;
  const xpBar = document.getElementById("xp-bar");
  const xpLabel = document.getElementById("xp-label");
  if (xpBar) xpBar.style.width = xpPct + "%";
  if (xpLabel) xpLabel.textContent = `${xpInLevel} / ${xpPerLevel} XP`;

  // Tampilkan bintang terbaik di kartu game
  ["vocabulary", "spelling", "sentence", "listening", "quiz"].forEach((key) => {
    const best = parseInt(localStorage.getItem(`stars_${key}`) || "0");
    const el = document.getElementById(`stars-${key}`);
    if (el) el.textContent = "⭐".repeat(best) + "☆".repeat(3 - best);
  });

  // Counter achievement yang sudah terbuka
  const stats = PlayerData.getStats();
  const unlocked = GameData.achievements.filter((a) =>
    a.condition(stats),
  ).length;
  const achEl = document.getElementById("ach-count");
  if (achEl)
    achEl.textContent = `${unlocked} / ${GameData.achievements.length}`;

  // Avatar maskot
  const avatarEl = document.getElementById("mascot-avatar");
  if (avatarEl) avatarEl.textContent = data.avatar || "🦁";
}

// Mulai game saat kartu game diklik
function startGame(type) {
  AudioEngine.play("click");
  GameEngine.start(type);
}

// Kembali ke halaman utama
function goHome() {
  AudioEngine.play("click");
  AudioEngine.stopVisualizer();
  Fireworks.stop();
  showScreen("home-screen");
  updateHomeUI();
  BgCanvas.init();
  AudioEngine.startVisualizer();
}

// Main ulang game yang terakhir dimainkan
function replayGame() {
  AudioEngine.play("click");
  const game = GameEngine.getCurrentGame();
  if (game) GameEngine.start(game);
}

// Nyalakan/matikan suara
function toggleSound() {
  const enabled = AudioEngine.toggleSound();
  showToast(enabled ? "🔊 Suara Aktif" : "🔇 Suara Mati");
}

//  Animasi loading bar saat aplikasi pertama dibuka
function runLoadingScreen() {
  const bar = document.getElementById("loading-bar");
  let progress = 0;

  // Safety timeout: paksa lanjut ke home setelah 5 detik
  // (jaga-jaga jika ada resource yang lambat dimuat)
  const safetyTimer = setTimeout(() => finishLoading(), 5000);

  const interval = setInterval(() => {
    // Tambah progress secara acak agar terlihat natural
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      clearTimeout(safetyTimer);
      setTimeout(finishLoading, 400); // sedikit jeda sebelum pindah
    }
    if (bar) bar.style.width = progress + "%";
  }, 100);
}

// Sembunyikan loading screen dan tampilkan home screen
function finishLoading() {
  const loadingEl = document.getElementById("loading-screen");
  if (loadingEl) {
    loadingEl.classList.remove("active");
    loadingEl.style.display = "none";
  }

  const homeEl = document.getElementById("home-screen");
  if (homeEl) {
    homeEl.classList.add("active");
    homeEl.style.display = "block";
  }

  window.scrollTo(0, 0);

  // Inisialisasi komponen background (pakai try-catch agar aman)
  try {
    BgCanvas.init();
  } catch (e) {
    console.warn("BgCanvas error:", e);
  }
  try {
    AudioEngine.startVisualizer();
  } catch (e) {
    console.warn("Visualizer error:", e);
  }
  try {
    updateHomeUI();
  } catch (e) {
    console.warn("updateHomeUI error:", e);
  }

  // Rotasi tips maskot setiap 5 detik
  const bubble = document.getElementById("mascot-bubble");
  if (bubble && GameData && GameData.tips) {
    setInterval(() => {
      const tips = GameData.tips;
      bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
    }, 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Mulai animasi loading
  runLoadingScreen();

  // Tutup modal jika klik di luar area modal (klik overlay)
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });
  });

  // Tutup semua modal dengan tombol Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach((m) => {
        if (m.style.display !== "none") m.style.display = "none";
      });
    }
  });

  // Inisialisasi AudioContext saat pertama kali ada interaksi user
  // (wajib oleh browser modern, tidak bisa autoplay sebelum user klik)
  document.addEventListener(
    "click",
    () => {
      AudioEngine.init();
    },
    { once: true },
  );
});
