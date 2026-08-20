/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — SYSTEM & TELEMETRY MODULE (js/system.js)
 * ============================================================================
 * Manages live time/date synchronization, uptime counters, and diagnostic
 * sensor telemetry updates.
 */

export class SundaySystemMonitor {
  constructor() {
    this.topClockEl = document.getElementById('topBarClock');
    this.hudClockEl = document.getElementById('hudLiveTime');
    this.hudDateEl = document.getElementById('hudLiveDate');
    this.hudUptimeEl = document.getElementById('hudUptime');
    
    this.cpuValEl = document.getElementById('cpuLoadVal');
    this.cpuBarEl = document.getElementById('cpuLoadBar');
    this.memValEl = document.getElementById('memAllocVal');
    this.memBarEl = document.getElementById('memAllocBar');
    this.thermalValEl = document.getElementById('thermalVal');

    this.startTime = Date.now();
    this.startChronoLoop();
    this.startSensorTelemetry();
  }

  startChronoLoop() {
    const updateTime = () => {
      const now = new Date();
      
      // HH:MM:SS format
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;

      // DD.MM.YYYY format
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const dateStr = `${day}.${month}.${year}`;

      if (this.topClockEl) this.topClockEl.textContent = timeStr;
      if (this.hudClockEl) this.hudClockEl.textContent = timeStr;
      if (this.hudDateEl) this.hudDateEl.textContent = dateStr;

      // Uptime Calculation
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const upH = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
      const upM = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
      const upS = String(elapsedSec % 60).padStart(2, '0');
      if (this.hudUptimeEl) this.hudUptimeEl.textContent = `${upH}:${upM}:${upS}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  startSensorTelemetry() {
    setInterval(() => {
      // Gentle realistic fluctuations
      const cpu = Math.floor(12 + Math.random() * 8);
      const mem = Math.floor(27 + Math.random() * 3);
      const temp = (37.5 + Math.random() * 1.5).toFixed(1);

      if (this.cpuValEl) this.cpuValEl.textContent = `${cpu}%`;
      if (this.cpuBarEl) this.cpuBarEl.style.width = `${cpu}%`;
      
      if (this.memValEl) this.memValEl.textContent = `${mem}%`;
      if (this.memBarEl) this.memBarEl.style.width = `${mem}%`;
      
      if (this.thermalValEl) this.thermalValEl.textContent = `${temp}°C`;
    }, 2800);
  }
}
