/**
 * EnglishQuest - Listen & Pick Game (Listening)
 * Dengar kata yang diucapkan (TTS) lalu pilih jawaban yang benar
 * Menggunakan Web Speech API untuk signal pemrosesan suara
 */

const ListeningGame = (() => {
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;
  let hasPlayed = false;

  function init() {
    questions = getRandomItems(GameData.listening, 10);
    currentIdx = 0;
    score = 0;
    correct = 0;
    startTime = Date.now();
    render();
  }

  function render() {
    if (currentIdx >= questions.length) {
      GameEngine.endGame({ score, correct, total: questions.length, startTime });
      return;
    }

    const q = questions[currentIdx];
    hasPlayed = false;
    GameEngine.updateCounter(currentIdx + 1, questions.length);

    const optionsHtml = shuffleArray(q.options).map(opt => `
      <button class="option-btn" onclick="ListeningGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.word)}', this)">
        ${sanitizeInput(opt)}
      </button>
    `).join('');

    document.getElementById('game-content').innerHTML = `
      <div class="listening-game">
        <div class="hint-box">
          Dengarkan kata yang diucapkan, lalu pilih jawaban yang benar!
        </div>

        <div class="listen-btn">
          <button class="play-audio-btn" id="play-btn" onclick="ListeningGame.playWord()">
            🔊
          </button>
          <p style="color:var(--text-muted);font-size:0.9rem">Klik untuk mendengarkan</p>
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

        <div class="listen-meaning">
          <p style="text-align:center;color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem">
            Artinya: <span style="color:var(--accent);font-weight:800">${sanitizeInput(q.meaning)}</span>
          </p>
        </div>

        <div class="options-grid" id="listen-options" style="opacity:0.4;pointer-events:none">
          ${optionsHtml}
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:1rem" id="listen-hint">
          ⬆️ Dengarkan dulu sebelum memilih!
        </p>
      </div>
    `;

    // Auto-play saat soal pertama muncul
    setTimeout(() => playWord(), 500);
    GameEngine.startTimer(60, () => answer(null, q.word, null));
  }

  function playWord() {
    const q = questions[currentIdx];
    const btn = document.getElementById('play-btn');
    const waveform = document.getElementById('waveform');
    const optionsDiv = document.getElementById('listen-options');
    const hint = document.getElementById('listen-hint');

    if (btn) { btn.textContent = '🔊'; btn.classList.add('playing'); }
    if (waveform) waveform.style.opacity = '1';
    AudioEngine.init();

    // Gunakan TTS (Text-to-Speech) - Web Speech API
    AudioEngine.speak(q.word, () => {
      if (btn) { btn.classList.remove('playing'); btn.textContent = '🔊'; }
      if (waveform) waveform.style.opacity = '0';
      // Aktifkan pilihan setelah audio selesai
      if (optionsDiv) { optionsDiv.style.opacity = '1'; optionsDiv.style.pointerEvents = 'auto'; }
      if (hint) hint.textContent = '👆 Sekarang pilih jawabanmu!';
      hasPlayed = true;
    });

    // Aktifkan pilihan setelah 2 detik (fallback jika TTS tidak ada)
    setTimeout(() => {
      if (optionsDiv) { optionsDiv.style.opacity = '1'; optionsDiv.style.pointerEvents = 'auto'; }
      if (hint) hint.textContent = '👆 Sekarang pilih jawabanmu!';
      hasPlayed = true;
    }, 2000);
  }

  function answer(selected, correctWord, btn) {
    GameEngine.stopTimer();
    const isCorrect = selected !== null && selected.toUpperCase() === correctWord.toUpperCase();

    document.querySelectorAll('.option-btn').forEach(b => {
      b.classList.add('disabled');
      if (b.textContent.trim().toUpperCase() === correctWord.toUpperCase()) b.classList.add('correct');
    });

    if (isCorrect) {
      if (btn) btn.classList.add('correct');
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct++;
      AudioEngine.play('correct');
      GameEngine.showFeedback(true, `+${pts} pts! "${correctWord}" ✅`);
    } else {
      if (btn) btn.classList.add('wrong');
      GameEngine.loseLife();
      AudioEngine.play('wrong');
      GameEngine.showFeedback(false, `Jawaban: "${correctWord}" ❌`);
    }

    GameEngine.updateScore(score);
    currentIdx++;
    setTimeout(() => render(), 1400);
  }

  return { init, playWord, answer };
})();
