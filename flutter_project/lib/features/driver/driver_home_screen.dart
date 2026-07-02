/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong2.dart';
import 'package:provider/provider.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/providers/auth_provider.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  final MapController _mapController = MapController();
  final DatabaseReference _dbRef = FirebaseDatabase.instance.ref();
  
  LatLng _currentLatLng = const LatLng(37.7749, -122.4194);
  bool _isTracking = false;
  bool _isSimulating = false;
  int _waitingCount = 0;
  
  StreamSubscription<Position>? _positionStream;
  Timer? _simulationTimer;
  double _simAngle = 0.0;
  StreamSubscription<DatabaseEvent>? _waitingSubscription;

  @override
  void initState() {
    super.initState();
    _listenToWaitingStudents();
  }

  void _listenToWaitingStudents() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final busNum = authProvider.user?.busNumber ?? '';
    
    if (busNum.isNotEmpty) {
      _waitingSubscription = _dbRef.child('waiting/$busNum').onValue.listen((event) {
        if (!mounted) return;
        final snapshot = event.snapshot;
        if (snapshot.value != null && snapshot.value is Map) {
          final Map stops = snapshot.value as Map;
          int total = 0;
          stops.forEach((stopKey, students) {
            if (students is Map) {
              total += students.length;
            }
          });
          setState(() {
            _waitingCount = total;
          });
        } else {
          setState(() {
            _waitingCount = 0;
          });
        }
      });
    }
  }

  Future<void> _startTracking() async {
    // 1. Check & request foreground and background location permissions
    var foregroundStatus = await Permission.location.request();
    if (!foregroundStatus.isGranted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Foreground location permission is required for active tracking.')),
        );
      }
      return;
    }

    var backgroundStatus = await Permission.locationAlways.request();
    debugPrint('Background location request status: $backgroundStatus');

    setState(() {
      _isTracking = true;
    });

    _pushLocationUpdate(_currentLatLng);

    // Get live geolocation stream
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((Position position) {
      if (_isSimulating) return; // Ignore GPS updates if simulation is actively overriding
      final latLng = LatLng(position.latitude, position.longitude);
      setState(() {
        _currentLatLng = latLng;
      });
      _mapController.move(latLng, _mapController.camera.zoom);
      _pushLocationUpdate(latLng);
    });
  }

  void _stopTracking() {
    _positionStream?.cancel();
    _positionStream = null;
    
    _simulationTimer?.cancel();
    _simulationTimer = null;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _dbRef.child('buses/${authProvider.user!.uid}').update({
      'isActive': false,
    });

    setState(() {
      _isTracking = false;
      _isSimulating = false;
    });
  }

  void _toggleSimulation() {
    if (!_isTracking) {
      _startTracking();
    }

    setState(() {
      _isSimulating = !_isSimulating;
    });

    if (_isSimulating) {
      const radius = 0.005; // Circular radius sweep
      final centerLat = _currentLatLng.latitude;
      final centerLon = _currentLatLng.longitude;

      _simulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
        setState(() {
          _simAngle += 0.15;
          final lat = centerLat + cos(_simAngle) * radius;
          final lon = centerLon + sin(_simAngle) * radius;
          _currentLatLng = LatLng(lat, lon);
        });
        _mapController.move(_currentLatLng, _mapController.camera.zoom);
        _pushLocationUpdate(_currentLatLng);
      });
    } else {
      _simulationTimer?.cancel();
      _simulationTimer = null;
    }
  }

  void _pushLocationUpdate(LatLng latLng) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _dbRef.child('buses/${authProvider.user!.uid}').set({
      'driverUid': authProvider.user!.uid,
      'busNumber': authProvider.user!.busNumber,
      'latitude': latLng.latitude,
      'longitude': latLng.longitude,
      'accuracy': 10.0,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'isActive': _isTracking,
    });
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _simulationTimer?.cancel();
    _waitingSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Stack(
        children: [
          // interactive full screen map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLatLng,
              initialZoom: 15.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _currentLatLng,
                    width: 70,
                    height: 70,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Text(
                            'Bus ${authProvider.user?.busNumber ?? '12'}',
                            style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Icon(Icons.directions_bus_filled_rounded, color: Color(0xFF4CAF50), size: 36),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Floating tracking status labels
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _isTracking ? Colors.emerald : Colors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isTracking ? (_isSimulating ? 'SIMULATION LIVE' : 'TRACKING LIVE') : 'OFFLINE',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  if (_waitingCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF7043),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                      ),
                      child: Text(
                        '🙋‍♂️ $_waitingCount WAITING',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.extrabold, color: Colors.white),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Bottom Sheet
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const CircleAvatar(
                            backgroundColor: Color(0xFFEFF6FF),
                            child: Text('🚌'),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Bus ${authProvider.user?.busNumber ?? 'N/A'}',
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                authProvider.user?.busPlateNumber ?? 'PLATE-N/A',
                                style: const TextStyle(fontSize: 10, color: Colors.grey),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.logout),
                        onPressed: () {
                          _stopTracking();
                          authProvider.logout();
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: _isTracking
                            ? ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF44336)),
                                onPressed: _stopTracking,
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [Icon(Icons.stop), SizedBox(width: 8), Text('Stop')],
                                ),
                              )
                            : ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4CAF50)),
                                onPressed: _startTracking,
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [Icon(Icons.play_arrow), SizedBox(width: 8), Text('Start Tracking')],
                                ),
                              ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _toggleSimulation,
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: _isSimulating ? const Color(0xFFFF7043) : const Color(0xFF2196F3),
                            ),
                            foregroundColor: _isSimulating ? const Color(0xFFFF7043) : const Color(0xFF2196F3),
                          ),
                          child: Text(_isSimulating ? 'Sim Active' : 'Simulate'),
                        ),
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
