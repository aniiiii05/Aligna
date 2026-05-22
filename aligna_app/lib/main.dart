import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/aligna_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: AlignaApp()));
}

class AlignaApp extends ConsumerStatefulWidget {
  const AlignaApp({super.key});

  @override
  ConsumerState<AlignaApp> createState() => _AlignaAppState();
}

class _AlignaAppState extends ConsumerState<AlignaApp> {
  final _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _listenDeepLinks());
  }

  Future<void> _listenDeepLinks() async {
    final initial = await _appLinks.getInitialLink();
    if (initial != null) _handleUri(initial);

    _appLinks.uriLinkStream.listen((uri) => _handleUri(uri));
  }

  void _handleUri(Uri uri) {
    if (!uri.path.contains('auth/callback')) return;
    final router = ref.read(routerProvider);
    router.go(uri.path + (uri.hasQuery ? '?${uri.query}' : ''));
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Aligna',
      debugShowCheckedModeBanner: false,
      theme: buildAlignaTheme(),
      routerConfig: router,
    );
  }
}
