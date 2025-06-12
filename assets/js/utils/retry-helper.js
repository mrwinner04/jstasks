import { Logger } from "./logger.js";

// Simplified retry helper utility
export class RetryHelper {
  /**
   * Retry an async operation with exponential backoff
   * @param {Function} operation - The async function to retry
   * @param {Object} options - Retry configuration options
   * @param {string} operationName - Name for logging purposes
   * @returns {Promise} - The result of the operation or throws the last error
   */
  static async withRetry(operation, options = {}, operationName = "Operation") {
    const maxAttempts = options.maxAttempts || 3;
    const baseDelay = options.baseDelay || 1000;
    const maxDelay = options.maxDelay || 5000;

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          Logger.info(`🔄 ${operationName} - Retry attempt ${attempt}`);
        }

        const result = await operation();

        if (attempt > 1) {
          Logger.success(`${operationName} succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error;
        Logger.warn(`❌ ${operationName} failed on attempt ${attempt}`);

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

    Logger.error(`💥 ${operationName} failed after ${maxAttempts} attempts`);
    throw lastError;
  }

  /**
   * Retry specifically for API calls
   * @param {Function} apiCall - The API call function
   * @param {Object} options - Retry options
   * @param {string} apiName - API name for logging
   * @returns {Promise} - API response or throws error
   */
  static async retryApiCall(apiCall, options = {}, apiName = "API Call") {
    const apiOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      ...options,
    };

    return this.withRetry(apiCall, apiOptions, apiName);
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
