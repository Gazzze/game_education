# EnglishQuest — Game Edukasi Bahasa Inggris

> Platform game edukasi berbasis web untuk siswa SD usia 9–12 tahun.  
> Dibuat dengan **HTML5, CSS3, JavaScript murni** — tanpa framework, tanpa backend.

---

## Cara Menjalankan

```
1. Buka folder project di VS Code
2. Klik kanan index.html → "Open with Live Server"
   ATAU
   Klik dua kali index.html → terbuka langsung di browser
```

Tidak perlu install apapun. Tidak butuh server atau database.

---

## Fitur Mini-Game

| Game             | Skill yang Dilatih                     | Timer    |
| ---------------- | -------------------------------------- | -------- |
| Word Match       | Vocabulary — cocokkan kata dengan arti | 30 detik |
| Spell It!        | Spelling — susun huruf acak jadi kata  | 45 detik |
| Sentence Builder | Grammar — susun kata jadi kalimat      | 60 detik |
| Listen & Pick    | Listening — dengar TTS, pilih jawaban  | 60 detik |
| Quick Quiz       | Mixed — kuis pilihan ganda campuran    | 20 detik |

**Aturan umum:**

- 10 soal per sesi, dipilih acak setiap main
- 3 nyawa — jika habis, game langsung berakhir
- Poin = 100 (base) + sisa waktu (time bonus) + combo streak (+10% per streak)
- Bintang: 3 bintang ≥80% · 2 bintang ≥60% · 1 bintang ≥40%

---

## Poin Penilaian

### 1. Ketepatan Penggunaan Elemen Media + Teknik Pemrosesannya

---

#### AUDIO — Web Audio API

Semua suara **disintetis langsung di browser** menggunakan `OscillatorNode`.  
Tidak ada file audio eksternal (.mp3/.wav) sama sekali.

**Signal Processing Chain:**

```
OscillatorNode → BiquadFilterNode → GainNode → DynamicsCompressor → AnalyserNode → Speaker
```

| Node                     | Fungsi                                    | Parameter                                                         |
| ------------------------ | ----------------------------------------- | ----------------------------------------------------------------- |
| `OscillatorNode`         | Sumber suara (gelombang)                  | sine / sawtooth / triangle / square                               |
| `BiquadFilterNode`       | Low-pass filter — potong frekuensi tinggi | fc = 3000 Hz, Q = 0.5                                             |
| `GainNode`               | Envelope Attack-Decay                     | `exponentialRampToValueAtTime()`                                  |
| `DynamicsCompressorNode` | **Kompresi audio** — cegah clipping       | threshold -24dB, ratio 12:1, attack 3ms, release 250ms, knee 30dB |
| `AnalyserNode`           | **FFT** — visualisasi frekuensi real-time | fftSize 256 → 128 frequency bins                                  |

**Desain suara per aksi:**

| Aksi          | Waveform   | Frekuensi              | Alasan          |
| ------------- | ---------- | ---------------------- | --------------- |
| Jawaban benar | `sine`     | C5→E5→G5 (mayor chord) | Terasa positif  |
| Jawaban salah | `sawtooth` | 300→150 Hz (turun)     | Terasa negatif  |
| Klik tombol   | `triangle` | 800→400 Hz             | Ringan, singkat |
| Level up      | `square`   | G4→C5→E5→C6 (fanfare)  | Perayaan        |
| Reward/koin   | `sine`     | C6→E6                  | Cerah, reward   |

**Text-to-Speech (Listen & Pick):**

```javascript
utter.lang = "en-US"; // aksen Amerika
utter.rate = 0.85; // lebih lambat agar jelas
utter.pitch = 1.1; // nada lebih tinggi, ramah anak
utter.volume = 0.9;
```

Pemilihan suara: preferensi Google US / Natural → fallback suara `en` lainnya.

---

#### VISUAL — Canvas 2D API

**Background partikel** (`ui.js` → `BgCanvas`):

- Jumlah partikel menyesuaikan lebar layar (`innerWidth / 25`)
- Efek constellation — garis penghubung antar partikel jika jarak < 100px
- Loop animasi dengan `requestAnimationFrame` (~60fps)

**Audio Visualizer** (`audio.js` → `startVisualizer`):

- Membaca data `getByteFrequencyData()` dari `AnalyserNode` setiap frame
- Menggambar bar dengan gradient: merah (bawah) → cyan (tengah) → ungu (atas)
- Tinggi bar = `(amplitudo / 255) × tinggi canvas`

**Kembang api hasil game** (`ui.js` → `Fireworks`):

- 5 ledakan beruntun, setiap ledakan = 60 partikel menyebar 360°
- Efek trail dengan overlay semi-transparan `rgba(15,14,23,0.15)`
- Simulasi gravitasi: `p.vy += 0.08` per frame

**Optimasi rendering (CSS `will-change`):**

```css
/* GPU compositing — elemen didorong ke layer terpisah di GPU */
#bg-canvas {
  will-change: transform;
}
.mascot-emoji {
  will-change: transform;
}
.timer-strip {
  will-change: width;
}
.fireworks-canvas {
  will-change: transform;
}
```

---

#### KEAMANAN — Security

**XSS Prevention** (`data.js` → `sanitizeInput()`):

```javascript
function sanitizeInput(str) {
  return String(str)
    .replace(/&/g, "&amp;") // & → &amp;
    .replace(/</g, "&lt;") // < → &lt;
    .replace(/>/g, "&gt;") // > → &gt;
    .replace(/"/g, "&quot;") // " → &quot;
    .replace(/'/g, "&#039;") // ' → &#039;
    .trim()
    .substring(0, 100); // batas maksimal 100 karakter
}
```

Dipanggil pada **semua** output ke DOM: nama pemain, teks soal, pilihan jawaban, leaderboard.

**Input Validation:**

- `maxlength="20"` pada input nama (HTML attribute)
- Nama kosong ditolak sebelum disimpan (`confirmPlayer()`)
- Data pemain di-sanitasi ulang sebelum disimpan ke `localStorage`

**Storage Safety:**

- `localStorage` hanya menyimpan data game (skor, bintang, progress) — bukan data sensitif
- `JSON.parse` dibungkus `try-catch` — jika data korup, otomatis pakai nilai default

---

### 2. Presentasi Sistem Jadi + PDF Guideline Book

**Sistem berjalan penuh** dengan semua fitur:

- 5 mini-game fungsional dengan logika berbeda
- Sistem nyawa — game over saat nyawa habis
- Sistem XP, level, bintang, achievement (10 pencapaian), leaderboard lokal
- Audio visualizer real-time di halaman home
- Loading screen dengan animasi huruf

**PDF Guideline Book** (`js/pdf.js`):

- Klik tombol **"Buku Panduan"** di halaman home → preview modal
- Klik **"Download PDF"** → unduh file `EnglishQuest_Panduan_Sistem.pdf`
- Dibuat dengan library `jsPDF` (dimuat dari CDN, butuh koneksi internet)
- Isi: Pendahuluan, Fitur, Teknik Elemen Media, Arsitektur, Panduan, Kompatibilitas

---

## Arsitektur & Struktur File

```
game_education/
├── index.html                  <- Entry point, semua screen ada di sini
├── css/
│   ├── style.css               <- Styling utama + CSS variables
│   └── games.css               <- Styling khusus per mini-game
└── js/
    ├── audio.js                <- Audio Engine (Web Audio API + TTS)
    ├── data.js                 <- Bank soal + sanitizeInput + helper functions
    ├── main.js                 <- PlayerData + GameEngine + Screen Manager
    ├── ui.js                   <- BgCanvas + Fireworks + Toast + Modal
    ├── pdf.js                  <- PDF Generator (jsPDF)
    └── games/
        ├── vocabulary.js       <- Word Match game logic
        ├── spelling.js         <- Spell It! game logic
        ├── sentence.js         <- Sentence Builder game logic
        ├── listening.js        <- Listen & Pick game logic
        └── quiz.js             <- Quick Quiz game logic
```

**Alur data:**

```
DOMContentLoaded
    → runLoadingScreen()
    → finishLoading()
        → BgCanvas.init()               (animasi partikel background)
        → AudioEngine.startVisualizer() (visualizer frekuensi)
        → updateHomeUI()                (baca localStorage → tampilkan progres)

User klik game card
    → GameEngine.start(type)
        → [Game].init()                 (ambil soal acak dari GameData)
        → GameEngine.startTimer()
        → [Game].render()               (tampilkan soal)

User jawab
    → GameEngine.calculatePoints()
    → GameEngine.loseLife()             (return true jika game over)
    → GameEngine.endGame() / gameOver()
        → PlayerData.recordGameResult()
        → PlayerData.addXP()
        → showScreen("result-screen")
        → Fireworks.start()
```

---

## API & Teknologi

| Teknologi      | Dipakai Untuk                                | Butuh Internet?    |
| -------------- | -------------------------------------------- | ------------------ |
| Web Audio API  | Efek suara sintetis + FFT visualizer         | Tidak              |
| Web Speech API | Text-to-Speech di game Listening             | Tidak              |
| Canvas 2D API  | Partikel background + fireworks + visualizer | Tidak              |
| localStorage   | Simpan data pemain & progres                 | Tidak              |
| Google Fonts   | Font Fredoka One + Nunito                    | Ya                 |
| jsPDF (CDN)    | Generate & download PDF guideline            | Ya (saat download) |

95% fitur berjalan offline. Hanya font dan PDF yang membutuhkan koneksi internet.

---

## Poin Teknis untuk Presentasi

**Q: Bagaimana kompresi audio bekerja?**  
A: `DynamicsCompressorNode` — setiap sinyal di atas threshold -24dB dikompres dengan ratio 12:1. Artinya setiap 12dB kenaikan input hanya menghasilkan 1dB kenaikan output. Ini mencegah audio clipping dan menjaga volume tetap konsisten.

**Q: Apa itu FFT dalam project ini?**  
A: `AnalyserNode` dengan `fftSize = 256` menghasilkan 128 frequency bins. Setiap frame, data amplitudo per frekuensi dibaca dan digambar sebagai bar di canvas — itulah audio visualizer yang terlihat di halaman home.

**Q: Bagaimana keamanan input dijaga?**  
A: Semua string dari pengguna dilewatkan fungsi `sanitizeInput()` yang mengubah karakter HTML berbahaya (`< > & " '`) menjadi HTML entities sebelum dirender ke DOM. Ini mencegah serangan XSS.

**Q: Kenapa tidak pakai file audio (.mp3)?**  
A: Semua suara disintetis menggunakan `OscillatorNode` — tidak perlu file eksternal, loading lebih cepat, dan ukuran project lebih kecil. Ini juga membuktikan pemahaman Web Audio API secara langsung.

**Q: Apa perbedaan waveform yang dipakai?**  
A: `sine` = halus/mulus (jawaban benar), `sawtooth` = tajam/kasar (jawaban salah), `triangle` = lembut (klik tombol), `square` = tegas/keras (level up). Setiap karakter suara dipilih sesuai konteks emosi.
