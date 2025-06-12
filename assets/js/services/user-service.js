import { API_CONFIG } from "../config/constants.js";
import { APIHelper } from "../utils/api-helper.js";
import { CacheManager } from "../utils/cache-manager.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";

// Service for handling user-related API operations with caching and retry logic
export class UserService {
  static async fetchRandomUsers(count = 5, useCache = true) {
    // Check cache first if enabled
    if (useCache) {
      const cachedUsers = CacheManager.getItem(CacheManager.CACHE_KEYS.USERS);
      if (cachedUsers && cachedUsers.length >= count) {
        Logger.info(`📦 Using cached users (${cachedUsers.length} available)`);
        return cachedUsers.slice(0, count);
      }
    }

    // Fetch from API with retry logic
    const users = await RetryHelper.retryApiCall(
      async () => {
        const url = `${API_CONFIG.RANDOM_USER_URL}?results=${count}`;
        const data = await APIHelper.fetchData(
          url,
          "Failed to fetch random users"
        );
        APIHelper.validateData(
          data,
          (d) => d.results && d.results.length > 0,
          "No users found in response"
        );
        return data.results;
      },
      { maxAttempts: 3, baseDelay: 1000 },
      "Random User API"
    );

    // Cache the fetched users
    if (users && users.length > 0) {
      CacheManager.setItem(CacheManager.CACHE_KEYS.USERS, users);
    }

    return users;
  }

  /**
   * Clear cached users and force fresh fetch
   * @param {number} count - Number of users to fetch
   * @returns {Promise<Array>} - Array of user objects
   */
  static async fetchFreshUsers(count = 5) {
    Logger.info("🔄 Forcing fresh user fetch (ignoring cache)");
    CacheManager.removeItem(CacheManager.CACHE_KEYS.USERS);
    return this.fetchRandomUsers(count, false);
  }

  /**
   * Get cached users without making API calls
   * @returns {Array|null} - Cached users or null if not available
   */
  static getCachedUsers() {
    return CacheManager.getItem(CacheManager.CACHE_KEYS.USERS);
  }

  /**
   * Check if cached users are available and not expired
   * @returns {boolean} - Whether valid cached users exist
   */
  static hasCachedUsers() {
    const cachedUsers = CacheManager.getItem(CacheManager.CACHE_KEYS.USERS);
    return cachedUsers && cachedUsers.length > 0;
  }
}
