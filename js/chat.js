/**
 * ============================================================================
 * S.U.N.D.A.Y AI DESKTOP ASSISTANT — CHAT CONSOLE MODULE (js/chat.js)
 * ============================================================================
 * Manages the command stream, message bubbles, system directives, and
 * response formatting in the central conversation console.
 */

export class SundayChatManager {
  constructor(options = {}) {
    this.logEl = document.getElementById('conversationLog');
    this.inputEl = document.getElementById('chatTextInput');
    this.sendBtn = document.getElementById('sendMessageBtn');
    this.clearBtn = document.getElementById('clearChatBtn');
    this.thinkingEl = document.getElementById('thinkingIndicator');
    this.thinkingTextEl = document.getElementById('thinkingText');

    this.onUserMessage = options.onUserMessage || null;
    this.initEventListeners();
    this.updateSystemInitTime();
  }

  initEventListeners() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.resetConversation());
    }
  }

  updateSystemInitTime() {
    const timeEl = document.getElementById('systemInitTime');
    if (timeEl) {
      timeEl.textContent = this.getCurrentTime();
    }
  }

  getCurrentTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  handleSendMessage() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    // Append User Message to UI
    this.appendUserMessage(text);
    this.inputEl.value = '';

    // Delegate to listener (e.g. app controller)
    if (this.onUserMessage) {
      this.onUserMessage(text);
    }
  }

  appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message message-user';
    msgDiv.innerHTML = `
      <div class="message-sender">
        <span class="message-time">${this.getCurrentTime()}</span>
        <span class="sender-name">COMMANDER</span>
        <span class="sender-avatar"><i class="fa-solid fa-user-astronaut"></i></span>
      </div>
      <div class="message-bubble">
        <p>${this.escapeHtml(text)}</p>
      </div>
    `;
    this.logEl.appendChild(msgDiv);
    this.scrollToBottom();
  }

  appendSundayMessage(text, actionChips = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message message-sunday';
    
    let chipsHtml = '';
    if (actionChips.length > 0) {
      chipsHtml = `<div class="bubble-actions">` +
        actionChips.map(c => `<span class="action-chip">${c}</span>`).join('') +
        `</div>`;
    }

    msgDiv.innerHTML = `
      <div class="message-sender">
        <span class="sender-avatar"><i class="fa-solid fa-atom"></i></span>
        <span class="sender-name">S.U.N.D.A.Y</span>
        <span class="message-time">${this.getCurrentTime()}</span>
      </div>
      <div class="message-bubble">
        <p>${text}</p>
        ${chipsHtml}
      </div>
    `;
    this.logEl.appendChild(msgDiv);
    this.scrollToBottom();
  }

  appendSystemDirective(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message message-system';
    msgDiv.innerHTML = `
      <div class="message-meta">
        <span class="meta-tag">[ SYSTEM DIRECTIVE ]</span>
        <span class="meta-time">${this.getCurrentTime()}</span>
      </div>
      <div class="message-content">
        <p>${this.escapeHtml(text)}</p>
      </div>
    `;
    this.logEl.appendChild(msgDiv);
    this.scrollToBottom();
  }

  showThinking(label = 'PROCESSING COMMAND...') {
    if (this.thinkingEl) {
      if (this.thinkingTextEl) this.thinkingTextEl.textContent = label;
      this.thinkingEl.style.display = 'flex';
      this.scrollToBottom();
    }
  }

  hideThinking() {
    if (this.thinkingEl) {
      this.thinkingEl.style.display = 'none';
    }
  }

  resetConversation() {
    this.logEl.innerHTML = '';
    this.appendSystemDirective('Conversation buffer purged. Re-establishing telemetry link...');
    this.appendSundayMessage('Console reset complete. Ready for new instructions, Commander.');
  }

  scrollToBottom() {
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
