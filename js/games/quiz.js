/**
 * EnglishQuest - Quick Quiz Game (Mixed)
 *
 * Kuis pilihan ganda campuran dari semua materi (vocabulary, grammar, dll).
 * Setiap soal punya timer 20 detik — lebih singkat dari game lain
 * untuk menguji kecepatan berpikir pemain.
 *
 * Fitur tambahan:
 *  - Progress dot di bawah soal (menunjukkan posisi saat ini)
 *  - Timer singkat untuk tantangan lebih besar
 */

const QuizGame = (() => {
  // State game
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  // Inisialisasi game baru
  function init() {
    questions = getRandomItems(GameData.quiz, 10);
    currentIdx = 0;
    score = 0;
    correct = 0;
    startTime = Date.now();
    render();
  }

  // Render soal saat ini
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
    GameEngine.updateCounter(currentIdx + 1, questions.length);

    // Acak urutan pilihan jawaban agar posisi jawaban benar tidak bisa dihafal
    const shuffledOptions = shuffleArray([...q.options]);

    document.getElementById("game-content").innerHTML = `
      <div class="quiz-game">
        <div class="hint-box">
          Pilih jawaban yang paling tepat!
        </div>

        <!-- Soal: emoji + teks pertanyaan -->
        <div class="game-question">
          <span class="q-emoji">${q.emoji}</span>
          <p>${sanitizeInput(q.question)}</p>
        </div>

        <!-- 4 pilihan jawaban -->
        <div class="options-grid">
          ${shuffledOptions
            .map(
              (opt) => `
            <button class="option-btn"
              onclick="QuizGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.answer)}', this)">
              ${sanitizeInput(opt)}
            </button>
          `,
            )
            .join("")}
        </div>

        <!-- Dot progress: menunjukkan posisi soal saat ini -->
        <div class="q-progress-dots">
          ${questions
            .map(
              (_, i) => `
            <span class="q-dot ${i < currentIdx ? "done" : i === currentIdx ? "current" : ""}"></span>
          `,
            )
            .join("")}
        </div>
      </div>
    `;

    // Timer 20 detik — lebih singkat karena ini kuis campuran
    GameEngine.startTimer(20, () => answer(null, q.answer, null));
  }

  // Proses jawaban yang dipilih pemain
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
      GameEngine.showFeedback(true, `+${pts} pts! ✅`);
    } else {
      if (btn) btn.classList.add("wrong");
      const isGameOver = GameEngine.loseLife();
      AudioEngine.play("wrong");
      GameEngine.showFeedback(false, `Jawaban: "${correctAns}" ❌`);

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
    setTimeout(() => render(), 1200);
  }

  return { init, answer };
})();
