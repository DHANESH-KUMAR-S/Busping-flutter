/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "driver" | "student" | null;

export interface UserProfile {
  name: string;
  phoneNumber: string;
  busNumber: string;
  driverLicense?: string;
  busPlateNumber?: string;
  busStopName?: string;
  busStopLat?: number;
  busStopLon?: number;
}

export interface UserState {
  uid: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
  profile: UserProfile | null;
}

export interface BusLocation {
  driverUid: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isActive: boolean;
}

export interface WaitingState {
  [busNumber: string]: {
    [stopKey: string]: {
      [uid: string]: boolean;
    };
  };
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SearchResult {
  name: string;
  lat: number;
  lon: number;
}
