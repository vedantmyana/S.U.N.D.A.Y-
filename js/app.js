/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — MAIN APP ORCHESTRATOR (js/app.js)
 * ============================================================================
 * Master application controller wiring the Core Visualizer, Chat Console,
 * Voice & TTS subsystem, Backend API Client, Audio FX, and Hotkeys.
 */

import { SundayCoreVisualizer } from './core.js';
import { SundayChatManager } from './chat.js';
import { SundayVoiceController } from './voice.js';
import { SundaySystemMonitor } from './system.js';
import { SundayUIManager } from './ui.js';
import { SundayAudioFX } from './audio_fx.js';

class SundayApp {
  constructor() {
    console.log('[S.U.N.D.A.Y] Initializing Neural Interface & HUD...');

    this.backendBaseUrl = window.location.origin.includes(':8000') ? '' : 'http://127.0.0.1:8000';
    this.sessionId = `session_${Date.now()}`;
    this.isBackendOnline = false;

    // 0. Initialize Synthesized Sci-Fi Audio FX
    this.sfx = new SundayAudioFX();

    // 1. Initialize S.U.N.D.A.Y Core Visualizer
    this.core = new SundayCoreVisualizer('sundayCoreCanvas');

    // 2. Initialize Conversation Chat Console
    this.chat = new SundayChatManager({
      onUserMessage: (text) => this.handleUserCommand(text)
    });

    // 3. Initialize Voice Controller, Web Audio & TTS
    this.voice = new SundayVoiceController({
      onStateChange: (state) => this.handleVoiceStateChange(state),
      onAudioData: (amp, freqData, db) => this.handleLiveAudioData(amp, freqData, db),
      onSpeechResult: (transcript) => this.handleTranscribedSpeech(transcript),
      onError: (errMsg) => this.handleVoiceError(errMsg)
    });

    // 4. Initialize System Telemetry & Chrono Monitor
    this.system = new SundaySystemMonitor();

    // 5. Initialize UI Management & Settings Modals
    this.ui = new SundayUIManager({
      onStateChangeRequested: (state) => this.setAppState(state),
      onSettingsUpdated: (settings) => this.applySettings(settings)
    });

    // Telemetry Elements Cache
    this.audioInValEl = document.getElementById('audioInVal');
    this.audioInBarEl = document.getElementById('audioInBar');
    this.aiStatusBadge = document.getElementById('hudAiStatusBadge');

    // Initialize Global Hotkeys
    this.initHotkeys();

    // Initial Telemetry Readings & Backend Ping
    this.setAppState('idle');
    this.checkBackendHealth();
    setInterval(() => this.checkBackendHealth(), 8000);

    console.log('[S.U.N.D.A.Y] System initialized successfully. All Subsystems Operational.');
  }

  initHotkeys() {
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // 1. "/" to focus command input
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        document.getElementById('chatTextInput')?.focus();
      }

      // 2. "Alt+V" to toggle microphone
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        this.voice.toggleVoiceListening();
      }

      // 3. "Escape" to stop ongoing speech synthesis
      if (e.key === 'Escape') {
        this.voice.stopSpeaking();
      }
    });
  }

  async checkBackendHealth() {
    try {
      const resp = await fetch(`${this.backendBaseUrl}/api/system/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        const data = await resp.json();
        this.isBackendOnline = true;
        if (this.aiStatusBadge) {
          this.aiStatusBadge.textContent = 'CONNECTED';
          this.aiStatusBadge.className = 'status-badge state-online';
        }
      } else {
        this.setBackendOffline();
      }
    } catch (e) {
      this.setBackendOffline();
    }
  }

  setBackendOffline() {
    this.isBackendOnline = false;
    if (this.aiStatusBadge) {
      this.aiStatusBadge.textContent = 'LOCAL BASELINE';
      this.aiStatusBadge.className = 'status-badge state-standby';
    }
  }

  setAppState(state) {
    this.currentState = state;
    
    // Propagate to Core Engine
    if (this.core) {
      this.core.setState(state);
    }

    // Propagate to Voice Subsystem
    if (this.voice && this.voice.state !== state && state !== 'thinking') {
      this.voice.setState(state === 'listening' ? 'listening' : (state === 'speaking' ? 'speaking' : (state === 'error' ? 'error' : 'idle')));
    }

    // Propagate to UI Stepper
    if (this.ui) {
      this.ui.setActiveStepBadge(state);
    }

    // Update Processing Badge in HUD
    const procBadge = document.getElementById('hudProcessBadge');
    if (procBadge) {
      procBadge.textContent = state.toUpperCase();
      procBadge.className = `status-badge ${
        state === 'idle' ? 'state-idle' : 
        (state === 'thinking' ? 'state-busy' : 
        (state === 'listening' ? 'state-online' : 'state-standby'))
      }`;
    }

    // Update Energy Telemetry Meter
    const energyFill = document.getElementById('energyOutputFill');
    const energyVal = document.getElementById('energyOutputVal');
    if (energyFill && energyVal) {
      let energy = 45.2;
      if (state === 'listening') energy = 72.4;
      else if (state === 'thinking') energy = 91.5;
      else if (state === 'speaking') energy = 84.0;
      else if (state === 'error') energy = 18.0;

      energyFill.style.width = `${energy}%`;
      energyVal.textContent = `${energy}%`;
    }
  }

  handleLiveAudioData(amp, freqData, db) {
    if (this.core) {
      this.core.setAudioData(amp, freqData);
    }

    if (this.audioInValEl && this.audioInBarEl) {
      if (this.currentState === 'listening' || this.currentState === 'speaking') {
        this.audioInValEl.textContent = `${db > 0 ? db : 0} dB`;
        this.audioInBarEl.style.width = `${Math.min(100, Math.round(amp * 100))}%`;
      } else {
        this.audioInValEl.textContent = '0 dB';
        this.audioInBarEl.style.width = '4%';
      }
    }
  }

  handleTranscribedSpeech(transcript) {
    console.log(`[S.U.N.D.A.Y] Vocal transcript captured: "${transcript}"`);
    this.chat.appendUserMessage(transcript);
    this.handleUserCommand(transcript);
  }

  handleVoiceStateChange(voiceState) {
    if (voiceState === 'listening') {
      this.sfx.playListenPing();
      this.setAppState('listening');
      this.chat.appendSystemDirective('Microphone live. Audio stream synchronized with Quantum Core.');
    } else if (voiceState === 'processing') {
      this.setAppState('thinking');
      this.chat.showThinking('PROCESSING VOCAL DIRECTIVE...');
    } else if (voiceState === 'error') {
      this.sfx.playErrorBuzz();
      this.setAppState('error');
    } else if (voiceState === 'speaking') {
      this.setAppState('speaking');
    } else {
      this.setAppState('idle');
    }
  }

  handleVoiceError(errMsg) {
    this.sfx.playErrorBuzz();
    this.chat.appendSystemDirective(`[VOICE ALERT] ${errMsg}`);
  }

  async handleUserCommand(text) {
    this.sfx.playChirp();
    this.setAppState('thinking');
    this.chat.showThinking('S.U.N.D.A.Y QUANTUM INFERENCE...');

    let responseText = '';
    let chips = [];

    try {
      if (this.isBackendOnline) {
        // Asynchronous POST to FastAPI Backend AI & Tool Engine
        const res = await fetch(`${this.backendBaseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            session_id: this.sessionId
          })
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data.response;
          chips = data.action_chips || [];
        } else {
          throw new Error(`API HTTP Error: ${res.status}`);
        }
      } else {
        // Intelligent Local Neural Baseline
        const fallback = this.generateLocalFallback(text);
        responseText = fallback.response;
        chips = fallback.action_chips;
      }
    } catch (err) {
      console.warn('[S.U.N.D.A.Y] Backend request failed, using local baseline:', err);
      const fallback = this.generateLocalFallback(text);
      responseText = fallback.response;
      chips = fallback.action_chips;
    }

    // Play Harmonic Audio Chime
    this.sfx.playHarmonicChord();

    // Display Response in Conversation Log
    this.chat.hideThinking();
    this.chat.appendSundayMessage(responseText, chips);

    // Speak Response using S.U.N.D.A.Y TTS Voice Synthesis & Animate Core
    this.setAppState('speaking');
    this.voice.speakText(
      responseText,
      () => this.setAppState('speaking'),
      () => this.setAppState('idle')
    );
  }

  generateLocalFallback(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('calc') || lower.includes('calculator')) {
      return {
        response: 'Calculator tool intent acknowledged. (Running in standalone frontend mode—launch FastAPI backend to execute desktop applications).',
        action_chips: ['<i class="fa-solid fa-calculator"></i> Tool Detected']
      };
    } else if (lower.includes('status') || lower.includes('health')) {
      return {
        response: 'All primary quantum nodes, telemetry matrices, and audio sensors are running within nominal parameters.',
        action_chips: ['<i class="fa-solid fa-microchip"></i> System Nominal', '<i class="fa-solid fa-gauge"></i> 100% Health']
      };
    } else if (lower.includes('core') || lower.includes('energy')) {
      return {
        response: 'S.U.N.D.A.Y Core resonance flux is stable at 0.984. Web Audio FFT pipeline operating at 60 FPS.',
        action_chips: ['<i class="fa-solid fa-atom"></i> Resonance 0.984', '<i class="fa-solid fa-bolt"></i> 84% Load']
      };
    } else if (lower.includes('who are you') || lower.includes('identify')) {
      return {
        response: 'I am <strong>S.U.N.D.A.Y</strong>, your dedicated desktop intelligence assistant. All quantum systems and telemetry monitors are operational.',
        action_chips: ['<i class="fa-solid fa-atom"></i> S.U.N.D.A.Y Core', '<i class="fa-solid fa-shield-halved"></i> Secure']
      };
    } else if (lower.includes('version')) {
      return {
        response: 'S.U.N.D.A.Y System Version: <strong>v2.4.0_SYS</strong>. FastAPI backend, TTS synthesis, Web Audio API, and safe desktop tools ready.',
        action_chips: ['<i class="fa-solid fa-code-branch"></i> v2.4.0_SYS']
      };
    } else {
      return {
        response: `Directive acknowledged: "<em>${this.escapeHtml(text)}</em>". Add your OpenRouter API key to <code>backend/.env</code> for live external model inference.`,
        action_chips: ['<i class="fa-solid fa-circle-check"></i> Command Logged']
      };
    }
  }

  applySettings(settings) {
    if (settings.coreParticles && this.core) {
      this.core.setParticleCount(parseInt(settings.coreParticles, 10));
    }
    if (settings.speechSpeed && this.voice) {
      this.voice.speechRate = parseFloat(settings.speechSpeed);
    }
    this.chat.appendSystemDirective(`Configuration profile updated for ${settings.userName || 'Commander'}.`);
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Instantiate application once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.sundayApp = new SundayApp();
});
