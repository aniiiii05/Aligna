import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/aligna_theme.dart';
import '../../providers/app_providers.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AlignaColors.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.spa_outlined, size: 72, color: AlignaColors.primary),
              const SizedBox(height: 16),
              Text(
                'Aligna',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AlignaColors.text,
                    ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your complete manifestation practice',
                textAlign: TextAlign.center,
                style: TextStyle(color: AlignaColors.textSecondary),
              ),
              const Spacer(),
              FilledButton(
                onPressed: () async {
                  final auth = await ref.read(authServiceProvider.future);
                  final uri = Uri.parse(auth.googleLoginUrl);
                  await launchUrl(
                    uri,
                    mode: kIsWeb ? LaunchMode.platformDefault : LaunchMode.externalApplication,
                  );
                },
                child: const Text('Continue with Google'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
