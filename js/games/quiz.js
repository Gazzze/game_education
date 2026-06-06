/**
 * EnglishQuest - Quick Quiz Game (Mixed)
 * Kuis pilihan ganda campuran semua materi
 */

const QuizGame = (() => {
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  function init() {
    questions = getRandomItems(GameData.quiz, 10);
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
    GameEngine.updateCounter(currentIdx + 1, questions.length);

    const allOptions = shuffleArray([...q.options]);

    document.getElementById('game-content').innerHTML = `
      <div class="quiz-game">
        <div class="hint-box">
          Pilih jawaban yang paling tepat!
        </div>
        <div class="game-question">
          <span class="q-emoji">${q.emoji}</span>
          <p>${sanitizeInput(q.question)}</p>
        </div>
        <div class="options-grid">
          ${allOptions.map(opt => `
            <button class="option-btn" onclick="QuizGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.answer)}', this)">
              ${sanitizeInput(opt)}
            </button>
          `).join('')}
        </div>
        <div class="q-progress-dots">
          ${questions.map((_, i) => `
            <span class="q-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'current' : ''}"></span>
          `).join('')}
        </div>
      </div>
    `;

    GameEngine.startTimer(20, () => answer(null, q.answer, null));
  }

  function answer(selected, correctAns, btn) {
    GameEngine.stopTimer();
    const isCorrect = selected === correctAns;

    document.querySelectorAll('.option-btn').forEach(b => {
      b.classList.add('disabled');
      if (b.textContent.trim() === correctAns) b.classList.add('correct');
    });

    if (isCorrect) {
      if (btn) btn.classList.add('correct');
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct++;
      AudioEngine.play('correct');
      GameEngine.showFeedback(true, `+${pts} pts! ✅`);
    } else {
      if (btn) btn.classList.add('wrong');
      GameEngine.loseLife();
      AudioEngine.play('wrong');
      GameEngine.showFeedback(false, `Jawaban: "${correctAns}" ❌`);
    }

    GameEngine.updateScore(score);
    currentIdx++;
    setTimeout(() => render(), 1200);
  }

  return { init, answer };
})();
