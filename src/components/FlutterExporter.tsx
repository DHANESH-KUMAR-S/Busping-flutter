/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Folder, File, Copy, Check, Download, ExternalLink } from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  content: string;
}

interface FolderNode {
  name: string;
  files?: FileNode[];
  folders?: FolderNode[];
}

export default function FlutterExporter() {
  const [copied, setCopied] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState("pubspec.yaml");

  // Flutter Codebase files representation for easy browser viewing
  const fileRegistry: { [key: string]: { name: string; lang: string; code: string } } = {
    "pubspec.yaml": {
      name: "pubspec.yaml",
      lang: "yaml",
      code: `name: busping
description: A modern real-time school bus tracking platform.
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_map: ^6.1.0
  latlong2: ^0.9.1
  geolocator: ^10.1.0
  permission_handler: ^11.0.1
  shared_preferences: ^2.2.2
  go_router: ^12.1.3
  provider: ^6.1.1
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.3
  firebase_database: ^10.3.7
  http: ^1.1.0
  lucide_icons: ^0.301.0
  cupertino_icons: ^1.0.6`
    },
    "lib/main.dart": {
      name: "main.dart",
      lang: "dart",
      code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase Config omitted or error: \$e');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const BusPingApp(),
    ),
  );
}`
    },
    "lib/app.dart": {
      name: "app.dart",
      lang: "dart",
      code: `import 'package:flutter/material.dart';
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
}`
    },
    "lib/router.dart": {
      name: "router.dart",
      lang: "dart",
      code: `import 'package:flutter/material.dart';
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

    if (state.matchedLocation == '/loading') return null;
    if (isLoading) return null;

    if (!loggedIn) {
      if (state.matchedLocation != '/login') return '/login';
      return null;
    }

    if (role.isEmpty) {
      if (state.matchedLocation != '/role_selection') return '/role_selection';
      return null;
    }

    if (!profileCompleted) {
      if (state.matchedLocation != '/profile_setup') return '/profile_setup';
      return null;
    }

    if (state.matchedLocation == '/login' ||
        state.matchedLocation == '/role_selection' ||
        state.matchedLocation == '/profile_setup' ||
        state.matchedLocation == '/loading') {
      return role == 'driver' ? '/driver_home' : '/student_home';
    }

    return null;
  },
  routes: <RouteBase>[
    GoRoute(path: '/loading', builder: (_, __) => const LoadingScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/role_selection', builder: (_, __) => const RoleSelectionScreen()),
    GoRoute(path: '/profile_setup', builder: (_, __) => const ProfileSetupScreen()),
    GoRoute(path: '/driver_home', builder: (_, __) => const DriverHomeScreen()),
    GoRoute(path: '/student_home', builder: (_, __) => const StudentHomeScreen()),
  ],
);`
    },
    "lib/theme.dart": {
      name: "theme.dart",
      lang: "dart",
      code: `import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryBlue = Color(0xFF2196F3);
  static const Color backgroundGrey = Color(0xFFF5F5F5);
  static const Color customGreen = Color(0xFF4CAF50);
  static const Color customRed = Color(0xFFF44336);
  static const Color customOrange = Color(0xFFFF7043);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: primaryBlue,
      scaffoldBackgroundColor: backgroundGrey,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        background: backgroundGrey,
        surface: Colors.white,
      ),
      cardTheme: CardTheme(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 54),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}`
    },
    "lib/core/models/user_model.dart": {
      name: "user_model.dart",
      lang: "dart",
      code: `class UserModel {
  final String uid;
  final String email;
  final String role;
  final bool profileCompleted;
  final String name;
  final String phoneNumber;
  final String busNumber;
  final String driverLicense;
  final String busPlateNumber;
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
}`
    }
  };

  const handleCopy = () => {
    const codeText = fileRegistry[selectedFilePath]?.code || "";
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[620px] shadow-2xl" id="flutter-exporter">
      
      {/* Sidebar Explorer */}
      <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between select-none">
        <div>
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-xs font-extrabold text-white tracking-wide uppercase">Flutter SDK</p>
              <p className="text-[10px] text-slate-500 font-mono font-bold">Project: busping</p>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest pl-2 mb-2">Workspace</p>
            
            {/* Root items */}
            <button
              onClick={() => setSelectedFilePath("pubspec.yaml")}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                selectedFilePath === "pubspec.yaml" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <File className="w-3.5 h-3.5" />
              <span>pubspec.yaml</span>
            </button>

            {/* lib Folder header */}
            <div className="pt-2 px-3 flex items-center space-x-2 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              <Folder className="w-3 h-3" />
              <span>lib /</span>
            </div>

            {/* Folder items */}
            <div className="pl-4 space-y-1">
              {Object.keys(fileRegistry)
                .filter((p) => p !== "pubspec.yaml")
                .map((path) => (
                  <button
                    key={path}
                    onClick={() => setSelectedFilePath(path)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all truncate ${
                      selectedFilePath === path ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <File className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{path.replace("lib/", "")}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer actions inside sidebar */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <div className="p-3 bg-blue-950/40 border border-blue-900/30 rounded-2xl">
            <p className="text-[9px] font-extrabold text-blue-400 font-mono uppercase tracking-widest leading-none">Ready To Build</p>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-semibold">
              The full Flutter workspace is written to <code className="text-blue-300 font-mono">/flutter_project</code> on disk.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-grow flex flex-col bg-slate-900 overflow-hidden relative">
        {/* Editor Title Bar */}
        <div className="h-12 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center px-5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-500">Path:</span>
            <span className="text-xs font-mono font-bold text-blue-400">{selectedFilePath}</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Container */}
        <pre className="flex-grow p-6 overflow-auto text-xs font-mono text-slate-300 bg-slate-950/50 leading-relaxed scrollbar-thin select-text">
          <code>{fileRegistry[selectedFilePath]?.code || ""}</code>
        </pre>
      </div>
    </div>
  );
}
