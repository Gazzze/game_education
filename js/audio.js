/**
 * EnglishQuest - Audio Engine
 * Teknik Signal Processing: Web Audio API
 * - Kompresi dinamis (DynamicsCompressorNode)
 * - Visualisasi waveform real-time (AnalyserNode)
 * - Sintesis suara (OscillatorNode) tanpa file audio eksternal
 * - Gain control untuk keamanan volume
 */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let compressor = null;
  let analyser = null;
  let visualizerRAF = null;
  let soundEnabled = true;
  let speechSynth = window.speechSynthesis || null;

  // Inisialisasi AudioContext (lazy init untuk kompatibilitas browser)
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master Gain (kontrol volume keseluruhan)
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;

      // Dynamics Compressor - teknik kompresi audio signal
      // Mencegah clipping dan menjaga kualitas suara
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);  // mulai kompresi di -24dB
      compressor.knee.setValueAtTime(30, ctx.currentTime);        // soft knee 30dB
      compressor.ratio.setValueAtTime(12, ctx.currentTime);       // rasio kompresi 12:1
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);   // attack cepat
      compressor.release.setValueAtTime(0.25, ctx.currentTime);   // release lebih lambat

      // Analyser untuk visualisasi waveform (FFT)
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;           // resolusi FFT
      analyser.smoothingTimeConstant = 0.8;  // smoothing sinyal

      // Routing: source → gain → compressor → analyser → output
      masterGain.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(ctx.destination);

    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // Resume AudioContext (diperlukan setelah user interaction)
  async function resume() {
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  /**
   * Synth suara kustom menggunakan OscillatorNode
   * @param {string} type - jenis suara: 'correct','wrong','click','level_up','coin'
   */
  function play(type) {
    if (!soundEnabled) return;
    init();
    resume();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.connect(masterGain);

    // Filter untuk warna suara yang lebih kaya
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;
    osc.connect(filter);
    filter.connect(gainNode);

    switch (type) {
      case 'correct':
        // Nada naik (C-E-G major arpeggio) — feedback positif
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);       // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'wrong':
        // Nada turun — feedback negatif
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'click':
        // Klik ringan — UI feedback
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'level_up':
        // Fanfare — naik level
        osc.type = 'square';
        filter.frequency.value = 5000;
        osc.frequency.setValueAtTime(392, now);       // G4
        osc.frequency.setValueAtTime(523.25, now + 0.1); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
        break;

      case 'coin':
        // Koin — reward
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);
        osc.frequency.setValueAtTime(1318.5, now + 0.07);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'start':
        // Intro suara
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      default:
        osc.type = 'sine';
        osc.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
  }

  /**
   * Text-to-Speech untuk game Listening
   * Menggunakan Web Speech API dengan pengaturan signal (pitch, rate, volume)
   * @param {string} text - kata yang diucapkan
   * @param {function} onEnd - callback setelah selesai
   */
  function speak(text, onEnd) {
    if (!speechSynth) {
      if (onEnd) onEnd();
      return;
    }
    // Sanitasi input sebelum diproses (keamanan)
    const sanitized = String(text).replace(/[<>&"']/g, '').substring(0, 200);

    speechSynth.cancel();
    const utter = new SpeechSynthesisUtterance(sanitized);

    // Konfigurasi signal audio
    utter.lang = 'en-US';
    utter.rate = 0.85;   // kecepatan bicara (0.1 - 10)
    utter.pitch = 1.1;   // nada (0 - 2)
    utter.volume = soundEnabled ? 0.9 : 0;

    // Pilih suara yang cocok
    const voices = speechSynth.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('US'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;

    utter.onend = onEnd || null;
    speechSynth.speak(utter);
  }

  /**
   * Visualisasi audio real-time menggunakan AnalyserNode
   * Menampilkan waveform / frequency bars pada canvas
   */
  function startVisualizer() {
    if (!analyser) return;
    const canvas = document.getElementById('audio-visualizer');
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      visualizerRAF = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);  // Data FFT

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        // Gradient warna untuk efek visual
        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(255,107,107,0.8)');
        gradient.addColorStop(0.5, 'rgba(78,205,196,0.6)');
        gradient.addColorStop(1, 'rgba(162,155,254,0.4)');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();
  }

  function stopVisualizer() {
    if (visualizerRAF) cancelAnimationFrame(visualizerRAF);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (masterGain) masterGain.gain.value = soundEnabled ? 0.7 : 0;
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
    return soundEnabled;
  }

  function isSoundEnabled() { return soundEnabled; }

  return { init, play, speak, startVisualizer, stopVisualizer, toggleSound, isSoundEnabled };
})();
