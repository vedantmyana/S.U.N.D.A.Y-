/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — CORE VISUALIZER ENGINE (js/core.js)
 * ============================================================================
 * High-Performance Multi-Layered Orange/Amber Quantum Core Engine.
 * Features Web Audio API real-time FFT frequency & amplitude reactivity.
 */

export class SundayCoreVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`[SundayCore] Canvas element #${canvasId} not found.`);
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    
    // Core States: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
    this.state = 'idle';
    this.targetState = 'idle';
    
    // Canvas Sizing & Geometry
    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());

    this.baseRadius = 68;
    this.currentScale = 1.0;
    this.targetScale = 1.0;

    // Animation & Timing
    this.time = 0;
    this.audioAmplitude = 0;
    this.targetAudioAmp = 0;
    this.audioBass = 0;
    this.audioTreble = 0;
    this.pulsePhase = 0;

    // Smooth Lerp State Variables
    this.speedMultiplier = 1.0;
    this.targetSpeedMult = 1.0;
    this.glowIntensity = 1.0;
    this.targetGlowIntensity = 1.0;
    
    // Color Palette Vectors for Smooth Interpolation [R, G, B]
    this.colors = {
      primary: [255, 140, 0],       // Neon Orange
      secondary: [255, 185, 40],    // Warm Amber
      core: [255, 235, 200],        // Hot White-Amber Center
      targetPrimary: [255, 140, 0],
      targetSecondary: [255, 185, 40],
      targetCore: [255, 235, 200]
    };

    // Multi-Layer Rotation Tracking (Radians)
    this.rotations = {
      layer2_caliper: 0,
      layer3_gears: 0,
      layer3_ticks: 0,
      layer4_corona: 0,
      layer6_scanner: 0,
      layer7_spikes: 0
    };

    // Layer 5: Quantum Particle Field Initializer
    this.particleCount = 135;
    this.particles = [];
    this.initParticles();

    // Layer 8: Multi-Tier Orbiting Satellite Micro-Nodes
    this.satellites = [
      { angle: 0, radius: 95, speed: 0.016, size: 3.5, tail: [] },
      { angle: Math.PI * 0.4, radius: 118, speed: -0.012, size: 2.8, tail: [] },
      { angle: Math.PI * 0.9, radius: 82, speed: 0.024, size: 4.2, tail: [] },
      { angle: Math.PI * 1.3, radius: 138, speed: -0.009, size: 3.0, tail: [] },
      { angle: Math.PI * 1.7, radius: 104, speed: 0.018, size: 2.5, tail: [] },
      { angle: Math.PI * 0.7, radius: 150, speed: -0.007, size: 3.8, tail: [] }
    ];

    // Layer 7: Radial Energy Spikes Definition
    this.spikeCount = 36;
    this.spikes = [];
    for (let i = 0; i < this.spikeCount; i++) {
      this.spikes.push({
        baseLength: 12 + Math.random() * 18,
        freq: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Start 60 FPS Render Loop
    this.isRunning = true;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = rect.width || 340;
    const displayHeight = rect.height || 340;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.ctx.scale(dpr, dpr);

    this.width = displayWidth;
    this.height = displayHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 32 + Math.random() * 128;
      this.particles.push({
        angle: angle,
        distance: dist,
        baseDistance: dist,
        speed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        radialWanderFreq: 1 + Math.random() * 3,
        radialWanderAmp: 4 + Math.random() * 12,
        size: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: 0.5,
        x: 0,
        y: 0
      });
    }
  }

  setParticleCount(count) {
    this.particleCount = Math.max(30, Math.min(250, count));
    this.initParticles();
  }

  // Real-Time Audio Data Ingestion from Web Audio API AnalyserNode
  setAudioData(amplitude, frequencyData) {
    this.targetAudioAmp = Math.max(0, Math.min(1, amplitude));

    if (frequencyData && frequencyData.length > 0) {
      // Calculate Lows (Bass: bins 0 to 8)
      let bassSum = 0;
      const bassBins = Math.min(8, frequencyData.length);
      for (let i = 0; i < bassBins; i++) bassSum += frequencyData[i];
      this.audioBass = (bassSum / (bassBins * 255));

      // Calculate Highs (Treble: upper half)
      let trebleSum = 0;
      const midPoint = Math.floor(frequencyData.length / 2);
      for (let i = midPoint; i < frequencyData.length; i++) trebleSum += frequencyData[i];
      this.audioTreble = (trebleSum / ((frequencyData.length - midPoint) * 255));
    } else {
      this.audioBass = 0;
      this.audioTreble = 0;
    }
  }

  // ==========================================================================
  // STATE MACHINE & INTERPOLATION
  // ==========================================================================

  setState(newState) {
    this.targetState = newState;
    this.state = newState;

    const badge = document.getElementById('coreStateBadge');
    const badgeText = document.getElementById('coreStateText');
    if (badge && badgeText) {
      badge.setAttribute('data-state', newState);
      badgeText.textContent = newState.toUpperCase();
    }

    switch (newState) {
      case 'idle':
        this.targetSpeedMult = 1.0;
        this.targetScale = 1.0;
        this.targetGlowIntensity = 1.0;
        this.colors.targetPrimary = [255, 140, 0];    // Orange
        this.colors.targetSecondary = [255, 185, 40]; // Amber
        this.colors.targetCore = [255, 235, 200];     // Hot White-Amber
        break;

      case 'listening':
        this.targetSpeedMult = 1.35;
        this.targetScale = 1.12;
        this.targetGlowIntensity = 1.45;
        this.colors.targetPrimary = [0, 229, 255];     // Cyan
        this.colors.targetSecondary = [255, 140, 0];   // Orange
        this.colors.targetCore = [225, 255, 255];      // White-Cyan
        break;

      case 'thinking':
        this.targetSpeedMult = 2.85;
        this.targetScale = 1.05;
        this.targetGlowIntensity = 1.6;
        this.colors.targetPrimary = [255, 170, 0];    // Golden Amber
        this.colors.targetSecondary = [255, 215, 64];  // Yellow Gold
        this.colors.targetCore = [255, 255, 220];
        break;

      case 'speaking':
        this.targetSpeedMult = 1.75;
        this.targetScale = 1.18;
        this.targetGlowIntensity = 1.8;
        this.colors.targetPrimary = [255, 106, 0];    // Deep Blaze Orange
        this.colors.targetSecondary = [255, 170, 0];
        this.colors.targetCore = [255, 240, 210];
        break;

      case 'error':
        this.targetSpeedMult = 0.45;
        this.targetScale = 0.92;
        this.targetGlowIntensity = 0.8;
        this.colors.targetPrimary = [255, 61, 0];     // Hazard Red-Orange
        this.colors.targetSecondary = [255, 110, 64];
        this.colors.targetCore = [255, 200, 190];
        break;
    }
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  lerpColor(current, target, amt) {
    return [
      Math.round(this.lerp(current[0], target[0], amt)),
      Math.round(this.lerp(current[1], target[1], amt)),
      Math.round(this.lerp(current[2], target[2], amt))
    ];
  }

  updateDynamics() {
    const lerpRate = 0.08;
    this.speedMultiplier = this.lerp(this.speedMultiplier, this.targetSpeedMult, lerpRate);
    this.currentScale = this.lerp(this.currentScale, this.targetScale, lerpRate);
    this.glowIntensity = this.lerp(this.glowIntensity, this.targetGlowIntensity, lerpRate);
    
    // Audio amplitude smoothing
    this.audioAmplitude = this.lerp(this.audioAmplitude, this.targetAudioAmp, 0.2);

    this.colors.primary = this.lerpColor(this.colors.primary, this.colors.targetPrimary, lerpRate);
    this.colors.secondary = this.lerpColor(this.colors.secondary, this.colors.targetSecondary, lerpRate);
    this.colors.core = this.lerpColor(this.colors.core, this.colors.targetCore, lerpRate);

    // Harmonic Breathing Pulse
    let pulseSpeed = 2.0;
    if (this.state === 'thinking') pulseSpeed = 4.5;
    else if (this.state === 'speaking') pulseSpeed = 6.0;
    else if (this.state === 'listening') pulseSpeed = 3.2;

    this.pulsePhase = Math.sin(this.time * pulseSpeed) * (0.06 * this.glowIntensity);

    // Layer Rotations (Modulated by audio amplitude)
    const spd = this.speedMultiplier * (1 + this.audioAmplitude * 0.8);
    this.rotations.layer2_caliper += 0.009 * spd;
    this.rotations.layer3_gears -= 0.013 * spd;
    this.rotations.layer3_ticks += 0.005 * spd;
    this.rotations.layer4_corona += 0.003 * spd;
    this.rotations.layer6_scanner += 0.032 * spd;
    this.rotations.layer7_spikes -= 0.006 * spd;
  }

  // ==========================================================================
  // MAIN ANIMATION LOOP & RENDER PIPELINE
  // ==========================================================================

  animate() {
    if (!this.isRunning) return;

    this.time += 0.016;
    this.updateDynamics();
    this.render();

    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const cPrimary = `${this.colors.primary[0]}, ${this.colors.primary[1]}, ${this.colors.primary[2]}`;
    const cSecondary = `${this.colors.secondary[0]}, ${this.colors.secondary[1]}, ${this.colors.secondary[2]}`;
    const cCore = `${this.colors.core[0]}, ${this.colors.core[1]}, ${this.colors.core[2]}`;

    // Effective dynamic radius modulated by REAL voice amplitude and bass frequencies
    const dynamicAudioExpansion = (this.audioAmplitude * 0.35) + (this.audioBass * 0.2);
    const effectiveRadius = this.baseRadius * (this.currentScale + this.pulsePhase + dynamicAudioExpansion);

    // LAYER 4: Atmospheric Coronal Discharge & Ambient Energy Bloom
    this.drawLayer4CoronalBloom(ctx, effectiveRadius, cPrimary, cSecondary);

    // LAYER 5: Quantum Particle Field & Circuit Proximity Constellations
    this.drawLayer5ParticleConstellations(ctx, effectiveRadius, cPrimary, cSecondary);

    // LAYER 7: Radial Energy Vector Spikes (Modulated by Treble & Voice)
    this.drawLayer7RadialSpikes(ctx, effectiveRadius, cSecondary);

    // LAYER 6: 360° Holographic Radar Scanner Sweep
    this.drawLayer6ScannerSweep(ctx, effectiveRadius, cPrimary);

    // LAYER 3: Secondary Counter-Rotating Geared Precision Rings
    this.drawLayer3GearedRings(ctx, effectiveRadius, cSecondary, cPrimary);

    // LAYER 2: Inner Rotating Segmented Caliper Rings & Calibration Ticks
    this.drawLayer2CaliperRings(ctx, effectiveRadius, cPrimary, cSecondary);

    // LAYER 8: Multi-Tier Orbiting Satellite Micro-Nodes & Flare Tails
    this.drawLayer8Satellites(ctx, effectiveRadius, cPrimary, cCore);

    // LAYER 1: Central Plasma Energy Core, Hotspot & Precision Reticle
    this.drawLayer1PlasmaCore(ctx, effectiveRadius, cPrimary, cSecondary, cCore);

    ctx.restore();
  }

  // ==========================================================================
  // LAYER RENDERERS
  // ==========================================================================

  drawLayer4CoronalBloom(ctx, radius, cPrimary, cSecondary) {
    const maxR = radius * 2.3;
    const grad = ctx.createRadialGradient(
      this.centerX, this.centerY, radius * 0.3,
      this.centerX, this.centerY, maxR
    );
    grad.addColorStop(0, `rgba(${cPrimary}, ${0.35 * this.glowIntensity + (this.audioAmplitude * 0.2)})`);
    grad.addColorStop(0.45, `rgba(${cSecondary}, ${0.12 * this.glowIntensity})`);
    grad.addColorStop(0.8, `rgba(${cPrimary}, ${0.03 * this.glowIntensity})`);
    grad.addColorStop(1, `rgba(${cPrimary}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, maxR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotations.layer4_corona);
    ctx.strokeStyle = `rgba(${cPrimary}, ${0.15 + this.audioAmplitude * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawLayer5ParticleConstellations(ctx, radius, cPrimary, cSecondary) {
    const speedMult = this.speedMultiplier * (1 + this.audioAmplitude * 1.2);
    const proximityThreshold = 38 + (this.audioAmplitude * 15);

    for (let p of this.particles) {
      p.angle += p.speed * speedMult;
      
      const radialDrift = Math.sin(this.time * p.radialWanderFreq + p.angle) * p.radialWanderAmp;
      let targetDist = p.baseDistance + radialDrift + (this.audioAmplitude * 28) + (this.audioBass * 18);

      if (this.state === 'listening') {
        targetDist *= 0.88;
      } else if (this.state === 'speaking') {
        targetDist *= 1.15;
      }

      p.x = this.centerX + Math.cos(p.angle) * targetDist;
      p.y = this.centerY + Math.sin(p.angle) * targetDist;
      p.alpha = p.baseAlpha * Math.min(1, this.glowIntensity + this.audioAmplitude * 0.4);
    }

    // Circuit Proximity Linkages
    ctx.lineWidth = 0.7;
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < proximityThreshold) {
          const lineAlpha = (1 - (dist / proximityThreshold)) * (0.35 + this.audioAmplitude * 0.3) * this.glowIntensity;
          ctx.strokeStyle = `rgba(${cSecondary}, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Particle Dots
    for (let p of this.particles) {
      ctx.fillStyle = `rgba(${cPrimary}, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + this.audioAmplitude * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLayer7RadialSpikes(ctx, radius, cSecondary) {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotations.layer7_spikes);

    ctx.strokeStyle = `rgba(${cSecondary}, ${0.4 * this.glowIntensity + this.audioTreble * 0.4})`;
    ctx.lineWidth = 1 + this.audioTreble * 0.8;

    const baseR = radius * 0.95;
    for (let i = 0; i < this.spikeCount; i++) {
      const angle = (i / this.spikeCount) * Math.PI * 2;
      const spike = this.spikes[i];
      const length = spike.baseLength + Math.sin(this.time * spike.freq + spike.phase) * 6 + (this.audioAmplitude * 26) + (this.audioTreble * 18);

      const x1 = Math.cos(angle) * baseR;
      const y1 = Math.sin(angle) * baseR;
      const x2 = Math.cos(angle) * (baseR + length);
      const y2 = Math.sin(angle) * (baseR + length);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawLayer6ScannerSweep(ctx, radius, cPrimary) {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotations.layer6_scanner);

    const scanRadius = radius * 2.0;
    const sweepAngle = 0.55;

    const scanGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, scanRadius);
    scanGrad.addColorStop(0, `rgba(${cPrimary}, ${0.45 * this.glowIntensity})`);
    scanGrad.addColorStop(0.7, `rgba(${cPrimary}, ${0.15 * this.glowIntensity})`);
    scanGrad.addColorStop(1, `rgba(${cPrimary}, 0)`);

    ctx.fillStyle = scanGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, scanRadius, 0, sweepAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${cPrimary}, ${0.85 * this.glowIntensity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepAngle) * scanRadius, Math.sin(sweepAngle) * scanRadius);
    ctx.stroke();

    ctx.restore();
  }

  drawLayer3GearedRings(ctx, radius, cSecondary, cPrimary) {
    const r = radius * 1.32;
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotations.layer3_gears);

    ctx.strokeStyle = `rgba(${cSecondary}, ${0.5 + this.audioAmplitude * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8, 2, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.rotate(this.rotations.layer3_ticks);
    ctx.strokeStyle = `rgba(${cPrimary}, 0.35)`;
    ctx.lineWidth = 1;
    const teeth = 24;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const x1 = Math.cos(a) * (r - 6);
      const y1 = Math.sin(a) * (r - 6);
      const x2 = Math.cos(a) * (r + 4);
      const y2 = Math.sin(a) * (r + 4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawLayer2CaliperRings(ctx, radius, cPrimary, cSecondary) {
    const r = radius * 1.58;
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.rotations.layer2_caliper);

    ctx.strokeStyle = `rgba(${cPrimary}, ${0.75 * this.glowIntensity + this.audioAmplitude * 0.25})`;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const startAngle = (i * Math.PI / 2) + 0.12;
      const endAngle = ((i + 1) * Math.PI / 2) - 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.stroke();

      const capX = Math.cos(startAngle) * r;
      const capY = Math.sin(startAngle) * r;
      ctx.fillStyle = `rgba(${cSecondary}, 0.9)`;
      ctx.beginPath();
      ctx.arc(capX, capY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(${cSecondary}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r + 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawLayer8Satellites(ctx, radius, cPrimary, cCore) {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    for (let sat of this.satellites) {
      sat.angle += sat.speed * this.speedMultiplier;
      const effectiveOrbit = sat.radius * (this.currentScale + (this.audioAmplitude * 0.22));
      const x = Math.cos(sat.angle) * effectiveOrbit;
      const y = Math.sin(sat.angle) * effectiveOrbit;

      sat.tail.unshift({ x, y, alpha: 0.6 });
      if (sat.tail.length > 8) sat.tail.pop();

      for (let i = 0; i < sat.tail.length; i++) {
        const pt = sat.tail[i];
        const tailAlpha = (1 - (i / sat.tail.length)) * 0.4 * this.glowIntensity;
        ctx.fillStyle = `rgba(${cPrimary}, ${tailAlpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, sat.size * (1 - i * 0.1), 0, Math.PI * 2);
        ctx.fill();
      }

      const halo = ctx.createRadialGradient(x, y, 0, x, y, sat.size * 3.5);
      halo.addColorStop(0, `rgba(${cCore}, ${0.9 * this.glowIntensity})`);
      halo.addColorStop(0.5, `rgba(${cPrimary}, ${0.4 * this.glowIntensity})`);
      halo.addColorStop(1, `rgba(${cPrimary}, 0)`);

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, sat.size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${cCore}, 1)`;
      ctx.beginPath();
      ctx.arc(x, y, sat.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawLayer1PlasmaCore(ctx, radius, cPrimary, cSecondary, cCore) {
    const coreR = radius * 0.72;

    const plasmaGrad = ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, coreR
    );
    plasmaGrad.addColorStop(0, `rgba(${cCore}, 1)`);
    plasmaGrad.addColorStop(0.28, `rgba(${cCore}, ${0.9 * this.glowIntensity})`);
    plasmaGrad.addColorStop(0.65, `rgba(${cSecondary}, ${0.75 * this.glowIntensity})`);
    plasmaGrad.addColorStop(0.9, `rgba(${cPrimary}, ${0.45 * this.glowIntensity})`);
    plasmaGrad.addColorStop(1, `rgba(${cPrimary}, 0)`);

    ctx.fillStyle = plasmaGrad;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    ctx.strokeStyle = `rgba(${cCore}, ${0.85 * this.glowIntensity})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, coreR * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    const ch = 12;
    ctx.strokeStyle = `rgba(${cCore}, 0.95)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-ch, 0);
    ctx.lineTo(ch, 0);
    ctx.moveTo(0, -ch);
    ctx.lineTo(0, ch);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
