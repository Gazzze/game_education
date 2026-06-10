/**
 * EnglishQuest - Listen & Pick Game (Listening)
 *
 * Pemain mendengarkan kata yang diucapkan via Text-to-Speech (Web Speech API),
 * lalu memilih jawaban yang tepat dari 4 pilihan.
 *
 * Alur per soal:
 *  1. Tampilkan terjemahan (bahasa Indonesia) sebagai konteks
 *  2. Tombol play otomatis diklik / pemain klik sendiri untuk mendengar kata
 *  3. Pilihan jawaban terkunci sampai audio selesai diputar
 *  4. Pemain memilih → poin dihitung, lanjut soal berikutnya
 *
 * Fallback: jika TTS tidak berjalan dalam 2 detik, pilihan dibuka otomatis.
 */

const ListeningGame = (() => {
  // State game
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  // Inisialisasi game baru
  function init() {
    questions = getRandomItems(GameData.listening, 10);
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

    // Acak posisi pilihan jawaban
    const optionsHtml = shuffleArray(q.options)
      .map(
        (opt) => `
      <button class="option-btn"
        onclick="ListeningGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.word)}', this)">
        ${sanitizeInput(opt)}
      </button>
    `,
      )
      .join("");

    document.getElementById("game-content").innerHTML = `
      <div class="listening-game">
        <div class="hint-box">
          Dengarkan kata yang diucapkan, lalu pilih jawaban yang benar!
        </div>

        <!-- Tombol putar audio + animasi waveform -->
        <div class="listen-btn">
          <button class="play-audio-btn" id="play-btn" onclick="ListeningGame.playWord()">
            🔊
          </button>
          <p style="color:var(--text-muted);font-size:0.9rem">Klik untuk mendengarkan</p>

          <!-- Animasi bar waveform (muncul saat audio diputar) -->
          <div class="audio-waveform" id="waveform" style="opacity:0">
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
            <div class="wave-bar" style="height:8px"></div>
          </div>
        </div>

        <!-- Konteks: terjemahan kata dalam bahasa Indonesia -->
        <div class="listen-meaning">
          <p style="text-align:center;color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem">
            Artinya: <span style="color:var(--accent);font-weight:800">${sanitizeInput(q.meaning)}</span>
          </p>
        </div>

        <!-- Pilihan jawaban (dikunci sampai audio selesai) -->
        <div class="options-grid" id="listen-options" style="opacity:0.4;pointer-events:none">
          ${optionsHtml}
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:1rem" id="listen-hint">
          ⬆️ Dengarkan dulu sebelum memilih!
        </p>
      </div>
    `;

    // Auto-putar kata setelah 500ms (beri waktu DOM selesai dirender)
    setTimeout(() => playWord(), 500);

    // Timer lebih panjang (60 detik) karena perlu waktu untuk dengar dulu
    GameEngine.startTimer(60, () => answer(null, q.word, null));
  }

  // Putar kata menggunakan Text-to-Speech
  function playWord() {
    const q = questions[currentIdx];
    const playBtn = document.getElementById("play-btn");
    const waveform = document.getElementById("waveform");
    const optionsEl = document.getElementById("listen-options");
    const hintEl = document.getElementById("listen-hint");

    // Animasi tombol dan waveform saat audio diputar
    if (playBtn) {
      playBtn.textContent = "🔊";
      playBtn.classList.add("playing");
    }
    if (waveform) waveform.style.opacity = "1";

    AudioEngine.init(); // Pastikan AudioContext aktif

    // Panggil TTS — buka pilihan setelah audio selesai
    AudioEngine.speak(q.word, () => {
      if (playBtn) {
        playBtn.classList.remove("playing");
        playBtn.textContent = "🔊";
      }
      if (waveform) waveform.style.opacity = "0";
      unlockOptions(optionsEl, hintEl);
    });

    // Fallback: buka pilihan setelah 2 detik jika TTS tidak merespons
    // (contoh: browser tidak mendukung atau ada masalah suara)
    setTimeout(() => {
      unlockOptions(optionsEl, hintEl);
    }, 2000);
  }

  // Buka pilihan jawaban setelah audio diputar
  function unlockOptions(optionsEl, hintEl) {
    if (optionsEl) {
      optionsEl.style.opacity = "1";
      optionsEl.style.pointerEvents = "auto";
    }
    if (hintEl) hintEl.textContent = "👆 Sekarang pilih jawabanmu!";
  }

  // Proses jawaban yang dipilih pemain
  function answer(selected, correctWord, btn) {
    GameEngine.stopTimer();
    const isCorrect =
      selected !== null && selected.toUpperCase() === correctWord.toUpperCase();

    // Nonaktifkan semua pilihan dan tandai jawaban benar
    document.querySelectorAll(".option-btn").forEach((b) => {
      b.classList.add("disabled");
      if (b.textContent.trim().toUpperCase() === correctWord.toUpperCase()) {
        b.classList.add("correct");
      }
    });

    if (isCorrect) {
      if (btn) btn.classList.add("correct");
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct += 1;
      AudioEngine.play("correct");
      GameEngine.showFeedback(true, `+${pts} pts! "${correctWord}" ✅`);
    } else {
      if (btn) btn.classList.add("wrong");
      const isGameOver = GameEngine.loseLife();
      AudioEngine.play("wrong");
      GameEngine.showFeedback(false, `Jawaban: "${correctWord}" ❌`);

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
    setTimeout(() => render(), 1400);
  }

  return { init, playWord, answer };
})();
