/**
 * EnglishQuest - Spell It! Game (Spelling)
 *
 * Pemain melihat emoji dan petunjuk, lalu menyusun huruf-huruf acak
 * menjadi kata yang benar dengan cara mengklik huruf satu per satu.
 *
 * Alur per soal:
 *  1. Ambil soal dari GameData.spelling secara acak
 *  2. Acak huruf-huruf kata + tambah beberapa huruf pengecoh (distractor)
 *  3. Pemain klik huruf → masuk ke slot kosong pertama
 *  4. Semua slot terisi → auto-check jawaban
 *  5. Pemain bisa klik tombol "Cek Jawaban" atau "Hapus Semua"
 */

const SpellingGame = (() => {
  // State game
  let questions = []; // soal sesi ini
  let currentIdx = 0;
  let score = 0;
  let correct = 0;
  let startTime = 0;

  // State soal saat ini
  let currentWord = ""; // kata yang harus dieja
  let selectedLetters = []; // huruf yang sudah dipilih (diindeks per slot)
  let shuffledLetters = []; // semua pilihan huruf (acak + distractor)
  let usedIndices = new Set(); // indeks dari shuffledLetters yang sudah dipakai

  // Inisialisasi game baru
  function init() {
    questions = getRandomItems(GameData.spelling, 10);
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
    currentWord = q.word;

    // Inisialisasi ulang state soal
    selectedLetters = new Array(q.word.length).fill(null);
    usedIndices = new Set();

    // Tambah huruf pengecoh (distractor) yang tidak ada di kata
    const extraPool = "AEIOURSTLNBCDGFMPHW".split("");
    const distractors = getRandomItems(
      extraPool.filter((l) => !q.word.includes(l)),
      Math.min(3, q.word.length),
    );
    shuffledLetters = shuffleArray([...q.word.split(""), ...distractors]);

    GameEngine.updateCounter(currentIdx + 1, questions.length);
    renderUI(q);
    GameEngine.startTimer(45, () => checkAnswer(true));
  }

  // Render HTML untuk soal spelling
  function renderUI(q) {
    // Slot huruf (kotak-kotak yang harus diisi)
    const slotsHtml = currentWord
      .split("")
      .map(
        (_, i) => `
      <div class="letter-slot ${selectedLetters[i] ? "filled" : ""}"
           id="slot-${i}"
           onclick="SpellingGame.removeFromSlot(${i})">
        ${selectedLetters[i] || ""}
      </div>
    `,
      )
      .join("");

    // Tombol pilihan huruf
    const choicesHtml = shuffledLetters
      .map(
        (letter, i) => `
      <button class="letter-choice ${usedIndices.has(i) ? "used" : ""}"
              id="choice-${i}"
              onclick="SpellingGame.pickLetter('${sanitizeInput(letter)}', ${i})">
        ${sanitizeInput(letter)}
      </button>
    `,
      )
      .join("");

    document.getElementById("game-content").innerHTML = `
      <div class="spelling-game">
        <div class="hint-box">
          Susun huruf-huruf berikut menjadi kata yang benar!
        </div>

        <!-- Tampilan petunjuk (emoji + teks hint) -->
        <div class="spelling-word-display">
          <div style="font-size:3rem;margin-bottom:0.5rem">${q.emoji}</div>
          <p class="hint-text">Petunjuk: ${sanitizeInput(q.hint)}</p>
        </div>

        <!-- Slot huruf (area jawaban) -->
        <div class="letter-slots" id="letter-slots">${slotsHtml}</div>

        <!-- Pilihan huruf yang bisa diklik -->
        <div class="letter-choices" id="letter-choices">${choicesHtml}</div>

        <!-- Tombol aksi -->
        <div class="sentence-action-btns">
          <button class="btn-clear" onclick="SpellingGame.clearAll()">🗑️ Hapus Semua</button>
          <button class="btn-check" onclick="SpellingGame.checkAnswer(false)">✅ Cek Jawaban</button>
        </div>
      </div>
    `;
  }

  // Pemain klik huruf → masuk ke slot kosong pertama
  function pickLetter(letter, choiceIndex) {
    // Abaikan jika huruf sudah dipakai
    if (usedIndices.has(choiceIndex)) return;

    // Cari slot pertama yang masih kosong
    const emptySlot = selectedLetters.indexOf(null);
    if (emptySlot === -1) return; // semua slot sudah terisi

    AudioEngine.play("click");

    // Isi slot dan tandai huruf sebagai terpakai
    selectedLetters[emptySlot] = letter;
    usedIndices.add(choiceIndex);

    // Update tampilan slot
    const slotEl = document.getElementById(`slot-${emptySlot}`);
    if (slotEl) {
      slotEl.textContent = letter;
      slotEl.classList.add("filled");
    }

    // Tampilkan huruf sebagai "used" (tidak bisa diklik lagi)
    const choiceEl = document.getElementById(`choice-${choiceIndex}`);
    if (choiceEl) choiceEl.classList.add("used");

    // Auto-check jika semua slot sudah terisi
    if (!selectedLetters.includes(null)) {
      setTimeout(() => checkAnswer(false), 300);
    }
  }

  // Pemain klik huruf yang sudah ada di slot → hapus dari slot
  function removeFromSlot(slotIndex) {
    if (selectedLetters[slotIndex] === null) return;

    const removedLetter = selectedLetters[slotIndex];
    selectedLetters[slotIndex] = null;

    // Cari index choice yang sesuai dan kembalikan
    for (const idx of usedIndices) {
      if (shuffledLetters[idx] === removedLetter) {
        usedIndices.delete(idx);
        const choiceEl = document.getElementById(`choice-${idx}`);
        if (choiceEl) choiceEl.classList.remove("used");
        break;
      }
    }

    // Kosongkan tampilan slot
    const slotEl = document.getElementById(`slot-${slotIndex}`);
    if (slotEl) {
      slotEl.textContent = "";
      slotEl.classList.remove("filled");
    }

    AudioEngine.play("click");
  }

  // Hapus semua huruf yang sudah dipilih dan mulai dari awal
  function clearAll() {
    selectedLetters = new Array(currentWord.length).fill(null);
    usedIndices.clear();

    // Reset tampilan semua slot
    document.querySelectorAll(".letter-slot").forEach((s) => {
      s.textContent = "";
      s.classList.remove("filled");
    });

    // Kembalikan semua pilihan huruf
    document.querySelectorAll(".letter-choice").forEach((c) => {
      c.classList.remove("used");
    });

    AudioEngine.play("click");
  }

  // Periksa apakah susunan huruf sudah benar
  // timeout = true jika dipanggil karena waktu habis
  function checkAnswer(timeout) {
    GameEngine.stopTimer();
    const typed = selectedLetters.join("");
    const isCorrect = !timeout && typed === currentWord;

    if (isCorrect) {
      const pts = GameEngine.calculatePoints(true);
      score += pts;
      correct += 1;
      AudioEngine.play("correct");
      GameEngine.showFeedback(true, `+${pts} pts! "${currentWord}" ✅`);
    } else {
      const isGameOver = GameEngine.loseLife();
      AudioEngine.play("wrong");
      GameEngine.showFeedback(false, `Jawaban: "${currentWord}" ❌`);

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

  return { init, pickLetter, removeFromSlot, clearAll, checkAnswer };
})();
