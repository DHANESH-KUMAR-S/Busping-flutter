/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart';
import 'features/loading/loading_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/role_selection_screen.dart';
import 'features/auth/profile_setup_screen.dart';
import 'features/driver/driver_home_screen.dart';
import 'features/student/student_home_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/loading',
  redirect: (BuildContext context, GoRouterState state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final bool loggedIn = authProvider.user != null;
    final bool isLoading = authProvider.isLoading;
    final String role = authProvider.role;
    final bool profileCompleted = authProvider.profileCompleted;

    // 1. Loading Screen is a hard stop at startup
    if (state.matchedLocation == '/loading') {
      return null;
    }

    if (isLoading) return null;

    // 2. If not logged in, force Login screen
    if (!loggedIn) {
      if (state.matchedLocation != '/login') {
        return '/login';
      }
      return null;
    }

    // 3. If logged in but role not selected
    if (role.isEmpty) {
      if (state.matchedLocation != '/role_selection') {
        return '/role_selection';
      }
      return null;
    }

    // 4. If role selected but profile setup incomplete
    if (!profileCompleted) {
      if (state.matchedLocation != '/profile_setup') {
        return '/profile_setup';
      }
      return null;
    }

    // 5. If profile completed, route to respective dashboard
    if (state.matchedLocation == '/login' ||
        state.matchedLocation == '/role_selection' ||
        state.matchedLocation == '/profile_setup' ||
        state.matchedLocation == '/loading') {
      return role == 'driver' ? '/driver_home' : '/student_home';
    }

    return null;
  },
  routes: <RouteBase>[
    GoRoute(
      path: '/loading',
      builder: (BuildContext context, GoRouterState state) {
        return const LoadingScreen();
      },
    ),
    GoRoute(
      path: '/login',
      builder: (BuildContext context, GoRouterState state) {
        return const LoginScreen();
      },
    ),
    GoRoute(
      path: '/role_selection',
      builder: (BuildContext context, GoRouterState state) {
        return const RoleSelectionScreen();
      },
    ),
    GoRoute(
      path: '/profile_setup',
      builder: (BuildContext context, GoRouterState state) {
        return const ProfileSetupScreen();
      },
    ),
    GoRoute(
      path: '/driver_home',
      builder: (BuildContext context, GoRouterState state) {
        return const DriverHomeScreen();
      },
    ),
    GoRoute(
      path: '/student_home',
      builder: (BuildContext context, GoRouterState state) {
        return const StudentHomeScreen();
      },
    ),
  ],
);
