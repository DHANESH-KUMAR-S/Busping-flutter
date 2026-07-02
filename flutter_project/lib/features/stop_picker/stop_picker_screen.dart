/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong2.dart';
import 'package:http/http.dart' as http;

class StopPickerScreen extends StatefulWidget {
  const StopPickerScreen({super.key});

  @override
  State<StopPickerScreen> createState() => _StopPickerScreenState();
}

class _StopPickerScreenState extends State<StopPickerScreen> {
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  
  LatLng _selectedLatLng = const LatLng(37.7749, -122.4194); // SF default
  String _selectedName = 'San Francisco, CA';
  
  List<dynamic> _searchResults = [];
  bool _isLoading = false;

  Future<void> _performSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('https://nominatim.openstreetmap.org/search?format=json&q=${Uri.encodeComponent(query)}&limit=5'),
        headers: {'User-Agent': 'BusPingAppFlutterClient'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _searchResults = data;
        });
      }
    } catch (e) {
      debugPrint('Search failed: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _selectResult(dynamic result) {
    final lat = double.parse(result['lat']);
    final lon = double.parse(result['lon']);
    final name = result['display_name'].toString().split(',')[0];

    setState(() {
      _selectedLatLng = LatLng(lat, lon);
      _selectedName = name;
      _searchResults.clear();
      _searchController.clear();
    });

    _mapController.move(_selectedLatLng, 15);
  }

  void _onMapTap(TapPosition tapPosition, LatLng latLng) {
    setState(() {
      _selectedLatLng = latLng;
      _selectedName = 'Dropped Marker (${latLng.latitude.toStringAsFixed(4)}, ${latLng.longitude.toStringAsFixed(4)})';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Stack(
        children: [
          // FlutterMap
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _selectedLatLng,
              initialZoom: 14.0,
              onTap: _onMapTap,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _selectedLatLng,
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
                ],
              ),
            ],
          ),

          // Top Search bar overlay
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 15,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: TextFormField(
                      controller: _searchController,
                      textInputAction: TextInputAction.search,
                      onFieldSubmitted: (_) => _performSearch(),
                      decoration: InputDecoration(
                        hintText: 'Search school, street or area...',
                        prefixIcon: const Icon(Icons.search_rounded),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        suffixIcon: IconButton(
                          icon: _isLoading
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.arrow_forward),
                          onPressed: _performSearch,
                        ),
                      ),
                    ),
                  ),

                  // Search Results List Dropdown
                  if (_searchResults.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 12),
                        ],
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: _searchResults.length,
                        physics: const NeverScrollableScrollPhysics(),
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, idx) {
                          final item = _searchResults[idx];
                          return ListTile(
                            leading: const Icon(Icons.location_city_rounded, size: 20),
                            title: Text(
                              item['display_name'].toString().split(',')[0],
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              item['display_name'],
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 10),
                            ),
                            onTap: () => _selectResult(item),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Bottom Sheet selector
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 12, offset: Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
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
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Selected Location',
                              style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _selectedName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context, {
                        'name': _selectedName,
                        'latitude': _selectedLatLng.latitude,
                        'longitude': _selectedLatLng.longitude,
                      });
                    },
                    child: const Text('Use This Location'),
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
