import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

final authServiceProvider = FutureProvider<AuthService>((ref) async {
  return AuthService.create();
});

final apiClientProvider = FutureProvider<ApiClient>((ref) async {
  final auth = await ref.watch(authServiceProvider.future);
  return auth.api;
});

final authUserProvider = FutureProvider<AlignaUser?>((ref) async {
  final auth = await ref.watch(authServiceProvider.future);
  return auth.fetchMe();
});
