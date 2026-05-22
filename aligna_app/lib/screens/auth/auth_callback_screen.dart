import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/aligna_theme.dart';
import '../../providers/app_providers.dart';

class AuthCallbackScreen extends ConsumerStatefulWidget {
  final Map<String, String> query;

  const AuthCallbackScreen({super.key, required this.query});

  @override
  ConsumerState<AuthCallbackScreen> createState() => _AuthCallbackScreenState();
}

class _AuthCallbackScreenState extends ConsumerState<AuthCallbackScreen> {
  @override
  void initState() {
    super.initState();
    _handle();
  }

  Future<void> _handle() async {
    final error = widget.query['error'];
    if (error != null && error.isNotEmpty) {
      if (mounted) context.go('/login');
      return;
    }

    final token = widget.query['token'];
    if (token != null && token.isNotEmpty) {
      final auth = await ref.read(authServiceProvider.future);
      await auth.saveToken(token);
      ref.invalidate(authUserProvider);
    }

    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AlignaColors.bg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AlignaColors.primary),
            SizedBox(height: 12),
            Text('Signing you in...', style: TextStyle(color: AlignaColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
