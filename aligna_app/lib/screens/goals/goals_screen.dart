import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/aligna_theme.dart';
import '../../data/techniques_data.dart';
import '../../models/goal.dart';
import '../../providers/app_providers.dart';

class GoalsScreen extends ConsumerStatefulWidget {
  const GoalsScreen({super.key});

  @override
  ConsumerState<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends ConsumerState<GoalsScreen> {
  List<Goal> _goals = [];
  bool _loading = true;
  String _techniqueId = '369';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final api = await ref.read(apiClientProvider.future);
      final res = await api.get('/goals');
      setState(() {
        _goals = (res as List).map((e) => Goal.fromJson(e as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _createGoal() async {
    final titleCtrl = TextEditingController();
    final affCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New intention'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title')),
            const SizedBox(height: 8),
            TextField(controller: affCtrl, decoration: const InputDecoration(labelText: 'Affirmation'), maxLines: 3),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _techniqueId,
              decoration: const InputDecoration(labelText: 'Technique'),
              items: techniques
                  .map((t) => DropdownMenuItem(value: t.id, child: Text(t.name)))
                  .toList(),
              onChanged: (v) => setState(() => _techniqueId = v ?? '369'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Create')),
        ],
      ),
    );

    if (ok != true) return;

    try {
      final api = await ref.read(apiClientProvider.future);
      await api.post('/goals', body: {
        'title': titleCtrl.text.trim(),
        'affirmation': affCtrl.text.trim(),
        'category': 'general',
        'technique_id': _techniqueId,
      });
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AlignaColors.primary));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Goals')),
      floatingActionButton: FloatingActionButton(
        onPressed: _createGoal,
        backgroundColor: AlignaColors.primary,
        child: const Icon(Icons.add),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        itemCount: _goals.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final g = _goals[i];
          final t = techniqueForId(g.techniqueId);
          return Card(
            child: ListTile(
              title: Text(g.title),
              subtitle: Text('${t.name}\n“${g.affirmation}”'),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}
