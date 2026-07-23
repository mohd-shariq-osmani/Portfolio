import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_session.dart';
import '../models/workflow.dart';
import '../models/execution.dart';
import '../services/n8n_api_service.dart';

class N8nRepository {
  final N8nApiService _apiService;
  UserSession? _currentSession;

  static const String _sessionKey = 'n8n_user_session';

  N8nRepository({required N8nApiService apiService}) : _apiService = apiService;

  UserSession? get currentSession => _currentSession;
  bool get isAuthenticated => _currentSession != null;

  // Load session from SharedPreferences
  Future<UserSession?> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_sessionKey);
    if (jsonStr != null) {
      try {
        final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
        _currentSession = UserSession.fromJson(decoded);
        return _currentSession;
      } catch (_) {
        // Clear corrupt session data
        await clearSession();
      }
    }
    return null;
  }

  // Save session to SharedPreferences
  Future<void> _saveSession(UserSession session) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = jsonEncode(session.toJson());
    await prefs.setString(_sessionKey, jsonStr);
    _currentSession = session;
  }

  // Clear session (Log Out)
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    _currentSession = null;
  }

  // Authenticate and save session
  Future<UserSession> login(String url, String email, String password) async {
    final session = await _apiService.login(url, email, password);
    await _saveSession(session);
    return session;
  }

  // Get all workflows
  Future<List<Workflow>> getWorkflows() async {
    if (_currentSession == null) {
      throw Exception('User is not authenticated.');
    }
    return _apiService.fetchWorkflows(_currentSession!);
  }

  // Get single workflow detailed structure (with nodes)
  Future<Workflow> getWorkflow(String id) async {
    if (_currentSession == null) {
      throw Exception('User is not authenticated.');
    }
    return _apiService.fetchWorkflow(_currentSession!, id);
  }

  // Get execution logs
  Future<List<Execution>> getExecutions({int limit = 50}) async {
    if (_currentSession == null) {
      throw Exception('User is not authenticated.');
    }
    return _apiService.fetchExecutions(_currentSession!, limit: limit);
  }

  // Toggle active status
  Future<void> toggleWorkflow(String id, bool active) async {
    if (_currentSession == null) {
      throw Exception('User is not authenticated.');
    }
    await _apiService.toggleWorkflowActive(_currentSession!, id, active);
  }

  // Run a workflow manually
  Future<void> runWorkflow(String id) async {
    if (_currentSession == null) {
      throw Exception('User is not authenticated.');
    }
    await _apiService.runWorkflow(_currentSession!, id);
  }
}
