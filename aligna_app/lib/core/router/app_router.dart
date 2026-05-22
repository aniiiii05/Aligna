import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/app_providers.dart';
import '../../screens/auth/auth_callback_screen.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/explore/explore_screen.dart';
import '../../screens/goals/goals_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/progress/progress_screen.dart';
import '../../screens/ritual/ritual_screen.dart';
import '../../screens/settings/settings_screen.dart';
import '../../screens/shell/main_shell.dart';
import '../../screens/splash/splash_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

class _RouterNotifier extends ChangeNotifier {
  _RouterNotifier(this.ref) {
    ref.listen(authUserProvider, (_, __) => notifyListeners());
  }
  final Ref ref;
}

final _routerNotifierProvider = Provider<_RouterNotifier>((ref) => _RouterNotifier(ref));

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(_routerNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final authState = ref.read(authUserProvider);
      final path = state.uri.path;
      final public = {
        '/splash',
        '/login',
        '/auth/callback',
      };
      if (public.contains(path)) return null;

      final loading = authState.isLoading;
      final user = authState.asData?.value;
      if (loading) return '/splash';
      if (user == null) return '/login';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/auth/callback', builder: (_, state) => AuthCallbackScreen(query: state.uri.queryParameters)),
      ShellRoute(
        builder: (_, __, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/explore', builder: (_, __) => const ExploreScreen()),
          GoRoute(path: '/ritual', builder: (_, state) => RitualScreen(extra: state.extra)),
          GoRoute(path: '/goals', builder: (_, __) => const GoalsScreen()),
          GoRoute(path: '/progress', builder: (_, __) => const ProgressScreen()),
          GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
        ],
      ),
    ],
  );
});
