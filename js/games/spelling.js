/**
 * EnglishQuest - Spell It! Game (Spelling)
 * Susun huruf yang diacak menjadi kata yang benar
 */

const SpellingGame = (() => {
  let questions = [];
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;
  let currentWord = '';
  let selectedLetters = [];
  let shuffledLetters = [];

  function init() {
    questions = getRandomItems(GameData.spelling, 10);
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
    currentWord = q.word;
    selectedLetters = new Array(q.word.length).fill(null);

    // Shuffle huruf + tambah huruf distractor
    const extraLetters = 'AEIOURSTLNBCDGFMPHW'.split('');
    const distractors = getRandomItems(extraLetters.filter(l => !q.word.includes(l)), Math.min(3, q.word.length));
    shuffledLetters = shuffleArray([...q.word.split(''), ...distractors]);

    GameEngine.updateCounter(currentIdx + 1, questions.length);
    renderUI(q);
    GameEngine.startTimer(45, () => checkAnswer(true));
  }

  function renderUI(q) {
    const slots = currentWord.split('').map((_, i) => `
      <div class="letter-slot ${selectedLetters[i] ? 'filled' : ''}"
           id="slot-${i}" onclick="SpellingGame.removeFromSlot(${i})">
        ${selectedLetters[i] || ''}
      </div>
    `).join('');

    const choices = shuffledLetters.map((letter, i) => {
      const used = selectedLetters.includes(letter) && selectedLetters.indexOf(letter) !== -1
        ? selectedLetters.filter((v, idx) => v === letter && shuffledLetters.indexOf(letter) === i).length > 0
        : false;
      return `
        <button class="letter-choice ${isLetterUsed(i) ? 'used' : ''}"
                id="choice-${i}"
                onclick="SpellingGame.pickLetter('${sanitizeInput(letter)}', ${i})">
          ${sanitizeInput(letter)}
        </button>
      `;
    }).join('');

    document.getElementById('game-content').innerHTML = `
      <div class="spelling-game">
        <div class="hint-box">
          Susun huruf-huruf berikut menjadi kata yang benar!
        </div>
        <div class="spelling-word-display">
          <div style="font-size:3rem;margin-bottom:0.5rem">${q.emoji}</div>
          <p class="hint-text">Petunjuk: ${sanitizeInput(q.hint)}</p>
        </div>
        <div class="letter-slots" id="letter-slots">${slots}</div>
        <div class="letter-choices" id="letter-choices">${choices}</div>
        <div class="sentence-action-btns">
          <button class="btn-clear" onclick="SpellingGame.clearAll()">🗑️ Hapus Semua</button>
          <button class="btn-check" onclick="SpellingGame.checkAnswer(false)">✅ Cek Jawaban</button>
        </div>
      </div>
    `;
  }

  // Track penggunaan huruf (berdasarkan index di shuffledLetters)
  const usedIndices = new Set();

  function isLetterUsed(choiceIndex) {
    return usedIndices.has(choiceIndex);
  }

  function pickLetter(letter, choiceIndex) {
    if (usedIndices.has(choiceIndex)) return;
    const emptySlot = selectedLetters.indexOf(null);
    if (emptySlot === -1) return;

    AudioEngine.play('click');
    selectedLetters[emptySlot] = letter;
    usedIndices.add(choiceIndex);

    // Update UI
    const slot = document.getElementById(`slot-${emptySlot}`);
    if (slot) { slot.textContent = letter; slot.classList.add('filled'); }
    const choice = document.getElementById(`choice-${choiceIndex}`);
    if (choice) choice.classList.add('used');

    // Auto-check jika semua slot terisi
    if (!selectedLetters.includes(null)) {
      setTimeout(() => checkAnswer(false), 300);
    }
  }

  function removeFromSlot(slotIndex) {
    if (selectedLetters[slotIndex] === null) return;
    const removedLetter = selectedLetters[slotIndex];
    selectedLetters[slotIndex] = null;

    // Temukan index choice yang digunakan untuk letter ini
    for (const idx of usedIndices) {
      if (shuffledLetters[idx] === removedLetter) {
        usedIndices.delete(idx);
        const choice = document.getElementById(`choice-${idx}`);
        if (choice) choice.classList.remove('used');
        break;
      }
    }

    const slot = document.getElementById(`slot-${slotIndex}`);
    if (slot) { slot.textContent = ''; slot.classList.remove('filled'); }
    AudioEngine.play('click');
  }

  function clearAll() {
    selectedLetters = new Array(currentWord.length).fill(null);
    usedIndices.clear();
    document.querySelectorAll('.letter-slot').forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
    document.querySelectorAll('.letter-choice').forEach(c => c.classList.remove('used'));
    AudioEngine.play('click');
  }

  function checkAnswer(timeout) {
    GameEngine.stopTimer();
    const typed = selectedLetters.join('');
    const isCorrect = !timeout && typed === currentWord;

    if (isCorrect) {
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct++;
      AudioEngine.play('correct');
      GameEngine.showFeedback(true, `+${pts} pts! "${currentWord}" ✅`);
    } else {
      GameEngine.loseLife();
      AudioEngine.play('wrong');
      GameEngine.showFeedback(false, `Jawaban: "${currentWord}" ❌`);
    }

    GameEngine.updateScore(score);
    usedIndices.clear();
    currentIdx++;
    setTimeout(() => render(), 1400);
  }

  return { init, pickLetter, removeFromSlot, clearAll, checkAnswer };
})();
