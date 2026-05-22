import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String productionOrigin = 'https://alignaa.org';

  /// Web uses same-origin `/api` (Vercel). Mobile/desktop builds use production by default.
  static String get apiBase {
    const override = String.fromEnvironment('API_BASE');
    if (override.isNotEmpty) return override;
    if (kIsWeb) return '/api';
    return '$productionOrigin/api';
  }

  static String get appOrigin {
    const override = String.fromEnvironment('APP_ORIGIN');
    if (override.isNotEmpty) return override;
    if (kIsWeb) {
      return Uri.base.origin.isNotEmpty ? Uri.base.origin : productionOrigin;
    }
    return productionOrigin;
  }

  static String googleLoginUrl({String? returnPath}) {
    final path = returnPath ?? '/auth/callback';
    return '$apiBase/auth/google/login?return_path=${Uri.encodeComponent(path)}';
  }
}
