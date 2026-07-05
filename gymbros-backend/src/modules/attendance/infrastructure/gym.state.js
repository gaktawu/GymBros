import crypto from 'crypto';

class GymState {
  constructor() {
    this.activeMemberCount = 0;
    this.dynamicCode = null;
    this.codeExpiry = null;
    this.io = null;
    this.intervalId = null;
  }

  // --- COUNT ---
  syncCount(count) {
    this.activeMemberCount = parseInt(count, 10) || 0;
    this.broadcastCount();
  }

  getCount() {
    return this.activeMemberCount;
  }

  increment() {
    this.activeMemberCount += 1;
    this.broadcastCount();
  }

  decrement(amount = 1) {
    this.activeMemberCount = Math.max(0, this.activeMemberCount - amount);
    this.broadcastCount();
  }

  // --- CODE ---
  generateDynamicCode(validityMinutes = 10) {
    this.dynamicCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.codeExpiry = new Date(Date.now() + validityMinutes * 60000);
    this.broadcastCode();
    return { code: this.dynamicCode, expiresAt: this.codeExpiry };
  }

  validateCode(inputCode) {
    if (!this.dynamicCode || !this.codeExpiry) return false;
    if (new Date() > this.codeExpiry) return false;
    return this.dynamicCode === inputCode.toUpperCase().trim();
  }

  getCodeInfo() {
    return {
      code: this.dynamicCode,
      expiresAt: this.codeExpiry,
      isExpired: this.dynamicCode ? new Date() > this.codeExpiry : true
    };
  }

  // --- SOCKET BROADCAST ---
  setSocketIO(ioInstance) {
    this.io = ioInstance;
  }

  broadcastCount() {
    if (this.io) {
      this.io.of('/attendance').emit('gym-count-updated', this.activeMemberCount);
    }
  }

  broadcastCode() {
    if (this.io) {
      this.io.of('/attendance').emit('new-dynamic-code', {
        code: this.dynamicCode,
        expiresAt: this.codeExpiry
      });
    }
  }

  startAutoGenerate(ioInstance) {
    this.setSocketIO(ioInstance);

    this.generateDynamicCode(10);
    console.log('✅ Auto-generate kode aktif (interval 10 menit)');

    this.intervalId = setInterval(() => {
      this.generateDynamicCode(10);
    }, 10 * 60 * 1000);
  }

  stopAutoGenerate() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  validateCode(inputCode) {
    if (typeof inputCode !== 'string' || inputCode.trim() === '') {
      return { valid: false, reason: 'EMPTY_INPUT' };
    }
    if (!this.dynamicCode || !this.codeExpiry) {
      return { valid: false, reason: 'NO_ACTIVE_CODE' };
    }
    if (new Date() > this.codeExpiry) {
      return { valid: false, reason: 'EXPIRED' };
    }
    if (this.dynamicCode !== inputCode.toUpperCase().trim()) {
      return { valid: false, reason: 'MISMATCH' };
    }
    return { valid: true, reason: null };
  }
}

export const gymState = new GymState();