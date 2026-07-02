/// @license
/// SPDX-License-Identifier: Apache-2.0

class UserModel {
  final String uid;
  final String email;
  final String role; // 'driver' | 'student' | ''
  final bool profileCompleted;
  final String name;
  final String phoneNumber;
  final String busNumber;
  
  // Driver specific
  final String driverLicense;
  final String busPlateNumber;
  
  // Student specific
  final String busStopName;
  final double busStopLat;
  final double busStopLon;

  UserModel({
    required this.uid,
    required this.email,
    this.role = '',
    this.profileCompleted = false,
    this.name = '',
    this.phoneNumber = '',
    this.busNumber = '',
    this.driverLicense = '',
    this.busPlateNumber = '',
    this.busStopName = '',
    this.busStopLat = 0.0,
    this.busStopLon = 0.0,
  });

  UserModel copyWith({
    String? uid,
    String? email,
    String? role,
    bool? profileCompleted,
    String? name,
    String? phoneNumber,
    String? busNumber,
    String? driverLicense,
    String? busPlateNumber,
    String? busStopName,
    double? busStopLat,
    double? busStopLon,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      role: role ?? this.role,
      profileCompleted: profileCompleted ?? this.profileCompleted,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      busNumber: busNumber ?? this.busNumber,
      driverLicense: driverLicense ?? this.driverLicense,
      busPlateNumber: busPlateNumber ?? this.busPlateNumber,
      busStopName: busStopName ?? this.busStopName,
      busStopLat: busStopLat ?? this.busStopLat,
      busStopLon: busStopLon ?? this.busStopLon,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'role': role,
      'profileCompleted': profileCompleted,
      'name': name,
      'phoneNumber': phoneNumber,
      'busNumber': busNumber,
      'driverLicense': driverLicense,
      'busPlateNumber': busPlateNumber,
      'busStopName': busStopName,
      'busStopLat': busStopLat,
      'busStopLon': busStopLon,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map, String uid) {
    return UserModel(
      uid: uid,
      email: map['email'] ?? '',
      role: map['role'] ?? '',
      profileCompleted: map['profileCompleted'] ?? false,
      name: map['name'] ?? '',
      phoneNumber: map['phoneNumber'] ?? '',
      busNumber: map['busNumber'] ?? '',
      driverLicense: map['driverLicense'] ?? '',
      busPlateNumber: map['busPlateNumber'] ?? '',
      busStopName: map['busStopName'] ?? '',
      busStopLat: (map['busStopLat'] as num?)?.toDouble() ?? 0.0,
      busStopLon: (map['busStopLon'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
