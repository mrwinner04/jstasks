import { Logger } from "./logger.js";

// Generic API utility functions
export class APIHelper {
  static async fetchData(url, errorMessage) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      Logger.error(errorMessage, error);
      throw error;
    }
  }

  static validateData(data, condition, errorMessage) {
    if (!condition(data)) {
      throw new Error(errorMessage);
    }
  }
}
