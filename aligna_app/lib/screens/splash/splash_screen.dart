import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/aligna_theme.dart';
import '../../providers/app_providers.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const Scaffold(
      backgroundColor: AlignaColors.bg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.spa_outlined, size: 56, color: AlignaColors.primary),
            SizedBox(height: 16),
            Text('Aligna', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600)),
            SizedBox(height: 8),
            CircularProgressIndicator(color: AlignaColors.primary),
          ],
        ),
      ),
    );
  }
}
