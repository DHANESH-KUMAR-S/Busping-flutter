/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong2.dart';
import 'package:provider/provider.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/providers/auth_provider.dart';
import '../../core/utils/location_utils.dart';

class StudentHomeScreen extends StatefulWidget {
  const StudentHomeScreen({super.key});

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  final MapController _mapController = MapController();
  final DatabaseReference _dbRef = FirebaseDatabase.instance.ref();

  LatLng? _busLatLng;
  bool _isBusActive = false;
  bool _isWaiting = false;

  // Polyline coordinates for OSRM route drawing
  List<LatLng> _routePoints = [];

  StreamSubscription<DatabaseEvent>? _busSubscription;
  StreamSubscription<DatabaseEvent>? _waitingSubscription;

  @override
  void initState() {
    super.initState();
    _listenToBusCoordinates();
    _listenToWaitingStatus();
  }

  void _listenToBusCoordinates() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final String targetBus = authProvider.user?.busNumber ?? '';

    if (targetBus.isNotEmpty) {
      _busSubscription = _dbRef.child('buses').onValue.listen((event) {
        if (!mounted) return;
        final snapshot = event.snapshot;
        if (snapshot.value != null && snapshot.value is Map) {
          final Map drivers = snapshot.value as Map;
          LatLng? activeBusLatLng;
          bool active = false;

          drivers.forEach((driverUid, data) {
            if (data is Map && data['busNumber']?.toString() == targetBus) {
              if (data['isActive'] == true) {
                active = true;
                final lat = (data['latitude'] as num).toDouble();
                final lon = (data['longitude'] as num).toDouble();
                activeBusLatLng = LatLng(lat, lon);
              }
            }
          });

          setState(() {
            _busLatLng = activeBusLatLng;
            _isBusActive = active;
          });

          if (active && activeBusLatLng != null) {
            _fetchOSRMRoute(activeBusLatLng!);
          } else {
            setState(() {
              _routePoints.clear();
            });
          }
        }
      });
    }
  }

  void _listenToWaitingStatus() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final String busNum = authProvider.user?.busNumber ?? '';
    final String uid = authProvider.user?.uid ?? '';
    final String stopKey = 'stop_key'; // Simple key identifier for student stop

    _waitingSubscription = _dbRef.child('waiting/$busNum/$stopKey/$uid').onValue.listen((event) {
      if (!mounted) return;
      setState(() {
        _isWaiting = event.snapshot.value == true;
      });
    });
  }

  Future<void> _fetchOSRMRoute(LatLng busCoords) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final stopLat = authProvider.user?.busStopLat ?? 0.0;
    final stopLon = authProvider.user?.busStopLon ?? 0.0;

    if (stopLat == 0.0 || stopLon == 0.0) return;

    try {
      final url = 'https://router.project-osrm.org/route/v1/driving/${busCoords.longitude},${busCoords.latitude};$stopLon,$stopLat?overview=full&geometries=geojson';
      final res = await http.get(Uri.parse(url));
      
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final List coords = data['routes'][0]['geometry']['coordinates'];
          setState(() {
            _routePoints = coords.map<LatLng>((item) => LatLng((item[1] as num).toDouble(), (item[0] as num).toDouble())).toList();
          });
        }
      }
    } catch (e) {
      // Fallback straight line
      setState(() {
        _routePoints = [busCoords, LatLng(stopLat, stopLon)];
      });
    }
  }

  void _toggleWaiting() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final String busNum = authProvider.user?.busNumber ?? '';
    final String uid = authProvider.user?.uid ?? '';
    final String stopKey = 'stop_key';

    final nextStatus = !_isWaiting;
    _dbRef.child('waiting/$busNum/$stopKey/$uid').set(nextStatus ? true : null);
  }

  @override
  void dispose() {
    _busSubscription?.cancel();
    _waitingSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final stopLat = authProvider.user?.busStopLat ?? 37.7749;
    final stopLon = authProvider.user?.busStopLon ?? -122.4194;
    final userStop = LatLng(stopLat, stopLon);
    
    // User current slightly offset from stop for map visuals
    final userLatLng = LatLng(stopLat + 0.001, stopLon + 0.001);

    double distance = 0.0;
    double eta = 0.0;

    if (_isBusActive && _busLatLng != null) {
      distance = LocationUtils.calculateDistance(
        _busLatLng!.latitude,
        _busLatLng!.longitude,
        stopLat,
        stopLon,
      );
      eta = LocationUtils.calculateETA(distance);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Stack(
        children: [
          // Maps canvas
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: userStop,
              initialZoom: 14.5,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
              ),
              if (_routePoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _routePoints,
                      color: const Color(0xFF2196F3),
                      strokeWidth: 4.5,
                      borderColor: Colors.white,
                      borderStrokeWidth: 1.5,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  // User Stop Marker
                  Marker(
                    point: userStop,
                    width: 60,
                    height: 60,
                    child: const Column(
                      children: [
                        Icon(Icons.location_on_rounded, color: Color(0xFFFF7043), size: 36),
                        Text(
                          'MY STOP',
                          style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, backgroundColor: Colors.white),
                        ),
                      ],
                    ),
                  ),

                  // Bus Marker (if Active)
                  if (_isBusActive && _busLatLng != null)
                    Marker(
                      point: _busLatLng!,
                      width: 60,
                      height: 60,
                      child: const Column(
                        children: [
                          Icon(Icons.directions_bus, color: Color(0xFF4CAF50), size: 32),
                          Text(
                            'BUS',
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.extrabold, backgroundColor: Colors.white),
                          ),
                        ],
                      ),
                    ),

                  // Student User Marker
                  Marker(
                    point: userLatLng,
                    width: 50,
                    height: 50,
                    child: const Icon(Icons.my_location, color: Colors.blue, size: 24),
                  ),
                ],
              ),
            ],
          ),

          // Floating Top Status indicators
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10)],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: _isBusActive ? const Color(0xFFDBEAFE) : Colors.grey.shade100,
                          child: Text(_isBusActive ? '🚌' : '💤'),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Assigned Bus ${authProvider.user?.busNumber ?? "N/A"}',
                              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _isBusActive ? 'ACTIVE & EN ROUTE' : 'NOT ACTIVE YET',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.extrabold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Info Sheet
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 16, offset: Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_isBusActive) ...[
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('DISTANCE', style: TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(
                                  LocationUtils.formatDistance(distance),
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.extrabold, color: Color(0xFF1E3A8A)),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('ETA', style: TextStyle(fontSize: 9, color: Colors.emerald, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(
                                  LocationUtils.formatETA(eta),
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.extrabold, color: Color(0xFF065F46)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFECE5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(child: Text('📍', style: TextStyle(fontSize: 20))),
                          ),
                          const SizedBox(width: 14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('MY PICK-UP STOP', style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(
                                authProvider.user?.busStopName ?? 'No Stop Selected',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isWaiting ? const Color(0xFFFF7043) : const Color(0xFFEFF6FF),
                          foregroundColor: _isWaiting ? Colors.white : const Color(0xFF2196F3),
                          minimumSize: const Size(120, 48),
                        ),
                        onPressed: _toggleWaiting,
                        child: Text(_isWaiting ? "🙋‍♂️ I'm Waiting" : "I'm Waiting"),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
/// @license
/// SPDX-License-Identifier: Apache-2.0
