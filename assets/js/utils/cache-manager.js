import { Logger } from "./logger.js";

// Simplified cache manager for localStorage operations
export class CacheManager {
  static CACHE_KEYS = {
    USERS: "weather_app_users",
    WEATHER: "weather_app_weather",
    LAST_FETCH: "weather_app_last_fetch",
  };

  static CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  static setItem(key, data, timestamp = Date.now()) {
    try {
      const cacheData = {
        data,
        timestamp,
        expires: timestamp + this.CACHE_DURATION,
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      Logger.error("Failed to cache data:", error);
    }
  }

  static getItem(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) {
        return null;
      }

      const cacheData = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() > cacheData.expires) {
        this.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      Logger.error("Failed to retrieve cached data:", error);
      return null;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      Logger.error("Failed to remove cached data:", error);
    }
  }

  static shouldRefreshWeather() {
    const lastFetch = this.getItem(this.CACHE_KEYS.LAST_FETCH);
    if (!lastFetch) {
      return true;
    }

    const timeSinceLastFetch = Date.now() - lastFetch;
    return timeSinceLastFetch >= this.CACHE_DURATION;
  }

  static clearAllCache() {
    Object.values(this.CACHE_KEYS).forEach((key) => {
      this.removeItem(key);
    });
    Logger.info("🧹 Cleared all cache data");
  }
}
