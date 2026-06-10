/**
 * EnglishQuest - Audio Engine
 *
 * Memanfaatkan Web Audio API untuk menghasilkan suara tanpa file audio eksternal.
 * Semua suara disintetis langsung di browser menggunakan OscillatorNode.
 *
 * Teknik signal processing yang digunakan:
 *  - OscillatorNode      : sumber suara (gelombang sinus, segitiga, kotak, gigi gergaji)
 *  - GainNode            : mengontrol volume dan envelope ADSR
 *  - BiquadFilterNode    : low-pass filter untuk memperhalus karakter suara
 *  - DynamicsCompressorNode : kompresi dinamis agar volume tetap konsisten
 *  - AnalyserNode        : analisis FFT untuk visualisasi waveform real-time
 *  - Web Speech API (TTS): mengucapkan teks untuk game Listening
 */

const AudioEngine = (() => {
  // Variabel internal — tidak bisa diakses dari luar modul
  let ctx = null; // AudioContext (dibuat saat pertama kali digunakan)
  let masterGain = null; // Kontrol volume keseluruhan
  let compressor = null; // Dynamics compressor
  let analyser = null; // Node untuk visualisasi FFT
  let visualizerRAF = null; // ID animasi frame visualizer
  let soundEnabled = true; // Status suara nyala/mati
  let speechSynth = window.speechSynthesis || null; // API Text-to-Speech browser

  /**
   * Inisialisasi AudioContext dan routing node.
   * Dilakukan secara lazy (hanya dibuat sekali saat pertama dibutuhkan)
   * karena browser tidak mengizinkan AudioContext dibuat sebelum ada
   * interaksi dari pengguna.
   *
   * Alur routing: source → gainNode → compressor → analyser → output (speaker)
   */
  function init() {
    if (ctx) return; // Sudah diinisialisasi sebelumnya
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain — mengontrol volume semua suara
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7; // volume 70%

      // Dynamics Compressor
      // Mencegah audio clipping dan menjaga kualitas sinyal
      // threshold: kompresi mulai bekerja di bawah -24 dB
      // knee     : zona transisi lunak selebar 30 dB
      // ratio    : setiap 12 dB input → 1 dB output (kompresi kuat)
      // attack   : waktu compressor bereaksi (3 ms)
      // release  : waktu compressor berhenti bekerja (250 ms)
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Analyser untuk visualisasi frekuensi (FFT)
      // fftSize 256 → 128 frequency bins, cukup untuk visualisasi bar sederhana
      // smoothingTimeConstant → seberapa "halus" transisi antar frame (0–1)
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Sambungkan semua node ke chain
      masterGain.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn("Web Audio API tidak didukung browser ini:", e);
    }
  }

  /**
   * Resume AudioContext jika sedang suspended.
   * Browser modern otomatis suspend AudioContext sampai ada interaksi user.
   */
  async function resume() {
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  /**
   * Mainkan efek suara sesuai tipe yang diminta.
   * Setiap jenis suara dibuat dari OscillatorNode dengan
   * pengaturan frekuensi dan envelope gain yang berbeda.
   *
   * @param {string} type — 'correct' | 'wrong' | 'click' | 'level_up' | 'coin' | 'start'
   */
  function play(type) {
    if (!soundEnabled) return;
    init();
    resume();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Low-pass filter untuk menghaluskan suara hasil sintesis
    // (memotong frekuensi tinggi yang terdengar kasar)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3000; // potong di 3 kHz
    filter.Q.value = 0.5; // lebar bandwidth filter

    // Routing: oscillator → filter → gain → master
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    switch (type) {
      case "correct":
        // Arpeggio naik C5-E5-G5 (mayor chord) — terasa positif dan menyenangkan
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case "wrong":
        // Nada turun dengan gelombang sawtooth — terasa negatif/gagal
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "click":
        // Klik singkat dan ringan — feedback UI tombol
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case "level_up":
        // Fanfare G4-C5-E5-C6 — perayaan naik level
        osc.type = "square";
        filter.frequency.value = 5000; // lebih terang untuk fanfare
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.1); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
        break;

      case "coin":
        // Nada koin C6-E6 — efek reward/poin
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now);
        osc.frequency.setValueAtTime(1318.5, now + 0.07);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case "start":
        // Intro suara A4-A5 — tanda game/layar baru dimulai
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      default:
        // Suara default jika tipe tidak dikenali
        osc.type = "sine";
        osc.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
  }

  /**
   * Text-to-Speech menggunakan Web Speech API.
   * Dipakai di game Listen & Pick untuk mengucapkan kata.
   *
   * Parameter audio yang dikonfigurasi:
   *  - lang  : en-US (aksen Amerika)
   *  - rate  : 0.85 (sedikit lebih lambat agar mudah dipahami anak)
   *  - pitch : 1.1  (nada sedikit lebih tinggi, terasa lebih ramah)
   *  - volume: 0.9  (hampir penuh)
   *
   * @param {string}   text   — kata yang akan diucapkan
   * @param {function} onEnd  — callback dipanggil setelah TTS selesai
   */
  function speak(text, onEnd) {
    if (!speechSynth) {
      // Browser tidak mendukung TTS, langsung panggil callback
      if (onEnd) onEnd();
      return;
    }

    // Sanitasi teks sebelum diproses (hanya karakter aman)
    const sanitized = String(text)
      .replace(/[<>&"']/g, "")
      .substring(0, 200);

    speechSynth.cancel(); // Batalkan ucapan sebelumnya jika ada

    const utter = new SpeechSynthesisUtterance(sanitized);
    utter.lang = "en-US";
    utter.rate = 0.85;
    utter.pitch = 1.1;
    utter.volume = soundEnabled ? 0.9 : 0;

    // Pilih suara terbaik: preferensi Google US / Natural, fallback ke suara en lain
    const voices = speechSynth.getVoices();
    const preferred =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("US")),
      ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;

    utter.onend = onEnd || null;
    speechSynth.speak(utter);
  }

  /**
   * Visualisasi frekuensi audio secara real-time di canvas.
   * Mengambil data FFT dari AnalyserNode setiap frame,
   * lalu menggambar bar dengan tinggi sesuai amplitudo frekuensi.
   *
   * Gradient warna: merah (bawah) → cyan (tengah) → ungu (atas)
   */
  function startVisualizer() {
    if (!analyser) return;

    const canvas = document.getElementById("audio-visualizer");
    if (!canvas) return;

    const canvasCtx = canvas.getContext("2d");
    const bufferLen = analyser.frequencyBinCount; // jumlah bin FFT = fftSize / 2
    const dataArray = new Uint8Array(bufferLen); // array untuk data amplitudo (0–255)

    function draw() {
      visualizerRAF = requestAnimationFrame(draw);

      // Ambil data frekuensi terbaru dari analyser
      analyser.getByteFrequencyData(dataArray);

      // Sesuaikan ukuran canvas dengan elemen tampilan
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLen) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLen; i++) {
        // Normalkan nilai (0–255) ke tinggi bar dalam piksel
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient warna per bar
        const gradient = canvasCtx.createLinearGradient(
          0,
          canvas.height,
          0,
          canvas.height - barHeight,
        );
        gradient.addColorStop(0, "rgba(255,107,107,0.8)"); // merah di bawah
        gradient.addColorStop(0.5, "rgba(78,205,196,0.6)"); // cyan di tengah
        gradient.addColorStop(1, "rgba(162,155,254,0.4)"); // ungu di atas

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    draw();
  }

  // Hentikan animasi visualizer
  function stopVisualizer() {
    if (visualizerRAF) cancelAnimationFrame(visualizerRAF);
  }

  // Nyalakan / matikan suara secara toggle
  function toggleSound() {
    soundEnabled = !soundEnabled;
    // Atur volume master: 0.7 jika nyala, 0 jika mati
    if (masterGain) masterGain.gain.value = soundEnabled ? 0.7 : 0;

    // Update ikon tombol sound di navbar
    const btn = document.getElementById("sound-toggle");
    if (btn) btn.textContent = soundEnabled ? "🔊" : "🔇";

    return soundEnabled;
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  return {
    init,
    play,
    speak,
    startVisualizer,
    stopVisualizer,
    toggleSound,
    isSoundEnabled,
  };
})();
