/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';

class LoadingScreen extends StatefulWidget {
  const LoadingScreen({super.key});

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  Timer? _timeoutTimer;

  @override
  void initState() {
    super.initState();
    _startTimeout();
  }

  void _startTimeout() {
    // 10 second maximum timeout as specified in instructions
    _timeoutTimer = Timer(const Duration(seconds: 10), () {
      if (mounted) {
        debugPrint('Loading timeout! Proceeding with offline cached fallback.');
        _navigateNext();
      }
    });

    // Check auth status periodically. If loaded, move immediately.
    _checkStatus();
  }

  void _checkStatus() {
    Future.microtask(() {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (!authProvider.isLoading) {
        _timeoutTimer?.cancel();
        _navigateNext();
      } else {
        // Retry shortly
        Future.delayed(const Duration(milliseconds: 500), _checkStatus);
      }
    });
  }

  void _navigateNext() {
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFFF5F5F5),
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Spacer(),
            Column(
              children: [
                // Animated circular logo frame
                PhysicalModel(
                  color: Colors.white,
                  elevation: 6,
                  shadowColor: Colors.black12,
                  borderRadius: BorderRadius.all(Radius.circular(28)),
                  child: SizedBox(
                    width: 90,
                    height: 90,
                    child: Center(
                      child: Text(
                        '🚌',
                        style: TextStyle(fontSize: 48),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 20),
                Text(
                  'BusPing',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2196F3),
                    letterSpacing: -0.5,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'REAL-TIME SCHOOL BUS TRACKER',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.black38,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            Spacer(),
            Padding(
              padding: EdgeInsets.only(bottom: 40),
              key: ValueKey('progress-indicators'),
              child: Column(
                children: [
                  SizedBox(
                    width: 32,
                    height: 32,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF2196F3)),
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Loading BusPing...',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.black45,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
