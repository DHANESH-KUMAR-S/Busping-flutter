/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:math';

class LocationUtils {
  /// Calculates distance in meters using Haversine formula.
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double r = 6371000.0; // Earth radius in meters
    final double phi1 = lat1 * pi / 180.0;
    final double phi2 = lat2 * pi / 180.0;
    final double deltaPhi = (lat2 - lat1) * pi / 180.0;
    final double deltaLambda = (lon2 - lon1) * pi / 180.0;

    final double a = sin(deltaPhi / 2.0) * sin(deltaPhi / 2.0) +
        cos(phi1) * cos(phi2) * sin(deltaLambda / 2.0) * sin(deltaLambda / 2.0);
    final double c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a));

    return r * c; // In meters
  }

  /// Calculates the ETA in minutes, assuming an average speed of 30 km/h.
  static double calculateETA(double distanceMeters, {double speedKmh = 30.0}) {
    final double distanceKm = distanceMeters / 1000.0;
    final double speedKmMin = speedKmh / 60.0; // km per minute
    return distanceKm / speedKmMin; // In minutes
  }

  /// Formats distance beautifully. e.g. "500 m" or "3.2 km".
  static String formatDistance(double meters) {
    if (meters < 1000.0) {
      return '${meters.round()} m';
    }
    return '${(meters / 1000.0).toStringAsFixed(1)} km';
  }

  /// Formats ETA beautifully. e.g. "2.4 min" or "15 minutes".
  static String formatETA(double minutes) {
    if (minutes < 1.0) {
      return 'Under 1 min';
    }
    if (minutes < 10.0) {
      return '${minutes.toStringAsFixed(1)} min';
    }
    return '${minutes.round()} minutes';
  }
}
