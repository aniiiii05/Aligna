import 'package:shared_preferences/shared_preferences.dart';

import '../core/config/api_config.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  static const _tokenKey = 'aligna_session';

  final ApiClient _api;
  ApiClient get api => _api;

  AuthService(this._api);

  static Future<AuthService> create() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final api = ApiClient(token: token);
    return AuthService(api);
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    _api.setToken(token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    _api.setToken(null);
  }

  Future<String?> readToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  String get googleLoginUrl => ApiConfig.googleLoginUrl();

  Future<AlignaUser?> fetchMe() async {
    try {
      final data = await _api.get('/auth/me');
      if (data is Map<String, dynamic>) return AlignaUser.fromJson(data);
      return null;
    } on ApiException catch (e) {
      if (e.statusCode == 401) return null;
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {}
    await clearToken();
  }
}
