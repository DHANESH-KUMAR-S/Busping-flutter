/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates the Haversine distance between two points on the Earth.
 * Returns distance in meters.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

/**
 * Calculates the ETA in minutes, assuming an average speed in km/h.
 * Speed defaults to 30 km/h.
 */
export function calculateETA(distanceMeters: number, speedKmh = 30): number {
  const distanceKm = distanceMeters / 1000;
  const speedKmMin = speedKmh / 60; // km per minute
  return distanceKm / speedKmMin; // time in minutes
}

/**
 * Formats a distance in meters into a readable string (e.g. "500 m" or "3.2 km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formats an ETA in minutes into a readable string (e.g. "2.4 min" or "15 minutes").
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) {
    return "Under 1 min";
  }
  if (minutes < 10) {
    return `${minutes.toFixed(1)} min`;
  }
  return `${Math.round(minutes)} min`;
}
