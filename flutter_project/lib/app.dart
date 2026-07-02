/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/material.dart';
import 'router.dart';
import 'theme.dart';

class BusPingApp extends StatelessWidget {
  const BusPingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BusPing',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
