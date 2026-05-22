import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/aligna_theme.dart';
import '../../data/techniques_data.dart';
import '../../models/goal.dart';
import '../../models/ritual_entry.dart';
import '../../models/streak_stats.dart';
import '../../providers/app_providers.dart';
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Goal> _goals = [];
  List<RitualEntry> _today = [];
  StreakStats? _streak;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final api = await ref.read(apiClientProvider.future);
      final goalsRes = await api.get('/goals');
      final streakRes = await api.get('/progress/streak');
      final goals = (goalsRes as List).map((e) => Goal.fromJson(e as Map<String, dynamic>)).toList();
      List<RitualEntry> today = [];
      if (goals.isNotEmpty) {
        final todayRes = await api.get('/rituals/today');
        today = (todayRes as List).map((e) => RitualEntry.fromJson(e as Map<String, dynamic>)).toList();
      }
      setState(() {
        _goals = goals;
        _today = today;
        _streak = StreakStats.fromJson(streakRes as Map<String, dynamic>);
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authUserProvider).asData?.value;
    final featured = _goals.isNotEmpty ? _goals.first : null;
    final technique = techniqueForId(featured?.techniqueId);

    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AlignaColors.primary));
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Good day,', style: TextStyle(color: AlignaColors.textSecondary)),
                    Text(
                      user?.name.split(' ').first ?? 'friend',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ],
                ),
              ),
              IconButton(onPressed: () => context.go('/settings'), icon: const Icon(Icons.settings_outlined)),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.local_fire_department, color: AlignaColors.accent),
                  const SizedBox(width: 12),
                  Text('${_streak?.streak ?? 0} day streak', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (featured == null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text('Set your first intention'),
                    const SizedBox(height: 12),
                    FilledButton(onPressed: () => context.go('/goals'), child: const Text('Create a Goal')),
                  ],
                ),
              ),
            )
          else ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Today's intention", style: TextStyle(color: AlignaColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 6),
                    Text(featured.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
                    Text('“${featured.affirmation}”', style: const TextStyle(fontStyle: FontStyle.italic, color: AlignaColors.textSecondary)),
                    const SizedBox(height: 8),
                    Text(technique.name, style: const TextStyle(fontSize: 12, color: AlignaColors.textSecondary)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => context.go('/ritual', extra: {'goalId': featured.goalId}),
              child: const Text('Begin ritual'),
            ),
          ],
        ],
      ),
    );
  }
}
