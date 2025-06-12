import { GeocodingService } from "../services/geocoding-service.js";
import { WeatherService } from "../services/weather-service.js";
import { Logger } from "../utils/logger.js";

// Converter for transforming user data to complete user-weather data
export class UserWeatherConverter {
  static async convertUserToUserWeatherData(user) {
    Logger.location(user);

    const coordinates = await GeocodingService.getCoordinates(
      user.location.city,
      user.location.country
    );

    if (!coordinates) {
      Logger.warn(`❌ Could not get coordinates for ${user.name.first}`);
      return { user, weather: null, coordinates: null };
    }

    Logger.coordinates(coordinates);
    const weather = await WeatherService.getCurrentWeather(
      coordinates.lat,
      coordinates.lng
    );

    return { user, weather, coordinates };
  }
}
