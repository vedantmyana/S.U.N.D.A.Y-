/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — UI & MODAL INTERACTION MODULE (js/ui.js)
 * ============================================================================
 * Manages modal dialogues, tab switches, settings persistence, and HUD state
 * stepper simulators.
 */

export class SundayUIManager {
  constructor(options = {}) {
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    this.onStateChangeRequested = options.onStateChangeRequested || null;
    this.onSettingsUpdated = options.onSettingsUpdated || null;

    this.initModalEvents();
    this.initTabs();
    this.initStateStepper();
    this.initFormBindings();
  }

  initModalEvents() {
    if (this.openSettingsBtn) {
      this.openSettingsBtn.addEventListener('click', () => this.openSettings());
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.closeSettings();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsModal?.classList.contains('open')) {
        this.closeSettings();
      }
    });

    if (this.saveSettingsBtn) {
      this.saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
        this.closeSettings();
      });
    }
  }

  openSettings() {
    if (this.settingsModal) {
      this.settingsModal.classList.add('open');
      this.settingsModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeSettings() {
    if (this.settingsModal) {
      this.settingsModal.classList.remove('open');
      this.settingsModal.setAttribute('aria-hidden', 'true');
    }
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.modal-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
      });
    });
  }

  initStateStepper() {
    const stepBadges = document.querySelectorAll('.hud-state-stepper .step-badge');
    stepBadges.forEach(badge => {
      badge.addEventListener('click', () => {
        const state = badge.getAttribute('data-state');
        this.setActiveStepBadge(state);
        if (this.onStateChangeRequested) {
          this.onStateChangeRequested(state);
        }
      });
    });
  }

  setActiveStepBadge(state) {
    const stepBadges = document.querySelectorAll('.hud-state-stepper .step-badge');
    stepBadges.forEach(b => {
      if (b.getAttribute('data-state') === state) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  initFormBindings() {
    // Dynamic Slider Value Display
    const speedSlider = document.getElementById('settingSpeechSpeed');
    const speedLabel = document.getElementById('speedValLabel');
    if (speedSlider && speedLabel) {
      speedSlider.addEventListener('input', () => speedLabel.textContent = `${speedSlider.value}x`);
    }

    const sensSlider = document.getElementById('settingMicSensitivity');
    const sensLabel = document.getElementById('sensValLabel');
    if (sensSlider && sensLabel) {
      sensSlider.addEventListener('input', () => sensLabel.textContent = `${sensSlider.value}%`);
    }

    const particleSlider = document.getElementById('settingCoreParticles');
    const particleLabel = document.getElementById('particleCountLabel');
    if (particleSlider && particleLabel) {
      particleSlider.addEventListener('input', () => particleLabel.textContent = particleSlider.value);
    }

    const glowSlider = document.getElementById('settingGlowIntensity');
    const glowLabel = document.getElementById('glowValLabel');
    if (glowSlider && glowLabel) {
      glowSlider.addEventListener('input', () => glowLabel.textContent = `${glowSlider.value}%`);
    }
  }

  saveSettings() {
    const settings = {
      voiceModel: document.getElementById('settingVoiceVoice')?.value,
      speechSpeed: document.getElementById('settingSpeechSpeed')?.value,
      micSensitivity: document.getElementById('settingMicSensitivity')?.value,
      aiProvider: document.getElementById('settingAiProvider')?.value,
      aiModel: document.getElementById('settingAiModel')?.value,
      coreParticles: document.getElementById('settingCoreParticles')?.value,
      glowIntensity: document.getElementById('settingGlowIntensity')?.value,
      userName: document.getElementById('settingUserName')?.value
    };

    if (this.onSettingsUpdated) {
      this.onSettingsUpdated(settings);
    }
  }
}
