/**
 * EnglishQuest - Main App Controller
 * Mengontrol alur aplikasi, state manajemen, dan player data
 */

// ===== PLAYER DATA MANAGER =======
const PlayerData = (() => {
  const KEY = 'englishquest_data';

  function getDefault() {
    return {
      name: 'Player', avatar: '🦁', level: 1, xp: 0,
      totalStars: 0, gamesPlayed: 0, perfectGames: 0,
      vocabPlayed: 0, spellingPlayed: 0, sentencePlayed: 0,
      listeningPlayed: 0, quizPlayed: 0,
      bestScores: {},
      leaderboard: [],
      progress: { vocabulary: 0, spelling: 0, sentence: 0, listening: 0 }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return getDefault();
      // Validasi data JSON (keamanan: tidak mempercayai data luar)
      const parsed = JSON.parse(raw);
      return { ...getDefault(), ...parsed };
    } catch { return getDefault(); }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }

  function get() { return load(); }

  function getStats() { return load(); }
  function getName() { return load().name; }
  function getAvatar() { return load().avatar; }

  function setPlayer(name, avatar) {
    const d = load();
    // Sanitasi nama sebelum disimpan (keamanan)
    d.name = sanitizeInput(name) || 'Player';
    d.avatar = avatar || '🦁';
    save(d);
  }

  function addXP(amount) {
    const d = load();
    d.xp += amount;
    const xpPerLevel = 100;
    const newLevel = Math.floor(d.xp / xpPerLevel) + 1;
    const leveledUp = newLevel > d.level;
    d.level = newLevel;
    save(d);
    return { leveledUp, newLevel };
  }

  function recordGameResult(gameType, stars, score, totalQ, correctQ) {
    const d = load();
    d.gamesPlayed++;
    d.totalStars = (d.totalStars || 0) + stars;
    if (correctQ === totalQ) d.perfectGames++;

    // Update per-game counter
    const counterMap = {
      vocabulary: 'vocabPlayed', spelling: 'spellingPlayed',
      sentence: 'sentencePlayed', listening: 'listeningPlayed', quiz: 'quizPlayed'
    };
    if (counterMap[gameType]) d[counterMap[gameType]] = (d[counterMap[gameType]] || 0) + 1;

    // Best score
    if (!d.bestScores) d.bestScores = {};
    if (!d.bestScores[gameType] || score > d.bestScores[gameType]) {
      d.bestScores[gameType] = score;
    }

    // Progress (persen benar kumulatif)
    if (!d.progress) d.progress = {};
    const progressMap = { vocabulary: 'vocabulary', spelling: 'spelling', sentence: 'sentence', listening: 'listening', quiz: 'vocabulary' };
    const pk = progressMap[gameType];
    if (pk) {
      const pct = Math.round((correctQ / totalQ) * 100);
      d.progress[pk] = Math.min(100, Math.max(d.progress[pk] || 0, pct));
    }

    // Update leaderboard local
    if (!d.leaderboard) d.leaderboard = [];
    const entry = d.leaderboard.find(e => e.name === d.name);
    if (entry) {
      entry.stars = d.totalStars;
      entry.xp = d.xp;
      entry.avatar = d.avatar;
    } else {
      d.leaderboard.push({ name: d.name, avatar: d.avatar, stars: d.totalStars, xp: d.xp });
    }
    d.leaderboard.sort((a, b) => b.stars - a.stars || b.xp - a.xp);

    save(d);
    return d;
  }

  function getLeaderboard() { return load().leaderboard || []; }

  return { get, getStats, getName, getAvatar, setPlayer, addXP, recordGameResult, getLeaderboard };
})();

// ===== GAME ENGINE =====
const GameEngine = (() => {
  let currentGame = null;
  let lives = 3;
  let timerInterval = null;
  let timeLeft = 30;
  let totalTime = 30;
  let combo = 0;
  let sessionStart = 0;
  let currentScore = 0;

  function start(gameType) {
    currentGame = gameType;
    lives = 3;
    combo = 0;
    currentScore = 0;
    sessionStart = Date.now();

    updateLives();
    updateScore(0);
    showScreen('game-screen');

    const titles = {
      vocabulary: '📚 Word Match',
      spelling: '✏️ Spell It!',
      sentence: '🧩 Sentence Builder',
      listening: '🎵 Listen & Pick',
      quiz: '🎯 Quick Quiz'
    };
    document.getElementById('game-title-bar').textContent = titles[gameType] || gameType;

    AudioEngine.play('start');

    switch (gameType) {
      case 'vocabulary': VocabularyGame.init(); break;
      case 'spelling': SpellingGame.init(); break;
      case 'sentence': SentenceGame.init(); break;
      case 'listening': ListeningGame.init(); break;
      case 'quiz': QuizGame.init(); break;
    }
  }

  function updateCounter(current, total) {
    const el = document.getElementById('q-counter');
    if (el) el.textContent = `${current} / ${total}`;
  }

  function updateScore(score) {
    currentScore = score;
    const el = document.getElementById('current-score');
    if (el) el.textContent = score;
  }

  function startTimer(seconds, onExpire) {
    clearInterval(timerInterval);
    timeLeft = seconds;
    totalTime = seconds;
    updateTimerUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        onExpire && onExpire();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function updateTimerUI() {
    const el = document.getElementById('timer-display');
    if (el) {
      el.textContent = `⏱ ${timeLeft}`;
      el.style.color = timeLeft <= 5 ? '#FF6B6B' : '';
    }
    const strip = document.getElementById('timer-strip');
    if (strip) {
      strip.style.width = `${(timeLeft / totalTime) * 100}%`;
      strip.style.transition = 'width 1s linear';
      if (timeLeft <= 5) strip.style.background = 'linear-gradient(90deg, #FF6B6B, #FF4444)';
      else strip.style.background = '';
    }
  }

  function loseLife() {
    if (lives > 0) lives--;
    updateLives();
    if (lives === 0) {
      // Game over via no lives - handled di end
    }
  }

  function updateLives() {
    const el = document.getElementById('lives-display');
    if (el) {
      const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      el.textContent = hearts;
    }
  }

  function calculatePoints(isCorrect) {
    if (!isCorrect) { combo = 0; return 0; }
    combo++;
    const base = 100;
    const timeBonus = timeLeft;
    const comboBonus = combo > 1 ? Math.floor(base * 0.1 * (combo - 1)) : 0;
    return base + timeBonus + comboBonus;
  }

  function showFeedback(isCorrect, message) {
    const overlay = document.getElementById('feedback-overlay');
    const box = document.getElementById('feedback-box');
    const icon = document.getElementById('feedback-icon');
    const msg = document.getElementById('feedback-msg');

    if (!overlay) return;
    overlay.style.display = 'flex';
    box.className = 'feedback-box ' + (isCorrect ? 'correct' : 'wrong');
    icon.textContent = isCorrect ? '✅' : '❌';
    msg.textContent = message;

    setTimeout(() => { overlay.style.display = 'none'; }, 1000);
  }

  function endGame({ score, correct, total, startTime }) {
    stopTimer();
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const pct = correct / total;
    const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0;
    const xpGain = stars * 25 + correct * 5;

    // Update player data
    const data = PlayerData.recordGameResult(currentGame, stars, score, total, correct);
    const { leveledUp, newLevel } = PlayerData.addXP(xpGain);

    // Star display for game card
    const starsStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const cardStars = document.getElementById(`stars-${currentGame}`);
    if (cardStars) {
      // Store best stars
      const best = Math.max(parseInt(localStorage.getItem(`stars_${currentGame}`) || '0'), stars);
      localStorage.setItem(`stars_${currentGame}`, best);
    }

    // Show result screen
    showScreen('result-screen');

    const trophy = pct === 1 ? '🏆' : pct >= 0.8 ? '🎖️' : pct >= 0.6 ? '🥈' : pct >= 0.4 ? '🥉' : '📝';
    document.getElementById('result-trophy').textContent = trophy;

    const titles = pct === 1 ? 'PERFECT! 🎉' : pct >= 0.8 ? 'Excellent! 🌟' : pct >= 0.6 ? 'Good Job! 👍' : pct >= 0.4 ? 'Keep Going! 💪' : 'Try Again! 📚';
    document.getElementById('result-title').textContent = titles;
    document.getElementById('result-subtitle').textContent = `${correct} dari ${total} soal benar`;

    document.getElementById('res-score').textContent = score;
    document.getElementById('res-stars').textContent = '⭐'.repeat(stars) || '☆☆☆';
    document.getElementById('res-correct').textContent = `${correct}/${total}`;
    document.getElementById('res-time').textContent = `${elapsed}s`;
    document.getElementById('result-stars-row').textContent = starsStr;
    document.getElementById('result-xp-gain').textContent = `+${xpGain} XP gained!`;

    if (stars > 0) {
      AudioEngine.play(stars === 3 ? 'level_up' : 'coin');
      Fireworks.start();
    } else {
      AudioEngine.play('wrong');
    }

    if (leveledUp) {
      setTimeout(() => showToast(`🎉 Level Up! Kamu sekarang Level ${newLevel}!`), 1500);
      setTimeout(() => AudioEngine.play('level_up'), 1500);
    }

    // Check achievements
    const stats = PlayerData.getStats();
    const newlyUnlocked = GameData.achievements.filter(a => a.condition(stats));
    if (newlyUnlocked.length > 0) {
      setTimeout(() => {
        showToast(`🏅 Achievement Unlocked: ${newlyUnlocked[0].title}!`);
        AudioEngine.play('coin');
      }, 2500);
    }
  }

  function getCurrentGame() { return currentGame; }

  return { start, updateCounter, updateScore, startTimer, stopTimer, loseLife, calculatePoints, showFeedback, endGame, getCurrentGame };
})();

// ===== SCREEN MANAGER =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    // For non-loading screens, reset display so CSS .screen (display:none) applies
    if (s.id !== 'loading-screen') s.style.display = '';
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    // For non-loading screens, force block display
    if (id !== 'loading-screen') target.style.display = 'block';
  }
  window.scrollTo(0, 0);
}

// ===== PLAYER SETUP =====
let selectedAvatar = '🦁';

function showPlayerSetup() {
  AudioEngine.play('click');
  const name = PlayerData.getName();
  const input = document.getElementById('player-name-input');
  if (input && name !== 'Player') input.value = name;
  document.getElementById('player-setup-modal').style.display = 'flex';
}

function selectAvatar(el, avatar) {
  selectedAvatar = avatar;
  document.querySelectorAll('.avatar-opt').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
  AudioEngine.play('click');
}

function confirmPlayer() {
  const input = document.getElementById('player-name-input');
  const name = input ? input.value.trim() : '';

  // Validasi input
  if (!name || name.length < 1) {
    input.style.borderColor = 'var(--primary)';
    input.placeholder = 'Nama tidak boleh kosong!';
    setTimeout(() => { input.style.borderColor = ''; input.placeholder = 'Masukkan namamu...'; }, 2000);
    return;
  }

  PlayerData.setPlayer(name, selectedAvatar);
  document.getElementById('player-setup-modal').style.display = 'none';
  updateHomeUI();
  showToast(`Halo ${sanitizeInput(name)}! Siap belajar? 🚀`);
  AudioEngine.play('start');

  // Update mascot
  const avatar = document.getElementById('mascot-avatar');
  if (avatar) avatar.textContent = selectedAvatar;
  const bubble = document.getElementById('mascot-bubble');
  if (bubble) {
    const tips = GameData.tips;
    bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
  }
}

// ===== HOME UI UPDATE =====
function updateHomeUI() {
  const data = PlayerData.get();

  const nameEl = document.getElementById('player-name-display');
  if (nameEl) nameEl.textContent = sanitizeInput(data.name);

  const levelEl = document.getElementById('player-level');
  if (levelEl) levelEl.textContent = data.level;

  const starsEl = document.getElementById('total-stars');
  if (starsEl) starsEl.textContent = data.totalStars || 0;

  // Progress bars
  const progress = data.progress || {};
  ['vocabulary', 'spelling', 'sentence', 'listening'].forEach(key => {
    const pct = progress[key] || 0;
    const bar = document.getElementById(`prog-${key}`);
    const label = document.getElementById(`pct-${key}`);
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
  });

  // XP bar
  const xpPerLevel = 100;
  const xpInLevel = (data.xp || 0) % xpPerLevel;
  const xpPct = (xpInLevel / xpPerLevel) * 100;
  const xpBar = document.getElementById('xp-bar');
  const xpLabel = document.getElementById('xp-label');
  if (xpBar) xpBar.style.width = xpPct + '%';
  if (xpLabel) xpLabel.textContent = `${xpInLevel} / ${xpPerLevel} XP`;

  // Game card stars
  ['vocabulary', 'spelling', 'sentence', 'listening', 'quiz'].forEach(key => {
    const stored = parseInt(localStorage.getItem(`stars_${key}`) || '0');
    const el = document.getElementById(`stars-${key}`);
    if (el) el.textContent = '⭐'.repeat(stored) + '☆'.repeat(3 - stored);
  });

  // Achievement count
  const stats = PlayerData.getStats();
  const unlocked = GameData.achievements.filter(a => a.condition(stats)).length;
  const achEl = document.getElementById('ach-count');
  if (achEl) achEl.textContent = `${unlocked} / ${GameData.achievements.length}`;

  // Avatar
  const avatar = document.getElementById('mascot-avatar');
  if (avatar) avatar.textContent = data.avatar || '🦁';
}

// ===== NAVIGATION =====
function startGame(type) {
  AudioEngine.play('click');
  GameEngine.start(type);
}

function goHome() {
  AudioEngine.play('click');
  AudioEngine.stopVisualizer();
  Fireworks.stop();
  showScreen('home-screen');
  updateHomeUI();
  BgCanvas.init();
  AudioEngine.startVisualizer();
}

function replayGame() {
  AudioEngine.play('click');
  const game = GameEngine.getCurrentGame();
  if (game) GameEngine.start(game);
}

function toggleSound() {
  const enabled = AudioEngine.toggleSound();
  showToast(enabled ? '🔊 Suara Aktif' : '🔇 Suara Mati');
}

// ===== LOADING ANIMATION =====
function runLoadingScreen() {
  const bar = document.getElementById('loading-bar');
  let progress = 0;

  // Safety timeout: force dismiss loading after 5 seconds no matter what
  const safetyTimer = setTimeout(() => {
    finishLoading();
  }, 5000);

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      clearTimeout(safetyTimer);
      setTimeout(finishLoading, 400);
    }
    if (bar) bar.style.width = progress + '%';
  }, 100);
}

function finishLoading() {
  // Hide loading screen explicitly
  const loadingEl = document.getElementById('loading-screen');
  if (loadingEl) {
    loadingEl.classList.remove('active');
    loadingEl.style.display = 'none';
  }

  // Show home screen explicitly
  const homeEl = document.getElementById('home-screen');
  if (homeEl) {
    homeEl.classList.add('active');
    homeEl.style.display = 'block';
  }

  window.scrollTo(0, 0);

  try { BgCanvas.init(); } catch(e) { console.warn('BgCanvas error:', e); }
  try { AudioEngine.startVisualizer(); } catch(e) { console.warn('Visualizer error:', e); }
  try { updateHomeUI(); } catch(e) { console.warn('updateHomeUI error:', e); }

  // Rotate mascot tips
  const bubble = document.getElementById('mascot-bubble');
  if (bubble && GameData && GameData.tips) {
    setInterval(() => {
      const tips = GameData.tips;
      bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
    }, 5000);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Reset semua data lokal setiap kali halaman dibuka
  localStorage.clear();

  runLoadingScreen();

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => {
        if (m.style.display !== 'none') m.style.display = 'none';
      });
    }
  });

  // Init audio on first interaction (browser requirement)
  document.addEventListener('click', () => { AudioEngine.init(); }, { once: true });
});
