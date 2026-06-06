/**
 * EnglishQuest - Word Match Game (Vocabulary)
 * Cocokkan kata Bahasa Inggris dengan artinya dalam Bahasa Indonesia
 */

const VocabularyGame = (() => {
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  function init() {
    questions = getRandomItems(GameData.vocabulary, 10);
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

    // Generate wrong answers (dari kata lain, bukan jawaban yang sama)
    const others = GameData.vocabulary
      .filter(v => v.meaning !== q.meaning)
      .map(v => v.meaning);
    const wrongs = getRandomItems(others, 3);
    const allOptions = shuffleArray([q.meaning, ...wrongs]);

    const html = `
      <div class="vocab-game">
        <div class="hint-box">
          Apa arti kata berikut dalam Bahasa Indonesia?
        </div>
        <div class="game-question">
          <span class="q-emoji">${q.emoji}</span>
          <span class="q-word">${sanitizeInput(q.word)}</span>
        </div>
        <div class="category-badge">${sanitizeInput(q.category)}</div>
        <div class="options-grid">
          ${allOptions.map(opt => `
            <button class="option-btn" onclick="VocabularyGame.answer('${sanitizeInput(opt)}', '${sanitizeInput(q.meaning)}', this)">
              ${sanitizeInput(opt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('game-content').innerHTML = html;
    GameEngine.startTimer(30, () => answer(null, q.meaning, null));
  }

  function answer(selected, correct_ans, btn) {
    GameEngine.stopTimer();
    const isCorrect = selected === correct_ans;

    // Disable semua tombol
    document.querySelectorAll('.option-btn').forEach(b => {
      b.classList.add('disabled');
      if (b.textContent.trim() === correct_ans) b.classList.add('correct');
    });

    if (isCorrect) {
      if (btn) btn.classList.add('correct');
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct++;
      AudioEngine.play('correct');
      GameEngine.showFeedback(true, `+${pts} pts! Correct! ✅`);
    } else {
      if (btn) btn.classList.add('wrong');
      GameEngine.loseLife();
      AudioEngine.play('wrong');
      GameEngine.showFeedback(false, `Wrong! It's "${correct_ans}" ❌`);
    }

    GameEngine.updateScore(score);
    currentIdx++;
    setTimeout(() => render(), 1200);
  }

  return { init, answer };
})();
