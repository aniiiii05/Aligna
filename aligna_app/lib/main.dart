import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
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
  AppLinks? _appLinks;

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      _appLinks = AppLinks();
      WidgetsBinding.instance.addPostFrameCallback((_) => _listenDeepLinks());
    }
  }

  Future<void> _listenDeepLinks() async {
    final links = _appLinks;
    if (links == null) return;

    final initial = await links.getInitialLink();
    if (initial != null) _handleUri(initial);

    links.uriLinkStream.listen(_handleUri);
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
