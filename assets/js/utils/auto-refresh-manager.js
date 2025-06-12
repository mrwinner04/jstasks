import { Logger } from "./logger.js";

// Auto-refresh manager for updates
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
}
