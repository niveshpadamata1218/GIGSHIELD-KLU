/**
 * EVENT BUS - Pub/Sub system for real-time data synchronization
 * between Worker Dashboard and Admin Dashboard
 */

class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name (e.g., 'worker_registered', 'plan_selected')
   * @param {Function} callback - Function to execute when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)

    // Return unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback)
    }
  }

  /**
   * Subscribe to event once
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (...args) => {
      callback(...args)
      unsubscribe()
    })
    return unsubscribe
  }

  /**
   * Emit an event
   * @param {string} eventName - Event name
   * @param {*} data - Data to pass to subscribers
   */
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for an event
   */
  off(eventName) {
    delete this.events[eventName]
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.events = {}
  }
}

// Export singleton instance
export const eventBus = new EventBus()

// Export event names as constants for type safety
export const EVENT_NAMES = {
  // Worker lifecycle events
  WORKER_REGISTERED: 'worker_registered',
  WORKER_LOGGED_IN: 'worker_logged_in',
  WORKER_LOGGED_OUT: 'worker_logged_out',
  WORKER_UPDATED: 'worker_updated',

  // Plan events
  PLAN_SELECTED: 'plan_selected',
  PLAN_UPDATED: 'plan_updated',

  // Session events
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',

  // Claim events
  CLAIM_TRIGGERED: 'claim_triggered',
  CLAIM_UPDATED: 'claim_updated',

  // Disruption events
  DISRUPTION_TRIGGERED: 'disruption_triggered',

  // Fraud events
  FRAUD_ALERT: 'fraud_alert',

  // General sync events
  WORKER_DATA_SYNC: 'worker_data_sync',
}

export default eventBus
