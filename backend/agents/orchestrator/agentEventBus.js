/**
 * agentEventBus.js
 * Singleton EventEmitter that acts as the central nervous system of the Farm Integrity Agent.
 * All controllers emit events here after successful DB writes.
 * The orchestrator listens and routes events to the appropriate detector.
 */
const { EventEmitter } = require('events');

class AgentEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Many agents may listen
    this._stats = {
      emitted: 0,
      processed: 0,
      errors: 0,
    };
  }

  emit(eventType, payload) {
    this._stats.emitted++;
    // Attach metadata to every event
    const enrichedPayload = {
      ...payload,
      _eventType: eventType,
      _emittedAt: new Date().toISOString(),
    };
    return super.emit(eventType, enrichedPayload);
  }

  getStats() {
    return { ...this._stats };
  }

  recordProcessed() {
    this._stats.processed++;
  }

  recordError() {
    this._stats.errors++;
  }
}

// Export singleton
const agentEventBus = new AgentEventBus();
module.exports = agentEventBus;
