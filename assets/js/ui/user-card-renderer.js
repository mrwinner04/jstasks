import { Logger } from "../utils/logger.js";

// UI class for rendering and managing user cards
export class UserCardRenderer {
  static createCard(userWeatherData) {
    const { user, weather, coordinates } = userWeatherData;

    const card = document.createElement("div");
    card.className = "user-card";

    if (coordinates) {
      card.dataset.lat = coordinates.lat;
      card.dataset.lng = coordinates.lng;
    }

    card.innerHTML = this.generateCardHTML(user, weather);
    return card;
  }

  static generateCardHTML(user, weather) {
    return `
            <figure class="user-card__figure">
                <img src="${user.picture.large}" alt="${
      user.name.first
    }" class="user-card__image">
            </figure>
            <h2 class="user-card__name">${user.name.first} ${
      user.name.last
    }</h2>
            <p class="user-card__location">${user.location.city}, ${
      user.location.country
    }</p>
            <div class="user-card__weather">
                <p class="user-card__weather-item">Temperature: <span class="user-card__temperature">${
                  weather?.temperature || "N/A"
                }°C</span></p>
                <p class="user-card__weather-item">Humidity: <span class="user-card__humidity">${
                  weather?.humidity || "N/A"
                }%</span></p>
                <p class="user-card__weather-condition">${
                  weather?.condition || "Weather data unavailable"
                }</p>
            </div>
        `;
  }

  static updateWeatherInfo(card, weather) {
    if (!this.validateCard(card)) {
      return;
    }

    const elements = this.getWeatherElements(card);
    if (!elements) {
      return;
    }

    if (weather) {
      elements.temperature.textContent = `${weather.temperature}°C`;
      elements.humidity.textContent = `${weather.humidity}%`;
      elements.condition.textContent = weather.condition;
    } else {
      elements.temperature.textContent = "N/A";
      elements.humidity.textContent = "N/A";
      elements.condition.textContent = "Weather data unavailable";
    }
  }

  static validateCard(card) {
    if (!card) {
      Logger.error("Card element is null or undefined");
      return false;
    }
    return true;
  }

  static getWeatherElements(card) {
    const temperature = card.querySelector(".user-card__temperature");
    const humidity = card.querySelector(".user-card__humidity");
    const condition = card.querySelector(".user-card__weather-condition");

    if (!temperature || !humidity || !condition) {
      Logger.error("Weather information elements not found in card");
      return null;
    }

    return { temperature, humidity, condition };
  }
}
