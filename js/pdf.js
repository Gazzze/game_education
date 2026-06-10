/**
 * EnglishQuest - PDF Generator
 * Sistem Buku Panduan - dibuat dengan jsPDF
 * Kompresi: konten dikompresi menggunakan pako (deflate) via jsPDF internal
 */

// Load jsPDF via CDN saat diperlukan
function loadJsPDF(callback) {
  if (window.jspdf) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = callback;
  script.onerror = () => {
    showToast("⚠️ Gagal memuat PDF library. Cek koneksi internet.");
  };
  document.head.appendChild(script);
}

// Konten PDF Guideline
const pdfContent = {
  title: "EnglishQuest",
  subtitle: "Buku Panduan Sistem Game Edukasi",
  sections: [
    {
      title: "1. Pendahuluan",
      content: [
        "EnglishQuest adalah platform game edukasi bahasa Inggris berbasis web yang dirancang khusus untuk siswa usia 9-12 tahun.",
        "Sistem ini menggabungkan teknik multimedia interaktif dengan pendekatan gamifikasi untuk meningkatkan motivasi belajar.",
        "Target Pengguna: Siswa SD kelas 3-6 (usia 9-12 tahun)",
        "Platform: Web Browser (Chrome, Firefox, Safari, Edge)",
        "Teknologi: HTML5, CSS3, JavaScript, Web Audio API",
      ],
    },
    {
      title: "2. Fitur Utama",
      content: [
        "Mini-Game 1 - Word Match: Mencocokkan kata bahasa Inggris dengan artinya. Dilengkapi emoji visual untuk membantu asosiasi makna.",
        "Mini-Game 2 - Spell It!: Menyusun huruf acak menjadi kata yang benar. Melatih kemampuan spelling dan ingatan huruf.",
        "Mini-Game 3 - Sentence Builder: Menyusun kata-kata acak menjadi kalimat yang benar. Melatih grammar dasar.",
        "Mini-Game 4 - Listen & Pick: Mendengarkan kata via Text-to-Speech lalu memilih jawaban. Melatih listening skill.",
        "Mini-Game 5 - Quick Quiz: Kuis pilihan ganda campuran semua materi dengan timer.",
        "Sistem Poin & Level: XP, bintang, dan level untuk motivasi belajar berkelanjutan.",
        "Achievement System: 10 pencapaian untuk reward progression.",
        "Leaderboard: Papan skor untuk kompetisi sehat.",
        "Audio Visualizer: Visualisasi frekuensi audio real-time (FFT).",
      ],
    },
    {
      title: "3. Teknik Elemen Media",
      content: [
        "KOMPRESI AUDIO:",
        "- DynamicsCompressorNode (Web Audio API): threshold -24dB, ratio 12:1, attack 3ms, release 250ms.",
        "- Algoritma kompresi dinamis mencegah audio clipping dan menjaga kualitas sinyal.",
        "- Soft knee 30dB untuk transisi kompresi yang lebih natural.",
        "",
        "KOMPRESI VISUAL:",
        "- CSS will-change pada elemen animasi: mendorong elemen ke GPU layer terpisah (mengurangi repaints).",
        "- Canvas 2D API dengan requestAnimationFrame (optimal 60fps).",
        "- SVG-based emoji rendering (vector, skalabel tanpa pixelasi).",
        "- Font: Google Fonts dengan font-display: swap (mencegah FOIT).",
        "",
        "SIGNAL PROCESSING:",
        "- AnalyserNode FFT size 256: menganalisis spektrum frekuensi audio real-time (128 frequency bins).",
        "- Web Speech API (TTS): rate 0.85, pitch 1.1 untuk kejelasan ucapan anak.",
        "- BiquadFilterNode lowpass (fc=3000Hz, Q=0.5): menghaluskan karakter suara sintesis.",
        "- OscillatorNode dengan Attack-Decay envelope (exponentialRampToValueAtTime) untuk feedback suara.",
        "- Waveform types: sine (halus), sawtooth (tajam/negatif), triangle (klik), square (fanfare).",
        "",
        "KEAMANAN (SECURITY):",
        "- Input sanitization: fungsi sanitizeInput() mencegah XSS injection.",
        "- Escape karakter HTML (&, <, >, \", ') pada semua input pengguna.",
        "- LocalStorage hanya menyimpan data game (bukan data sensitif).",
        "- Content Security: semua konten dirender secara client-side tanpa server.",
        "- Input validation: maxlength 20 karakter pada input nama pemain.",
      ],
    },
    {
      title: "4. Arsitektur Sistem",
      content: [
        "STRUKTUR FILE:",
        "- index.html: Entry point, markup semua screen",
        "- css/style.css: Semua styling dengan CSS variables",
        "- js/audio.js: Audio engine (Web Audio API)",
        "- js/data.js: Bank soal & data game",
        "- js/games/vocabulary.js: Word Match game logic",
        "- js/games/spelling.js: Spell It game logic",
        "- js/games/sentence.js: Sentence Builder logic",
        "- js/games/listening.js: Listen & Pick logic",
        "- js/games/quiz.js: Quick Quiz logic",
        "- js/ui.js: UI components & animations",
        "- js/pdf.js: PDF generator",
        "- js/main.js: App controller & player data",
        "",
        "DATA FLOW:",
        "1. main.js inisialisasi app & load player data dari localStorage",
        "2. User pilih game → GameEngine.start(type)",
        "3. Game module render soal dari GameData",
        "4. AudioEngine proses feedback suara",
        "5. PlayerData update skor & achievements",
        "6. UI update progress bars & leaderboard",
      ],
    },
    {
      title: "5. Panduan Penggunaan",
      content: [
        "MEMULAI GAME:",
        "1. Buka index.html di browser modern.",
        "2. Tunggu loading screen selesai.",
        '3. Klik "Mulai Petualangan!" dan masukkan nama.',
        "4. Pilih avatar favoritmu.",
        "5. Klik mini-game yang ingin dimainkan.",
        "",
        "ATURAN PERMAINAN:",
        "- Setiap game terdiri dari 10 soal.",
        "- Jawab dengan benar untuk mendapatkan poin.",
        "- Poin bonus untuk jawaban cepat (time bonus).",
        "- 3 nyawa tersedia per game session.",
        "- Kumpulkan bintang berdasarkan persentase benar.",
        "",
        "SISTEM POIN:",
        "- Base poin: 100 per jawaban benar",
        "- Time bonus: +1 poin per detik tersisa",
        "- Combo: +10% per streak jawaban benar",
        "- 3 bintang: ≥80% benar",
        "- 2 bintang: ≥60% benar",
        "- 1 bintang: ≥40% benar",
      ],
    },
    {
      title: "6. Kompatibilitas & Persyaratan",
      content: [
        "Browser yang didukung:",
        "- Chrome 90+ (Recommended)",
        "- Firefox 88+",
        "- Safari 14+",
        "- Edge 90+",
        "",
        "Persyaratan teknis:",
        "- Web Audio API support (untuk audio engine)",
        "- Speech Synthesis API (untuk fitur listening)",
        "- LocalStorage (untuk menyimpan progres)",
        "- Canvas 2D API (untuk animasi)",
        "- ES6+ JavaScript support",
        "",
        "Tidak memerlukan:",
        "- Backend server / database",
        "- Plugin tambahan",
        "- Instalasi aplikasi",
        "- Akun pengguna",
      ],
    },
  ],
};

function openPDF() {
  // Tampilkan preview PDF dalam modal
  const content = document.getElementById("pdf-content");
  if (!content) return;

  content.innerHTML = pdfContent.sections
    .map(
      (sec) => `
    <div class="pdf-section">
      <h3>${sanitizeInput(sec.title)}</h3>
      ${sec.content
        .map((line) => {
          if (line === "") return "<br/>";
          if (
            line.endsWith(":") &&
            !line.startsWith("-") &&
            !line.startsWith("•")
          ) {
            return `<p style="color:var(--accent);font-weight:800;margin-top:0.5rem">${sanitizeInput(line)}</p>`;
          }
          return `<p>${sanitizeInput(line)}</p>`;
        })
        .join("")}
    </div>
  `,
    )
    .join("");

  document.getElementById("pdf-modal").style.display = "flex";
}

function downloadPDF() {
  showToast("⏳ Menyiapkan PDF...");

  loadJsPDF(() => {
    try {
      const { jsPDF } = window.jspdf;
      // Membuat PDF baru - landscape A4
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentW = pageW - 2 * margin;
      let y = margin;

      // Helper: cek apakah konten berikutnya muat di halaman saat ini,
      // jika tidak tambah halaman baru otomatis
      function checkNewPage(needed = 15) {
        if (y + needed > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      }

      // === HALAMAN 1: COVER ===
      // Background header
      doc.setFillColor(30, 30, 58);
      doc.rect(0, 0, pageW, 80, "F");

      // Judul
      doc.setFontSize(32);
      doc.setTextColor(255, 107, 107);
      doc.setFont("helvetica", "bold");
      doc.text("EnglishQuest", pageW / 2, 35, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(255, 230, 109);
      doc.text("Game Edukasi Bahasa Inggris", pageW / 2, 48, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setTextColor(167, 169, 190);
      doc.text(
        "Sistem Multimedia - Media Pendidikan Interaktif",
        pageW / 2,
        60,
        { align: "center" },
      );
      doc.text("Untuk Siswa Usia 9-12 Tahun", pageW / 2, 70, {
        align: "center",
      });

      y = 95;

      // Info box
      doc.setFillColor(245, 245, 255);
      doc.roundedRect(margin, y, contentW, 35, 4, 4, "F");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 120);
      doc.setFont("helvetica", "bold");
      doc.text("Informasi Dokumen", margin + 5, y + 8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Versi: 1.0.0    |    Tahun: 2024    |    Platform: Web Browser",
        margin + 5,
        y + 16,
      );
      doc.text(
        "Teknologi: HTML5 · CSS3 · JavaScript · Web Audio API · Canvas 2D",
        margin + 5,
        y + 24,
      );
      doc.text(
        "Lisensi: Pendidikan - Bebas digunakan untuk keperluan pembelajaran",
        margin + 5,
        y + 32,
      );
      y += 45;

      // Konten sections
      pdfContent.sections.forEach((sec) => {
        checkNewPage(20);

        // Section header
        doc.setFillColor(255, 107, 107);
        doc.rect(margin, y - 1, 4, 10, "F");
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 80);
        doc.setFont("helvetica", "bold");
        doc.text(sec.title, margin + 8, y + 7);
        y += 14;

        // Content lines
        sec.content.forEach((line) => {
          checkNewPage(8);
          if (line === "") {
            y += 3;
            return;
          }

          if (
            line.endsWith(":") &&
            !line.startsWith("-") &&
            !line.startsWith("•")
          ) {
            doc.setFontSize(10);
            doc.setTextColor(255, 107, 107);
            doc.setFont("helvetica", "bold");
            doc.text(line, margin + 2, y);
            y += 5;
          } else if (line.startsWith("-")) {
            doc.setFontSize(9.5);
            doc.setTextColor(60, 60, 100);
            doc.setFont("helvetica", "normal");
            const lns = doc.splitTextToSize(line, contentW - 8);
            doc.text(lns, margin + 6, y);
            y += lns.length * 4;
          } else {
            doc.setFontSize(9.5);
            doc.setTextColor(60, 60, 100);
            doc.setFont("helvetica", "normal");
            const lns = doc.splitTextToSize(line, contentW - 4);
            doc.text(lns, margin + 2, y);
            y += lns.length * 4.2;
          }
        });
        y += 6;
      });

      // Footer setiap halaman
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(30, 30, 58);
        doc.rect(0, pageH - 12, pageW, 12, "F");
        doc.setFontSize(8);
        doc.setTextColor(167, 169, 190);
        doc.setFont("helvetica", "normal");
        doc.text(
          "EnglishQuest © 2024 - Sistem Multimedia - Media Pendidikan Interaktif",
          margin,
          pageH - 5,
        );
        doc.text(`Halaman ${i} / ${pageCount}`, pageW - margin, pageH - 5, {
          align: "right",
        });
      }

      // Simpan PDF dengan kompresi internal jsPDF (pako deflate)
      doc.save("EnglishQuest_Panduan_Sistem.pdf");
      showToast("✅ PDF berhasil diunduh!");
    } catch (e) {
      console.error("PDF error:", e);
      showToast("❌ Gagal membuat PDF. Coba lagi.");
    }
  });
}
