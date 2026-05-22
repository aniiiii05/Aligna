import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/aligna_theme.dart';
import '../../models/streak_stats.dart';
import '../../providers/app_providers.dart';

class ProgressScreen extends ConsumerStatefulWidget {
  const ProgressScreen({super.key});

  @override
  ConsumerState<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends ConsumerState<ProgressScreen> {
  StreakStats? _streak;
  Map<String, dynamic> _calendar = {};
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
      final streakRes = await api.get('/progress/streak');
      final calRes = await api.get('/progress/calendar');
      setState(() {
        _streak = StreakStats.fromJson(streakRes as Map<String, dynamic>);
        _calendar = Map<String, dynamic>.from(calRes as Map);
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AlignaColors.primary));
    }

    final activeDays = _calendar.entries.where((e) => e.value == true).length;

    return Scaffold(
      appBar: AppBar(title: const Text('Progress')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Current streak: ${_streak?.streak ?? 0} days'),
                  Text('Best: ${_streak?.longestStreak ?? 0} days'),
                  Text('Total active days: ${_streak?.totalDays ?? 0}'),
                  const SizedBox(height: 8),
                  Text('Last 60 days active: $activeDays'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
