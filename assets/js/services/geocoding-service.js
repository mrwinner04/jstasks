import { API_CONFIG } from "../config/constants.js";
import { APIHelper } from "../utils/api-helper.js";
import { Logger } from "../utils/logger.js";

// Service for handling geocoding operations
export class GeocodingService {
  static async getCoordinates(city, country) {
    const query = encodeURIComponent(`${city},${country}`);
    const url = `${API_CONFIG.OPENCAGE_URL}?q=${query}&key=${API_CONFIG.OPENCAGE_KEY}`;

    try {
      const data = await APIHelper.fetchData(url, "Failed to get coordinates");

      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].geometry.lat,
          lng: data.results[0].geometry.lng,
        };
      }
      return null;
    } catch (error) {
      Logger.error("Error getting coordinates:", error);
      return null;
    }
  }
}
