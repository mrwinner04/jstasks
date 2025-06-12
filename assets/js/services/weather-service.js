import { API_CONFIG, WEATHER_CODES } from "../config/constants.js";
import { APIHelper } from "../utils/api-helper.js";
import { RetryHelper } from "../utils/retry-helper.js";
import { Logger } from "../utils/logger.js";

// Service for handling weather-related API operations with retry logic
export class WeatherService {
  static async getCurrentWeather(lat, lng) {
    if (!lat || !lng) {
      Logger.error("Invalid coordinates:", { lat, lng });
      return null;
    }

    return await RetryHelper.retryApiCall(
      async () => {
        const url = `${API_CONFIG.WEATHER_URL}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code`;
        const data = await APIHelper.fetchData(
          url,
          "Failed to get weather data"
        );

        APIHelper.validateData(
          data,
          (d) => d.current,
          "No current weather data available"
        );

        return {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          condition: WEATHER_CODES[data.current.weather_code] || "Unknown",
          timestamp: Date.now(),
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        };
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
      },
      `Weather API (${lat}, ${lng})`
    );
  }

  /**
   * Get weather for multiple coordinates with parallel processing
   * @param {Array} coordinatesArray - Array of {lat, lng} objects
   * @returns {Promise<Array>} - Array of weather data objects
   */
  static async getWeatherForMultipleLocations(coordinatesArray) {
    if (!coordinatesArray || coordinatesArray.length === 0) {
      Logger.warn("No coordinates provided for weather fetch");
      return [];
    }

    Logger.info(`🌤️ Fetching weather for ${coordinatesArray.length} locations`);

    const weatherPromises = coordinatesArray.map(async (coords, index) => {
      try {
        const weather = await this.getCurrentWeather(coords.lat, coords.lng);
        return { index, weather, success: true };
      } catch (error) {
        Logger.error(`Failed to get weather for location ${index + 1}:`, error);
        return { index, weather: null, success: false, error };
      }
    });

    const results = await Promise.allSettled(weatherPromises);

    // Process results and maintain order
    const weatherData = new Array(coordinatesArray.length).fill(null);
    let successCount = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const { index: originalIndex, weather, success } = result.value;
        weatherData[originalIndex] = weather;
        if (success) {
          successCount++;
        }
      } else {
        Logger.error(
          `Weather fetch failed for location ${index + 1}:`,
          result.reason
        );
      }
    });

    Logger.info(
      `📊 Weather fetch complete: ${successCount}/${coordinatesArray.length} successful`
    );
    return weatherData;
  }

  /**
   * Check if weather data is still fresh (less than 30 minutes old)
   * @param {Object} weatherData - Weather data object with timestamp
   * @returns {boolean} - Whether the data is still fresh
   */
  static isWeatherDataFresh(weatherData) {
    if (!weatherData || !weatherData.timestamp) {
      return false;
    }

    const ageMs = Date.now() - weatherData.timestamp;
    const maxAgeMs = 30 * 60 * 1000; // 30 minutes
    return ageMs < maxAgeMs;
  }

  /**
   * Get weather with fallback to cached data if API fails
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Object} fallbackData - Cached weather data to use if API fails
   * @returns {Promise<Object>} - Weather data or fallback
   */
  static async getWeatherWithFallback(lat, lng, fallbackData = null) {
    try {
      return await this.getCurrentWeather(lat, lng);
    } catch (error) {
      Logger.warn(`Weather API failed, using fallback data for ${lat}, ${lng}`);

      if (fallbackData && this.isWeatherDataFresh(fallbackData)) {
        Logger.info("Using fresh cached weather data");
        return fallbackData;
      } else if (fallbackData) {
        Logger.warn(
          "Cached weather data is stale but will be used as fallback"
        );
        return { ...fallbackData, stale: true };
      } else {
        Logger.error("No fallback weather data available");
        throw error;
      }
    }
  }
}
