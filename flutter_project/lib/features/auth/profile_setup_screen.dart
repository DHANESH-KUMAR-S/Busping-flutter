/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/models/user_model.dart';
import '../stop_picker/stop_picker_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _busNumberController = TextEditingController();
  
  // Driver specific
  final _licenseController = TextEditingController();
  final _plateController = TextEditingController();

  // Student specific stop values
  String _stopName = '';
  double _stopLat = 0.0;
  double _stopLon = 0.0;

  @override
  void initState() {
    super.initState();
    // Populate default text if user already partially has profile filled
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      _nameController.text = user.name;
      _phoneController.text = user.phoneNumber;
      _busNumberController.text = user.busNumber;
      _licenseController.text = user.driverLicense;
      _plateController.text = user.busPlateNumber;
      _stopName = user.busStopName;
      _stopLat = user.busStopLat;
      _stopLon = user.busStopLon;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _busNumberController.dispose();
    _licenseController.dispose();
    _plateController.dispose();
    super.dispose();
  }

  Future<void> _pickStopOnMap() async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(builder: (context) => const StopPickerScreen()),
    );

    if (result != null) {
      setState(() {
        _stopName = result['name'] ?? '';
        _stopLat = result['latitude'] ?? 0.0;
        _stopLon = result['longitude'] ?? 0.0;
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isDriver = authProvider.role == 'driver';

    if (!isDriver && _stopName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your bus stop on the map.')),
      );
      return;
    }

    final updatedModel = UserModel(
      uid: authProvider.user!.uid,
      email: authProvider.user!.email,
      role: authProvider.role,
      name: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      busNumber: _busNumberController.text.trim(),
      driverLicense: isDriver ? _licenseController.text.trim() : '',
      busPlateNumber: isDriver ? _plateController.text.trim() : '',
      busStopName: isDriver ? '' : _stopName,
      busStopLat: isDriver ? 0.0 : _stopLat,
      busStopLon: isDriver ? 0.0 : _stopLon,
      profileCompleted: true,
    );

    try {
      await authProvider.saveProfile(updatedModel);
      if (mounted) {
        context.go(isDriver ? '/driver_home' : '/student_home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving profile: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isDriver = authProvider.role == 'driver';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(authProvider.profileCompleted ? 'Edit Profile' : 'Profile Setup'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Complete Your Details',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 6),
                const Text(
                  'This ensures your school transit coordinates synchronise accurately.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 24),

                // Full Name
                TextFormField(
                  controller: _nameController,
                  enabled: !authProvider.isLoading,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your name' : null,
                ),
                const SizedBox(height: 16),

                // Phone Number
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enabled: !authProvider.isLoading,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone_outlined, size: 20),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your phone number' : null,
                ),
                const SizedBox(height: 16),

                // Bus Number
                TextFormField(
                  controller: _busNumberController,
                  enabled: !authProvider.isLoading,
                  decoration: const InputDecoration(
                    labelText: 'Bus Number',
                    prefixIcon: Icon(Icons.directions_bus_outlined, size: 20),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your assigned bus number' : null,
                ),
                const SizedBox(height: 16),

                if (isDriver) ...[
                  // Driver License
                  TextFormField(
                    controller: _licenseController,
                    enabled: !authProvider.isLoading,
                    decoration: const InputDecoration(
                      labelText: 'Driver License ID',
                      prefixIcon: Icon(Icons.badge_outlined, size: 20),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'License ID is required' : null,
                  ),
                  const SizedBox(height: 16),

                  // Bus Plate Number
                  TextFormField(
                    controller: _plateController,
                    enabled: !authProvider.isLoading,
                    decoration: const InputDecoration(
                      labelText: 'Bus Plate Number',
                      prefixIcon: Icon(Icons.pin_outlined, size: 20),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Plate number is required' : null,
                  ),
                ] else ...[
                  // Student Custom Stop Picker Map trigger
                  const SizedBox(height: 8),
                  const Text(
                    'My Pick-Up Bus Stop',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  _stopName.isNotEmpty
                      ? Card(
                          margin: EdgeInsets.zero,
                          color: Colors.white,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                const Icon(Icons.location_on_rounded, color: Color(0xFFFF7043)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _stopName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                TextButton(
                                  onPressed: _pickStopOnMap,
                                  child: const Text('Change', style: TextStyle(fontSize: 12)),
                                ),
                              ],
                            ),
                          ),
                        )
                      : OutlinedButton.icon(
                          onPressed: _pickStopOnMap,
                          icon: const Icon(Icons.map_rounded, size: 18),
                          label: const Text('Select Stop On Map'),
                        ),
                ],

                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: authProvider.isLoading ? null : _save,
                  child: authProvider.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Complete Account Setup'),
                            SizedBox(width: 8),
                            Icon(Icons.check_circle_outline_rounded, size: 18),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
/// @license
/// SPDX-License-Identifier: Apache-2.0
