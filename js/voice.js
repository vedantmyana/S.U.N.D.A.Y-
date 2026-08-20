/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — VOICE ENGINE & AUDIO SUBSYSTEM (js/voice.js)
 * ============================================================================
 * Coordinates:
 * 1. Real-time microphone capture via Web Audio API AnalyserNode.
 * 2. Speech Recognition (Speech-to-Text).
 * 3. Text-to-Speech (TTS Voice Synthesis) with Core animation synchronization.
 * 4. Real-time FFT frequency waveform visualization.
 */

export class SundayVoiceController {
  constructor(options = {}) {
    this.voiceBtn = document.getElementById('voiceToggleBtn');
    this.waveformCanvas = document.getElementById('voiceWaveformCanvas');
    this.waveformStatus = document.getElementById('waveformStatus');
    this.topAudioStatus = document.getElementById('topAudioStatus');
    this.hudVoiceBadge = document.getElementById('hudVoiceStatusBadge');

    // Callbacks
    this.onStateChange = options.onStateChange || null;
    this.onAudioData = options.onAudioData || null;
    this.onSpeechResult = options.onSpeechResult || null;
    this.onError = options.onError || null;
    
    // Voice States: 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
    this.state = 'idle';

    // Web Audio API Context & Analyser
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.sourceNode = null;
    this.freqData = null;
    this.timeData = null;
    this.currentAmplitude = 0;

    // Speech Recognition
    this.recognition = null;
    this.isSpeechSupported = false;
    this.initSpeechRecognition();

    // Text to Speech
    this.synth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.speechRate = 1.0;
    this.initTTSVoices();

    // Canvas Waveform Context
    if (this.waveformCanvas) {
      this.ctx = this.waveformCanvas.getContext('2d');
      this.width = this.waveformCanvas.width;
      this.height = this.waveformCanvas.height;
    }

    this.waveformTime = 0;
    this.initEventListeners();
    this.startWaveformLoop();
  }

  initEventListeners() {
    if (this.voiceBtn) {
      this.voiceBtn.addEventListener('click', () => this.toggleVoiceListening());
    }
  }

  // ==========================================================================
  // TEXT-TO-SPEECH (TTS) SYNTHESIS & CORE SYNC
  // ==========================================================================

  initTTSVoices() {
    if (!this.synth) return;
    
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Look for smooth natural voices (e.g. Google UK English, Microsoft, or en-US)
      this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David'))) || voices[0];
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  speakText(text, onStart, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Clean text for speech (strip HTML tags)
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.speechRate;
    utterance.pitch = 1.05; // Slightly elevated technical pitch

    utterance.onstart = () => {
      this.setState('speaking');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.setState('idle');
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[Voice Engine] Speech synthesis error:', e);
      this.setState('idle');
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.setState('idle');
    }
  }

  // ==========================================================================
  // SPEECH RECOGNITION SUBSYSTEM (Web Speech API)
  // ==========================================================================

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSpeechSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log('[Voice Engine] Speech recognition active.');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        const inputField = document.getElementById('chatTextInput');
        if (inputField && transcript) {
          inputField.value = transcript;
        }

        if (finalTranscript && this.onSpeechResult) {
          this.setState('processing');
          this.onSpeechResult(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[Voice Engine] Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          this.handleMicError('MICROPHONE ACCESS REQUIRED: Permission denied by user/browser.');
        }
      };

      this.recognition.onend = () => {
        if (this.state === 'listening') {
          this.stopMicrophoneStream();
          this.setState('idle');
        }
      };
    } else {
      console.warn('[Voice Engine] Web Speech API not natively supported in this browser. Fallback enabled.');
    }
  }

  // ==========================================================================
  // REAL-TIME AUDIO CONTEXT & MICROPHONE CAPTURE
  // ==========================================================================

  async startMicrophoneStream() {
    try {
      this.stopSpeaking();

      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;

        this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
        this.sourceNode.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        this.freqData = new Uint8Array(bufferLength);
        this.timeData = new Uint8Array(bufferLength);
      }

      if (this.recognition && this.isSpeechSupported) {
        try {
          this.recognition.start();
        } catch (e) {}
      }

      this.setState('listening');
    } catch (err) {
      console.error('[Voice Engine] Microphone access failed:', err);
      this.handleMicError('MICROPHONE ACCESS REQUIRED: Please allow microphone access in browser settings.');
    }
  }

  stopMicrophoneStream() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }

    this.currentAmplitude = 0;
  }

  async toggleVoiceListening() {
    if (this.state === 'idle') {
      await this.startMicrophoneStream();
    } else if (this.state === 'listening') {
      this.stopMicrophoneStream();
      this.setState('processing');
      setTimeout(() => this.setState('idle'), 1200);
    } else {
      this.stopMicrophoneStream();
      this.stopSpeaking();
      this.setState('idle');
    }
  }

  handleMicError(errMsg) {
    this.setState('error');
    if (this.onError) {
      this.onError(errMsg);
    }
    setTimeout(() => {
      this.setState('idle');
    }, 4000);
  }

  setState(newState) {
    this.state = newState;

    // Update Mic Button UI
    if (this.voiceBtn) {
      this.voiceBtn.className = `hud-voice-btn state-${newState}`;
      const stateBadge = this.voiceBtn.querySelector('.mic-badge-state');
      if (stateBadge) stateBadge.textContent = newState.toUpperCase();
    }

    // Update Top Bar & Telemetry Badges
    if (this.topAudioStatus) {
      this.topAudioStatus.textContent = newState.toUpperCase();
    }
    if (this.hudVoiceBadge) {
      this.hudVoiceBadge.textContent = newState.toUpperCase();
      this.hudVoiceBadge.className = `status-badge ${
        newState === 'listening' ? 'state-online' : 
        (newState === 'idle' ? 'state-ready' : 
        (newState === 'error' ? 'state-busy' : 'state-standby'))
      }`;
    }
    if (this.waveformStatus) {
      this.waveformStatus.textContent = 
        newState === 'idle' ? 'STANDBY' : 
        (newState === 'listening' ? 'LIVE CAPTURE' : 
        (newState === 'speaking' ? 'NEURAL TTS ACTIVE' : 
        (newState === 'error' ? 'ERROR' : 'PROCESSING')));
    }

    // Delegate state change
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  // ==========================================================================
  // REAL-TIME WAVEFORM & FREQUENCY RENDERING LOOP
  // ==========================================================================

  startWaveformLoop() {
    const draw = () => {
      this.waveformTime += 0.05;
      this.analyzeRealAudio();
      this.renderWaveform();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  analyzeRealAudio() {
    if (this.analyser && this.state === 'listening' && this.freqData && this.timeData) {
      this.analyser.getByteFrequencyData(this.freqData);
      this.analyser.getByteTimeDomainData(this.timeData);

      let sum = 0;
      for (let i = 0; i < this.timeData.length; i++) {
        const val = (this.timeData[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / this.timeData.length);
      this.currentAmplitude = Math.min(1.0, rms * 3.5);

      const db = Math.round(20 * Math.log10(Math.max(0.001, rms)) + 60);

      if (this.onAudioData) {
        this.onAudioData(this.currentAmplitude, this.freqData, db);
      }
    } else if (this.state === 'speaking') {
      // Simulate synthetic audio amplitude for speaking resonance
      const speakAmp = (Math.sin(this.waveformTime * 6) * 0.3 + 0.5) * (Math.sin(this.waveformTime * 14) * 0.2 + 0.6);
      if (this.onAudioData) {
        this.onAudioData(speakAmp, null, 45);
      }
    } else {
      this.currentAmplitude = 0;
      if (this.onAudioData && (this.state === 'idle' || this.state === 'error')) {
        this.onAudioData(0, null, 0);
      }
    }
  }

  renderWaveform() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const midY = this.height / 2;
    const bars = 36;
    const barWidth = this.width / bars;

    for (let i = 0; i < bars; i++) {
      let amp = 2;

      if (this.state === 'listening' && this.freqData) {
        const freqIndex = Math.floor((i / bars) * this.freqData.length);
        const rawVal = this.freqData[freqIndex] || 0;
        amp = (rawVal / 255) * (this.height - 6) + 2;
      } else if (this.state === 'speaking') {
        amp = Math.abs(Math.sin(this.waveformTime * 6 + i * 0.35)) * (this.height * 0.75) + 4;
      } else if (this.state === 'processing' || this.state === 'thinking') {
        amp = Math.sin(this.waveformTime * 8 + i * 0.6) * 7 + 4;
      } else if (this.state === 'error') {
        amp = (i % 4 === 0) ? 8 : 2;
      } else {
        amp = Math.sin(this.waveformTime + i * 0.18) * 2.5 + 2.5;
      }

      const x = i * barWidth;
      const barHeight = Math.max(2, Math.min(this.height - 2, amp));

      const grad = ctx.createLinearGradient(0, midY - barHeight / 2, 0, midY + barHeight / 2);
      if (this.state === 'listening') {
        grad.addColorStop(0, '#00e5ff');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0.2)');
      } else if (this.state === 'speaking') {
        grad.addColorStop(0, '#ffaa00');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, 'rgba(255, 106, 0, 0.2)');
      } else if (this.state === 'error') {
        grad.addColorStop(0, '#ff3d00');
        grad.addColorStop(1, 'rgba(255, 61, 0, 0.2)');
      } else {
        grad.addColorStop(0, '#ffaa00');
        grad.addColorStop(0.5, '#ffd27a');
        grad.addColorStop(1, 'rgba(255, 106, 0, 0.2)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, midY - barHeight / 2, barWidth - 2, barHeight);
    }
  }
}
