/**
 * EnglishQuest - Sentence Builder Game (Grammar)
 * Susun kata-kata acak menjadi kalimat yang benar
 */

const SentenceGame = (() => {
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;
  let builtSentence = [];
  let availableWords = [];

  function init() {
    questions = getRandomItems(GameData.sentences, 10);
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
    builtSentence = [];
    availableWords = shuffleArray([...q.words]);

    GameEngine.updateCounter(currentIdx + 1, questions.length);
    renderUI(q);
    GameEngine.startTimer(60, () => checkAnswer(true));
  }

  function renderUI(q) {
    document.getElementById('game-content').innerHTML = `
      <div class="sentence-game">
        <div class="hint-box">
          Susun kata-kata berikut menjadi kalimat yang benar!
        </div>
        <div class="game-question" style="font-size:1rem;margin-bottom:0.5rem">
          <span style="font-size:2rem">${q.hint}</span><br/>
          <span style="color:var(--text-muted);font-size:0.9rem">Artinya: "${sanitizeInput(q.meaning)}"</span>
        </div>

        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;text-align:center">Kalimat yang kamu buat:</p>
        <div class="sentence-words" id="built-sentence">
          ${builtSentence.length === 0 ? '<span style="color:var(--text-muted);font-size:0.85rem">Klik kata di bawah untuk menempatkannya di sini...</span>' : ''}
        </div>

        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.5rem;text-align:center">Pilihan kata:</p>
        <div class="sentence-words" id="word-pool">
          ${availableWords.map((w, i) => `
            <button class="word-chip available" id="word-${i}" onclick="SentenceGame.addWord('${sanitizeInput(w)}', ${i})">
              ${sanitizeInput(w)}
            </button>
          `).join('')}
        </div>

        <div class="sentence-action-btns">
          <button class="btn-clear" onclick="SentenceGame.clearSentence()">🗑️ Reset</button>
          <button class="btn-check" onclick="SentenceGame.checkAnswer(false)">✅ Cek Kalimat</button>
        </div>
      </div>
    `;
  }

  function updateSentenceDisplay() {
    const container = document.getElementById('built-sentence');
    if (!container) return;

    if (builtSentence.length === 0) {
      container.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">Klik kata di bawah untuk menempatkannya di sini...</span>';
      return;
    }

    container.innerHTML = builtSentence.map((item, i) => `
      <button class="word-chip in-sentence" onclick="SentenceGame.removeWord(${i})">
        ${sanitizeInput(item.word)}
      </button>
    `).join('');
  }

  function addWord(word, poolIndex) {
    AudioEngine.play('click');
    builtSentence.push({ word, poolIndex });
    const poolBtn = document.getElementById(`word-${poolIndex}`);
    if (poolBtn) poolBtn.style.opacity = '0.3';
    if (poolBtn) poolBtn.style.pointerEvents = 'none';
    updateSentenceDisplay();
  }

  function removeWord(sentenceIndex) {
    const item = builtSentence.splice(sentenceIndex, 1)[0];
    const poolBtn = document.getElementById(`word-${item.poolIndex}`);
    if (poolBtn) { poolBtn.style.opacity = '1'; poolBtn.style.pointerEvents = 'auto'; }
    AudioEngine.play('click');
    updateSentenceDisplay();
  }

  function clearSentence() {
    builtSentence = [];
    document.querySelectorAll('.word-chip.available, [id^="word-"]').forEach(b => {
      b.style.opacity = '1'; b.style.pointerEvents = 'auto';
    });
    updateSentenceDisplay();
    AudioEngine.play('click');
  }

  function checkAnswer(timeout) {
    GameEngine.stopTimer();
    const built = builtSentence.map(item => item.word).join(' ');
    const q = questions[currentIdx];
    const isCorrect = !timeout && built === q.answer;

    if (isCorrect) {
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct++;
      AudioEngine.play('correct');
      GameEngine.showFeedback(true, `+${pts} pts! Correct! ✅`);
    } else {
      GameEngine.loseLife();
      AudioEngine.play('wrong');
      GameEngine.showFeedback(false, `"${q.answer}" ❌`);
    }

    GameEngine.updateScore(score);
    currentIdx++;
    setTimeout(() => render(), 1500);
  }

  return { init, addWord, removeWord, clearSentence, checkAnswer };
})();
