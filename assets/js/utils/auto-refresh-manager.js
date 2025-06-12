import { Logger } from "./logger.js";

// Auto-refresh manager for periodic updates
export class AutoRefreshManager {
  constructor(refreshCallback, intervalMinutes = 30) {
    this.refreshCallback = refreshCallback;
    this.intervalMs = intervalMinutes * 60 * 1000; // Convert minutes to milliseconds
    this.intervalId = null;
    this.isActive = false;
    this.nextRefreshTime = null;
  }

  /**
   * Start the auto-refresh timer
   */
  start() {
    if (this.isActive) {
      Logger.warn("Auto-refresh is already active");
      return;
    }

    this.isActive = true;
    this.scheduleNextRefresh();
    Logger.success(
      `🔄 Auto-refresh started - will refresh every ${
        this.intervalMs / 60000
      } minutes`
    );
  }

  /**
   * Stop the auto-refresh timer
   */
  stop() {
    if (!this.isActive) {
      Logger.warn("Auto-refresh is not active");
      return;
    }

    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    this.isActive = false;
    this.nextRefreshTime = null;
    Logger.info("🛑 Auto-refresh stopped");
  }

  /**
   * Schedule the next refresh
   */
  scheduleNextRefresh() {
    this.nextRefreshTime = Date.now() + this.intervalMs;

    this.intervalId = setTimeout(async () => {
      try {
        Logger.info("⏰ Auto-refresh triggered");
        await this.refreshCallback();

        // Schedule the next refresh if still active
        if (this.isActive) {
          this.scheduleNextRefresh();
        }
      } catch (error) {
        Logger.error("Auto-refresh failed:", error);

        // Still schedule next refresh even if this one failed
        if (this.isActive) {
          this.scheduleNextRefresh();
        }
      }
    }, this.intervalMs);

    const nextRefreshDate = new Date(this.nextRefreshTime);
    Logger.info(
      `📅 Next auto-refresh scheduled for: ${nextRefreshDate.toLocaleTimeString()}`
    );
  }

  /**
   * Force an immediate refresh and reset the timer
   */
  async forceRefresh() {
    if (!this.isActive) {
      Logger.warn("Cannot force refresh - auto-refresh is not active");
      return;
    }

    Logger.info("⚡ Force refresh triggered");

    // Clear current timer
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    try {
      await this.refreshCallback();
    } catch (error) {
      Logger.error("Force refresh failed:", error);
      throw error;
    }

    // Reschedule next refresh
    this.scheduleNextRefresh();
  }

  /**
   * Get time until next refresh in milliseconds
   * @returns {number} - Milliseconds until next refresh, or -1 if not active
   */
  getTimeUntilNextRefresh() {
    if (!this.isActive || !this.nextRefreshTime) {
      return -1;
    }

    return Math.max(0, this.nextRefreshTime - Date.now());
  }

  /**
   * Get time until next refresh in a human-readable format
   * @returns {string} - Formatted time string
   */
  getTimeUntilNextRefreshFormatted() {
    const timeMs = this.getTimeUntilNextRefresh();

    if (timeMs === -1) {
      return "Auto-refresh not active";
    }

    const minutes = Math.ceil(timeMs / 60000);

    if (minutes < 1) {
      return "Less than 1 minute";
    } else if (minutes === 1) {
      return "1 minute";
    } else {
      return `${minutes} minutes`;
    }
  }

  /**
   * Check if auto-refresh is currently active
   * @returns {boolean} - Whether auto-refresh is active
   */
  isRefreshActive() {
    return this.isActive;
  }

  /**
   * Update the refresh interval
   * @param {number} intervalMinutes - New interval in minutes
   */
  updateInterval(intervalMinutes) {
    const newIntervalMs = intervalMinutes * 60 * 1000;

    if (newIntervalMs === this.intervalMs) {
      Logger.info("Refresh interval unchanged");
      return;
    }

    this.intervalMs = newIntervalMs;
    Logger.info(`🔄 Updated refresh interval to ${intervalMinutes} minutes`);

    // If currently active, restart with new interval
    if (this.isActive) {
      const wasActive = this.isActive;
      this.stop();
      if (wasActive) {
        this.start();
      }
    }
  }

  /**
   * Get status information about the auto-refresh
   * @returns {Object} - Status object
   */
  getStatus() {
    return {
      isActive: this.isActive,
      intervalMinutes: this.intervalMs / 60000,
      nextRefreshTime: this.nextRefreshTime,
      timeUntilNextRefresh: this.getTimeUntilNextRefresh(),
      timeUntilNextRefreshFormatted: this.getTimeUntilNextRefreshFormatted(),
    };
  }
}
