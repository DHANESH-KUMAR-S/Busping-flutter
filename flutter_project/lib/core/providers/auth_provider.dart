/// @license
/// SPDX-License-Identifier: Apache-2.0

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  UserModel? _user;
  bool _isLoading = true;
  StreamSubscription<User?>? _authSubscription;
  StreamSubscription<DocumentSnapshot>? _profileSubscription;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get profileCompleted => _user?.profileCompleted ?? false;
  String get role => _user?.role ?? '';

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();

    // Load locally cached user if offline or starting fast
    await _loadCachedUser();

    _authSubscription = _auth.authStateChanges().listen((User? firebaseUser) {
      if (firebaseUser == null) {
        _user = null;
        _isLoading = false;
        _profileSubscription?.cancel();
        _clearCachedUser();
        notifyListeners();
      } else {
        _listenToProfile(firebaseUser);
      }
    });
  }

  void _listenToProfile(User firebaseUser) {
    _profileSubscription?.cancel();
    _profileSubscription = _firestore
        .collection('users')
        .doc(firebaseUser.uid)
        .snapshots()
        .listen((DocumentSnapshot snapshot) async {
      if (snapshot.exists) {
        final data = snapshot.data() as Map<String, dynamic>;
        _user = UserModel.fromMap(data, firebaseUser.uid);
      } else {
        // Doc doesn't exist yet, setup placeholder
        _user = UserModel(
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
        );
        // Create initial placeholder doc in firestore
        await _firestore.collection('users').doc(firebaseUser.uid).set({
          'email': firebaseUser.email ?? '',
          'profileCompleted': false,
          'role': '',
        }, SetOptions(merge: true));
      }
      
      _isLoading = false;
      _cacheUserLocally();
      notifyListeners();
    }, onError: (err) {
      // Offline fallback: load from Cache if Firestore stream fails
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signup(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _auth.createUserWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    await _profileSubscription?.cancel();
    await _auth.signOut();
    _user = null;
    await _clearCachedUser();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> setRole(String selectedRole) async {
    if (_user == null) return;
    _isLoading = true;
    notifyListeners();

    try {
      await _firestore.collection('users').doc(_user!.uid).update({
        'role': selectedRole,
      });
      _user = _user!.copyWith(role: selectedRole);
      await _cacheUserLocally();
    } catch (e) {
      // Fallback update
      _user = _user!.copyWith(role: selectedRole);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveProfile(UserModel updatedUser) async {
    if (_user == null) return;
    _isLoading = true;
    notifyListeners();

    try {
      final updatedData = updatedUser.toMap();
      updatedData['profileCompleted'] = true;

      await _firestore.collection('users').doc(_user!.uid).set(updatedData, SetOptions(merge: true));
      _user = updatedUser.copyWith(profileCompleted: true);
      await _cacheUserLocally();
    } catch (e) {
      // Offline support: local cache update
      _user = updatedUser.copyWith(profileCompleted: true);
      await _cacheUserLocally();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _cacheUserLocally() async {
    if (_user == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cached_user', jsonEncode(_user!.toMap()));
  }

  Future<void> _loadCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedData = prefs.getString('cached_user');
    if (cachedData != null) {
      try {
        final decoded = jsonDecode(cachedData) as Map<String, dynamic>;
        _user = UserModel.fromMap(decoded, decoded['uid'] ?? '');
      } catch (e) {
        // Catch parsing errors
      }
    }
  }

  Future<void> _clearCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('cached_user');
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    _profileSubscription?.cancel();
    super.dispose();
  }
}
