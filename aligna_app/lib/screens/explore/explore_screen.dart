import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/aligna_theme.dart';
import '../../data/techniques_data.dart';

class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Explore')),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        itemCount: techniques.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final t = techniques[i];
          return Card(
            child: ListTile(
              title: Text(t.name),
              subtitle: Text('${t.tagline}\n${t.duration} · ${t.difficulty}'),
              isThreeLine: true,
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.go('/goals'),
            ),
          );
        },
      ),
    );
  }
}
