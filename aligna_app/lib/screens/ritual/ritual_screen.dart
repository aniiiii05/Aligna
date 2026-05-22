import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/aligna_theme.dart';
import '../../data/techniques_data.dart';
import '../../models/goal.dart';
import '../../providers/app_providers.dart';

class RitualScreen extends ConsumerStatefulWidget {
  final Object? extra;

  const RitualScreen({super.key, this.extra});

  @override
  ConsumerState<RitualScreen> createState() => _RitualScreenState();
}

class _RitualScreenState extends ConsumerState<RitualScreen> {
  List<Goal> _goals = [];
  String? _goalId;
  String? _sessionId;
  final List<String> _writings = [];
  final _input = TextEditingController();
  final _freeform = TextEditingController();
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final map = widget.extra is Map ? widget.extra as Map : null;
    _goalId = map?['goalId'] as String?;
    _sessionId = map?['session'] as String?;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final api = await ref.read(apiClientProvider.future);
      final res = await api.get('/goals');
      final goals = (res as List).map((e) => Goal.fromJson(e as Map<String, dynamic>)).toList();
      setState(() {
        _goals = goals;
        _goalId ??= goals.isNotEmpty ? goals.first.goalId : null;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Goal? get _goal {
    for (final g in _goals) {
      if (g.goalId == _goalId) return g;
    }
    return null;
  }
  Technique get _technique => techniqueForId(_goal?.techniqueId);
  TechniqueSession get _session {
    final sessions = _technique.sessions;
    if (_sessionId != null) {
      return sessions.firstWhere((s) => s.id == _sessionId, orElse: () => sessions.first);
    }
    return sessions.first;
  }

  Future<void> _submit() async {
    if (_goal == null) return;
    setState(() => _submitting = true);
    try {
      final api = await ref.read(apiClientProvider.future);
      final session = _session;
      List<String> writings;
      if (session.type == 'freeform') {
        writings = [_freeform.text.trim()];
      } else {
        writings = List<String>.from(_writings);
      }
      await api.post('/rituals/entry', body: {
        'goal_id': _goal!.goalId,
        'session_type': session.id,
        'writings': writings,
        'local_date': DateTime.now().toIso8601String().split('T').first,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ritual complete')));
        setState(() {
          _writings.clear();
          _input.clear();
          _freeform.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _addWriting() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _writings.add(text);
      _input.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AlignaColors.primary));
    }

    if (_goals.isEmpty) {
      return const Center(child: Text('Create a goal first'));
    }

    final session = _session;
    final required = session.type == 'freeform' ? 1 : session.count;
    final done = session.type == 'freeform'
        ? (_freeform.text.trim().isNotEmpty ? 1 : 0)
        : _writings.length;

    return Scaffold(
      appBar: AppBar(title: const Text('Ritual')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          DropdownButtonFormField<String>(
            value: _goalId,
            decoration: const InputDecoration(labelText: 'Intention'),
            items: _goals.map((g) => DropdownMenuItem(value: g.goalId, child: Text(g.title))).toList(),
            onChanged: (v) => setState(() => _goalId = v),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: session.id,
            decoration: const InputDecoration(labelText: 'Session'),
            items: _technique.sessions
                .map((s) => DropdownMenuItem(value: s.id, child: Text(s.label)))
                .toList(),
            onChanged: (v) => setState(() => _sessionId = v),
          ),
          const SizedBox(height: 12),
          Text(session.prompt, style: const TextStyle(color: AlignaColors.textSecondary)),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: done / required, color: AlignaColors.primary),
          const SizedBox(height: 12),
          if (session.type == 'freeform')
            TextField(controller: _freeform, maxLines: 8, decoration: const InputDecoration(hintText: 'Write here...'))
          else ...[
            TextField(
              controller: _input,
              decoration: InputDecoration(hintText: 'Affirmation ${done + 1} of $required'),
              onSubmitted: (_) => _addWriting(),
            ),
            const SizedBox(height: 8),
            ..._writings.map((w) => ListTile(title: Text('“$w”'))),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting || done < required ? null : _submit,
            child: Text(_submitting ? 'Saving...' : 'Complete session'),
          ),
        ],
      ),
    );
  }
}
