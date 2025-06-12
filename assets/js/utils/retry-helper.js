import { Logger } from "./logger.js";

// Simplified retry helper utility
export class RetryHelper {
  /**
   * Retry specifically for API calls
   * @param {Function} apiCall - The API call function
   * @param {Object} options - Retry options
   * @param {string} apiName - API name for logging
   * @returns {Promise} - API response or throws error
   */
  static async retryApiCall(apiCall, options = {}, apiName = "API Call") {
    const maxAttempts = options.maxAttempts || 3;
    const baseDelay = options.baseDelay || 1000;
    const maxDelay = options.maxDelay || 5000;

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          Logger.info(`🔄 ${apiName} - Retry attempt ${attempt}`);
        }

        const result = await apiCall();

        if (attempt > 1) {
          Logger.success(`${apiName} succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error;
        Logger.warn(`❌ ${apiName} failed on attempt ${attempt}`);

        if (attempt < maxAttempts) {
          const delay = Math.min(
            baseDelay * Math.pow(2, attempt - 1),
            maxDelay
          );
          Logger.info(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    Logger.error(`💥 ${apiName} failed after ${maxAttempts} attempts`);
    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after the delay
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
