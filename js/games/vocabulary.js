/**
 * EnglishQuest - Word Match Game (Vocabulary)
 *
 * Pemain melihat sebuah kata bahasa Inggris beserta emojinya,
 * lalu memilih satu dari 4 pilihan arti dalam bahasa Indonesia.
 *
 * Alur per soal:
 *  1. Ambil soal dari GameData.vocabulary secara acak
 *  2. Render kata, emoji, kategori, dan 4 pilihan jawaban (1 benar + 3 salah)
 *  3. Mulai timer 30 detik
 *  4. Saat dijawab: hitung poin, beri feedback, lanjut soal berikutnya
 */

const VocabularyGame = (() => {
  // State game
  let questions = []; // 10 soal yang dipilih acak untuk sesi ini
  let currentIdx = 0; // indeks soal yang sedang ditampilkan
  let score = 0; // total skor sesi ini
  let correct = 0; // jumlah jawaban benar
  let startTime = 0; // waktu mulai (ms) untuk menghitung durasi

  // Inisialisasi game baru
  function init() {
    questions = getRandomItems(GameData.vocabulary, 10);
    currentIdx = 0;
    score = 0;
    correct = 0;
    startTime = Date.now();
    render();
  }

  // Render soal saat ini ke layar
  function render() {
    // Jika semua soal sudah selesai, tampilkan layar hasil
    if (currentIdx >= questions.length) {
      GameEngine.endGame({
        score,
        correct,
        total: questions.length,
        startTime,
      });
      return;
    }

    const q = questions[currentIdx];
    GameEngine.updateCounter(currentIdx + 1, questions.length);

    // Buat 3 pilihan salah dari kosakata lain (yang artinya berbeda)
    const wrongOptions = GameData.vocabulary
      .filter((v) => v.meaning !== q.meaning)
      .map((v) => v.meaning);
    const wrongs = getRandomItems(wrongOptions, 3);
    const allOptions = shuffleArray([q.meaning, ...wrongs]); // acak posisi jawaban benar

    document.getElementById("game-content").innerHTML = `
      <div class="vocab-game">
        <div class="hint-box">
          Apa arti kata berikut dalam Bahasa Indonesia?
        </div>

        <!-- Soal: emoji + kata + label kategori -->
        <div class="game-question">
          <span class="q-emoji">${q.emoji}</span>
          <span class="q-word">${sanitizeInput(q.word)}</span>
        </div>
        <div class="category-badge">${sanitizeInput(q.category)}</div>

        <!-- 4 tombol pilihan jawaban -->
        <div class="options-grid">
          ${allOptions
            .map(
              (opt) => `
            <button class="option-btn"
              onclick="VocabularyGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.meaning)}', this)">
              ${sanitizeInput(opt)}
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    `;

    // Mulai timer — jika habis, anggap tidak menjawab
    GameEngine.startTimer(30, () => answer(null, q.meaning, null));
  }

  // Proses jawaban yang dipilih pemain
  // selected   : teks pilihan yang diklik (null jika timeout)
  // correctAns : jawaban yang benar
  // btn        : elemen tombol yang diklik
  function answer(selected, correctAns, btn) {
    GameEngine.stopTimer();
    const isCorrect = selected === correctAns;

    // Nonaktifkan semua tombol dan tandai jawaban benar
    document.querySelectorAll(".option-btn").forEach((b) => {
      b.classList.add("disabled");
      if (b.textContent.trim() === correctAns) b.classList.add("correct");
    });

    if (isCorrect) {
      if (btn) btn.classList.add("correct");
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct += 1;
      AudioEngine.play("correct");
      GameEngine.showFeedback(true, `+${pts} pts! Correct! ✅`);
    } else {
      if (btn) btn.classList.add("wrong");
      const isGameOver = GameEngine.loseLife();
      AudioEngine.play("wrong");
      GameEngine.showFeedback(false, `Wrong! It's "${correctAns}" ❌`);

      // Jika nyawa habis, hentikan game sekarang juga
      if (isGameOver) {
        GameEngine.gameOver({
          score,
          correct,
          total: questions.length,
          startTime,
        });
        return;
      }
    }

    GameEngine.updateScore(score);
    currentIdx++;

    // Jeda sebentar sebelum lanjut ke soal berikutnya
    setTimeout(() => render(), 1200);
  }

  return { init, answer };
})();
