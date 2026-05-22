import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/aligna_theme.dart';
import '../../providers/app_providers.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authUserProvider).asData?.value;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          Card(
            child: ListTile(
              leading: CircleAvatar(child: Text((user?.name.isNotEmpty == true ? user!.name[0] : 'A').toUpperCase())),
              title: Text(user?.name ?? 'User'),
              subtitle: Text(user?.email ?? ''),
              trailing: Chip(label: Text(user?.plan ?? 'free')),
            ),
          ),
          const SizedBox(height: 12),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Sign out'),
            onTap: () async {
              final auth = await ref.read(authServiceProvider.future);
              await auth.logout();
              ref.invalidate(authUserProvider);
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}
