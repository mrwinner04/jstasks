// Centralized logging utility
export class Logger {
  static info(message, data = null) {
    console.log(message, data || "");
  }

  static warn(message, data = null) {
    console.warn(message, data || "");
  }

  static error(message, error = null) {
    console.error(message, error || "");
  }

  static success(message) {
    console.log(`✅ ${message}`);
  }

  static location(user) {
    this.info(
      `📍 Processing location for ${user.name.first} ${user.name.last}:`
    );
    this.info(`   City: ${user.location.city}`);
    this.info(`   Country: ${user.location.country}`);
  }

  static coordinates(coordinates) {
    this.info(`   Coordinates: ${coordinates.lat}, ${coordinates.lng}`);
  }

  static weatherRefresh(lat, lng) {
    this.info(`🔄 Refreshing weather for coordinates: ${lat}, ${lng}`);
  }

  static summary(successCount, totalCount) {
    this.info(
      `🎉 Weather refresh complete! Successfully updated ${successCount} out of ${totalCount} cards`
    );
  }
}
