/**
 * EnglishQuest - UI Controller
 * Animasi background, fireworks, dan komponen UI
 */

// ===== ANIMATED BACKGROUND PARTICLES =====
const BgCanvas = (() => {
  let ctx, canvas, particles = [], raf;

  function init() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createParticles();
    animate();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: ['#FF6B6B','#4ECDC4','#FFE66D','#A29BFE','#55EFC4'][Math.floor(Math.random() * 5)]
      });
    }
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw connections between nearby particles
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
  }

  function stop() { if (raf) cancelAnimationFrame(raf); }

  return { init, stop };
})();

// ===== FIREWORKS ANIMATION (Result Screen) =====
const Fireworks = (() => {
  let canvas, ctx, particles = [], raf;

  function start() {
    canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => burst(), i * 300);
    }
    animate();
  }

  function burst() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6;
    const colors = ['#FF6B6B','#FFE66D','#4ECDC4','#A29BFE','#55EFC4','#FD9644','#F9CA24'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 / 60) * i;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1, color,
        size: Math.random() * 3 + 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(15,14,23,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => p.alpha > 0.01);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= p.decay;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    if (particles.length === 0) stop();
  }

  function stop() { if (raf) cancelAnimationFrame(raf); }

  return { start, stop };
})();

// ===== TOAST NOTIFICATION =====
function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== MODAL HELPERS =====
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ===== ACHIEVEMENTS UI =====
function showAchievements() {
  const stats = PlayerData.getStats();
  const list = document.getElementById('achievement-list');
  if (!list) return;

  list.innerHTML = GameData.achievements.map(ach => {
    const unlocked = ach.condition(stats);
    return `
      <div class="ach-item ${unlocked ? 'unlocked' : 'ach-locked'}">
        <span class="ach-icon">${unlocked ? ach.icon : '🔒'}</span>
        <div class="ach-text">
          <h4>${sanitizeInput(ach.title)}</h4>
          <p>${sanitizeInput(ach.desc)}</p>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('achievement-modal').style.display = 'flex';
}

// ===== LEADERBOARD UI =====
function showLeaderboard() {
  const lb = PlayerData.getLeaderboard();
  const currentName = PlayerData.getName();
  const list = document.getElementById('leaderboard-list');
  if (!list) return;

  if (lb.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Belum ada data skor. Mainkan dulu! 🎮</p>';
  } else {
    list.innerHTML = lb.slice(0, 10).map((entry, i) => {
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      const isCurrent = entry.name === currentName;
      return `
        <div class="lb-row ${isCurrent ? 'current-player' : ''}">
          <span class="lb-rank ${rankClass}">${rankIcon}</span>
          <span class="lb-avatar">${sanitizeInput(entry.avatar || '🦁')}</span>
          <span class="lb-name">${sanitizeInput(entry.name)}</span>
          <span class="lb-score">⭐ ${entry.stars}</span>
          <span class="lb-score">XP ${entry.xp}</span>
        </div>
      `;
    }).join('');
  }

  document.getElementById('leaderboard-modal').style.display = 'flex';
}

// ===== Q-PROGRESS DOTS CSS =====
const style = document.createElement('style');
style.textContent = `
  .q-progress-dots { display:flex; gap:6px; justify-content:center; margin-top:1.5rem; }
  .q-dot { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.15); transition:all 0.3s; }
  .q-dot.done { background:var(--green); }
  .q-dot.current { background:var(--accent); transform:scale(1.3); }
  .category-badge { text-align:center; margin-bottom:1.5rem; display:inline-block; width:100%; }
  .category-badge { font-size:0.8rem; color:var(--text-muted); font-weight:700; }
  .hint-text { color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem; text-align:center; }
`;
document.head.appendChild(style);
