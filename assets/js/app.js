import { UIManager } from "./ui/ui-manager.js";

// Main application class - entry point
export class WeatherApp {
  constructor() {
    this.uiManager = new UIManager();
    this.initialize();
  }

  initialize() {
    this.uiManager.fetchNewUsers();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
