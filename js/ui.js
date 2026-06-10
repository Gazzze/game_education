//  Penggunaan Canvas 2D API + requestAnimationFrame
const BgCanvas = (() => {
  let ctx, canvas;
  let particles = [];
  let raf; // ID requestAnimationFrame untuk bisa dibatalkan

  // Inisialisasi canvas dan mulai animasi
  function init() {
    canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    resize();
    createParticles();
    animate();

    // Sesuaikan ukuran canvas jika jendela browser diubah ukurannya
    window.addEventListener("resize", resize);
  }

  // Sesuaikan dimensi canvas dengan ukuran jendela
  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Buat partikel baru secara random (jumlah menyesuaikan lebar layar)
  function createParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 25);
    const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A29BFE", "#55EFC4"];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5, // gerak horizontal pelan
        speedY: (Math.random() - 0.5) * 0.5, // gerak vertikal pelan
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  // Loop animasi — dipanggil setiap frame (~60fps)
  function animate() {
    raf = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Perbarui posisi dan gambar setiap partikel
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap-around: jika keluar layar, masuk dari sisi berlawanan
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Gambar partikel sebagai lingkaran kecil
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      // Konversi opacity (0-1) ke hex dua digit untuk warna RGBA
      ctx.fillStyle =
        p.color +
        Math.round(p.opacity * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.fill();
    });

    // Gambar garis penghubung antar partikel yang berdekatan
    // (efek "constellation" / jaringan bintang)
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach((p2) => {
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 100) {
          // Semakin dekat → garis semakin terlihat
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

  // Hentikan animasi (dipakai saat berpindah layar)
  function stop() {
    if (raf) cancelAnimationFrame(raf);
  }

  return { init, stop };
})();

//  FIREWORKS — Efek kembang api di layar hasil game
//  Setiap "ledakan" menghasilkan 60 partikel yang menyebar
const Fireworks = (() => {
  let canvas, ctx;
  let particles = [];
  let raf;

  // Mulai animasi fireworks dengan beberapa ledakan beruntun
  function start() {
    canvas = document.getElementById("fireworks-canvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];

    // Buat 5 ledakan dengan jeda 300ms antar ledakan
    for (let i = 0; i < 5; i++) {
      setTimeout(() => burst(), i * 300);
    }

    animate();
  }

  // Buat satu ledakan di posisi acak
  function burst() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.6; // ledakan di bagian atas layar
    const colors = [
      "#FF6B6B",
      "#FFE66D",
      "#4ECDC4",
      "#A29BFE",
      "#55EFC4",
      "#FD9644",
      "#F9CA24",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // 60 partikel menyebar ke segala arah (lingkaran penuh)
    for (let i = 0; i < 60; i++) {
      const angle = ((Math.PI * 2) / 60) * i;
      const speed = Math.random() * 6 + 2;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed, // kecepatan horizontal
        vy: Math.sin(angle) * speed, // kecepatan vertikal
        alpha: 1,
        color,
        size: Math.random() * 3 + 1,
        decay: Math.random() * 0.02 + 0.01, // seberapa cepat memudar
      });
    }
  }

  // Loop animasi partikel kembang api
  function animate() {
    raf = requestAnimationFrame(animate);

    // Efek trail (jejak) dengan overlay semi-transparan
    ctx.fillStyle = "rgba(15,14,23,0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hapus partikel yang sudah tidak terlihat
    particles = particles.filter((p) => p.alpha > 0.01);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravitasi (partikel jatuh ke bawah)
      p.alpha -= p.decay; // memudar seiring waktu

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle =
        p.color +
        Math.round(p.alpha * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.fill();
    });

    // Hentikan animasi otomatis jika semua partikel sudah hilang
    if (particles.length === 0) stop();
  }

  // Hentikan animasi fireworks
  function stop() {
    if (raf) cancelAnimationFrame(raf);
  }

  return { start, stop };
})();

//  TOAST NOTIFICATION
//  Pesan singkat yang muncul dari bawah layar sebentar,
//  lalu hilang otomatis setelah beberapa detik.
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  // Sembunyikan setelah durasi tertentu
  setTimeout(() => toast.classList.remove("show"), duration);
}

// Tutup modal berdasarkan ID elemen
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

//  ACHIEVEMENTS MODAL
//  Menampilkan daftar semua achievement dan status terkunci/terbuka.
function showAchievements() {
  const stats = PlayerData.getStats();
  const list = document.getElementById("achievement-list");
  if (!list) return;

  // Render setiap achievement — tampilkan ikon asli jika terbuka, kunci jika belum
  list.innerHTML = GameData.achievements
    .map((ach) => {
      const unlocked = ach.condition(stats);
      return `
      <div class="ach-item ${unlocked ? "unlocked" : "ach-locked"}">
        <span class="ach-icon">${unlocked ? ach.icon : "🔒"}</span>
        <div class="ach-text">
          <h4>${sanitizeInput(ach.title)}</h4>
          <p>${sanitizeInput(ach.desc)}</p>
        </div>
      </div>
    `;
    })
    .join("");

  document.getElementById("achievement-modal").style.display = "flex";
}

//  LEADERBOARD MODAL
//  Menampilkan papan skor tertinggi, maksimal 10 pemain.
//  Pemain saat ini ditandai dengan highlight berbeda.
function showLeaderboard() {
  const lb = PlayerData.getLeaderboard();
  const currentName = PlayerData.getName();
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  if (lb.length === 0) {
    // Belum ada data
    list.innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding:2rem">Belum ada data skor. Mainkan dulu! 🎮</p>';
  } else {
    list.innerHTML = lb
      .slice(0, 10)
      .map((entry, i) => {
        // Ikon dan warna medal untuk top 3
        const rankIcon =
          i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
        const rankClass =
          i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
        const isCurrent = entry.name === currentName; // tandai pemain saat ini

        return `
        <div class="lb-row ${isCurrent ? "current-player" : ""}">
          <span class="lb-rank ${rankClass}">${rankIcon}</span>
          <span class="lb-avatar">${sanitizeInput(entry.avatar || "🦁")}</span>
          <span class="lb-name">${sanitizeInput(entry.name)}</span>
          <span class="lb-score">⭐ ${entry.stars}</span>
          <span class="lb-score">XP ${entry.xp}</span>
        </div>
      `;
      })
      .join("");
  }

  document.getElementById("leaderboard-modal").style.display = "flex";
}

const dynamicStyle = document.createElement("style");
dynamicStyle.textContent = `
  /* Dot progress soal (dipakai di quiz game) */
  .q-progress-dots  { display:flex; gap:6px; justify-content:center; margin-top:1.5rem; }
  .q-dot            { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.15); transition:all 0.3s; }
  .q-dot.done       { background:var(--green); }
  .q-dot.current    { background:var(--accent); transform:scale(1.3); }

  /* Label kategori di atas pilihan jawaban */
  .category-badge   { text-align:center; margin-bottom:1.5rem; display:inline-block; width:100%; font-size:0.8rem; color:var(--text-muted); font-weight:700; }

  /* Teks petunjuk (hint) di bawah soal */
  .hint-text        { color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem; text-align:center; }
`;
document.head.appendChild(dynamicStyle);
