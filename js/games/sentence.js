/**
 * EnglishQuest - Sentence Builder Game (Grammar)
 *
 * Pemain melihat terjemahan dan emoji, lalu menyusun kata-kata
 * yang tersedia menjadi kalimat bahasa Inggris yang benar.
 *
 * Cara bermain:
 *  - Klik kata di "Pilihan kata" → kata berpindah ke area kalimat
 *  - Klik kata di area kalimat → kata dikembalikan ke pilihan
 *  - Tombol Reset → kosongkan semua pilihan
 *  - Tombol Cek Kalimat → periksa apakah urutan sudah benar
 */

const SentenceGame = (() => {
  // State game
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  // State soal saat ini
  // builtSentence: array objek { word, poolIndex } — kata yang sudah disusun
  // availableWords: array kata yang diacak untuk ditampilkan
  let builtSentence = [];
  let availableWords = [];

  // Inisialisasi game baru
  function init() {
    questions = getRandomItems(GameData.sentences, 10);
    currentIdx = 0;
    score = 0;
    correct = 0;
    startTime = Date.now();
    render();
  }

  // Render soal berikutnya
  function render() {
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
    builtSentence = [];
    availableWords = shuffleArray([...q.words]); // acak posisi kata

    GameEngine.updateCounter(currentIdx + 1, questions.length);
    renderUI(q);
    GameEngine.startTimer(60, () => checkAnswer(true));
  }

  // Render tampilan HTML soal
  function renderUI(q) {
    document.getElementById("game-content").innerHTML = `
      <div class="sentence-game">
        <div class="hint-box">
          Susun kata-kata berikut menjadi kalimat yang benar!
        </div>

        <!-- Petunjuk: emoji + terjemahan Indonesia -->
        <div class="game-question" style="font-size:1rem;margin-bottom:0.5rem">
          <span style="font-size:2rem">${q.hint}</span><br/>
          <span style="color:var(--text-muted);font-size:0.9rem">Artinya: "${sanitizeInput(q.meaning)}"</span>
        </div>

        <!-- Area kalimat yang sedang disusun -->
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;text-align:center">Kalimat yang kamu buat:</p>
        <div class="sentence-words" id="built-sentence">
          <span style="color:var(--text-muted);font-size:0.85rem">Klik kata di bawah untuk menempatkannya di sini...</span>
        </div>

        <!-- Pool kata yang tersedia untuk dipilih -->
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;text-align:center">Pilihan kata:</p>
        <div class="sentence-words" id="word-pool">
          ${availableWords
            .map(
              (w, i) => `
            <button class="word-chip available" id="word-${i}"
              onclick="SentenceGame.addWord('${sanitizeInput(w)}', ${i})">
              ${sanitizeInput(w)}
            </button>
          `,
            )
            .join("")}
        </div>

        <!-- Tombol aksi -->
        <div class="sentence-action-btns">
          <button class="btn-clear" onclick="SentenceGame.clearSentence()">🗑️ Reset</button>
          <button class="btn-check" onclick="SentenceGame.checkAnswer(false)">✅ Cek Kalimat</button>
        </div>
      </div>
    `;
  }

  // Perbarui tampilan area kalimat yang sedang disusun
  function updateSentenceDisplay() {
    const container = document.getElementById("built-sentence");
    if (!container) return;

    if (builtSentence.length === 0) {
      // Tampilkan placeholder jika belum ada kata
      container.innerHTML =
        '<span style="color:var(--text-muted);font-size:0.85rem">Klik kata di bawah untuk menempatkannya di sini...</span>';
      return;
    }

    // Render kata-kata yang sudah disusun (klik untuk mengembalikan ke pool)
    container.innerHTML = builtSentence
      .map(
        (item, i) => `
      <button class="word-chip in-sentence"
        onclick="SentenceGame.removeWord(${i})">
        ${sanitizeInput(item.word)}
      </button>
    `,
      )
      .join("");
  }

  // Pindahkan kata dari pool ke area kalimat
  function addWord(word, poolIndex) {
    AudioEngine.play("click");

    builtSentence.push({ word, poolIndex });

    // Redup-kan tombol di pool agar terlihat sudah dipakai
    const poolBtn = document.getElementById(`word-${poolIndex}`);
    if (poolBtn) {
      poolBtn.style.opacity = "0.3";
      poolBtn.style.pointerEvents = "none";
    }

    updateSentenceDisplay();
  }

  // Kembalikan kata dari area kalimat ke pool
  function removeWord(sentenceIndex) {
    const removed = builtSentence.splice(sentenceIndex, 1)[0];

    // Kembalikan tombol pool ke keadaan normal
    const poolBtn = document.getElementById(`word-${removed.poolIndex}`);
    if (poolBtn) {
      poolBtn.style.opacity = "1";
      poolBtn.style.pointerEvents = "auto";
    }

    AudioEngine.play("click");
    updateSentenceDisplay();
  }

  // Reset — kembalikan semua kata ke pool
  function clearSentence() {
    builtSentence = [];

    // Kembalikan semua tombol pool
    document.querySelectorAll('[id^="word-"]').forEach((b) => {
      b.style.opacity = "1";
      b.style.pointerEvents = "auto";
    });

    updateSentenceDisplay();
    AudioEngine.play("click");
  }

  // Periksa apakah kalimat yang disusun sudah benar
  // timeout = true jika dipanggil karena waktu habis
  function checkAnswer(timeout) {
    GameEngine.stopTimer();

    const q = questions[currentIdx];
    const built = builtSentence.map((item) => item.word).join(" ");
    const isCorrect = !timeout && built === q.answer;

    if (isCorrect) {
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct += 1;
      AudioEngine.play("correct");
      GameEngine.showFeedback(true, `+${pts} pts! Correct! ✅`);
    } else {
      const isGameOver = GameEngine.loseLife();
      AudioEngine.play("wrong");
      // Tampilkan jawaban yang benar sebagai referensi
      GameEngine.showFeedback(false, `"${q.answer}" ❌`);

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
    setTimeout(() => render(), 1500);
  }

  return { init, addWord, removeWord, clearSentence, checkAnswer };
})();
