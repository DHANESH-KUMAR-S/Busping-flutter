/// @license
/// SPDX-License-Identifier: Apache-2.0

class BusLocationModel {
  final String driverUid;
  final String busNumber;
  final double latitude;
  final double longitude;
  final double accuracy;
  final int timestamp;
  final bool isActive;

  BusLocationModel({
    required this.driverUid,
    required this.busNumber,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.timestamp,
    required this.isActive,
  });

  Map<String, dynamic> toMap() {
    return {
      'driverUid': driverUid,
      'busNumber': busNumber,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'timestamp': timestamp,
      'isActive': isActive,
    };
  }

  factory BusLocationModel.fromMap(Map<Object?, Object?> map, String driverUid) {
    return BusLocationModel(
      driverUid: driverUid,
      busNumber: map['busNumber']?.toString() ?? '',
      latitude: (map['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (map['longitude'] as num?)?.toDouble() ?? 0.0,
      accuracy: (map['accuracy'] as num?)?.toDouble() ?? 0.0,
      timestamp: (map['timestamp'] as num?)?.toInt() ?? 0,
      isActive: map['isActive'] as bool? ?? false,
    );
  }
}
