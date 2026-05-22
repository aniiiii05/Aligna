import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/api_config.dart';
import '../../core/theme/aligna_theme.dart';
import '../../providers/app_providers.dart';

class _Plan {
  final String id;
  final String name;
  final String price;
  final List<String> features;
  final String cta;

  const _Plan({
    required this.id,
    required this.name,
    required this.price,
    required this.features,
    required this.cta,
  });
}

const _plans = [
  _Plan(id: 'free', name: 'Seed', price: '\$0', features: ['1 goal', '3-6-9 ritual', 'Streak tracking'], cta: 'Current plan'),
  _Plan(id: 'pro', name: 'Bloom', price: '\$9.99/mo', features: ['3 goals', 'All Seed features', 'Priority support'], cta: 'Upgrade to Bloom'),
  _Plan(id: 'premium', name: 'Radiance', price: '\$19.99/mo', features: ['10 goals', 'All Bloom features', 'Early access'], cta: 'Upgrade to Radiance'),
];

class UpgradeScreen extends ConsumerStatefulWidget {
  const UpgradeScreen({super.key});

  @override
  ConsumerState<UpgradeScreen> createState() => _UpgradeScreenState();
}

class _UpgradeScreenState extends ConsumerState<UpgradeScreen> {
  String? _loadingPlan;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybePollAfterCheckout());
  }

  Future<void> _maybePollAfterCheckout() async {
    final checkout = GoRouterState.of(context).uri.queryParameters['checkout'];
    if (checkout != 'success') return;
    for (var i = 0; i < 15; i++) {
      await Future.delayed(const Duration(seconds: 2));
      ref.invalidate(authUserProvider);
      final user = ref.read(authUserProvider).asData?.value;
      if (user != null && user.plan != 'free') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Your plan was updated. Welcome!')),
          );
        }
        return;
      }
    }
    if (mounted) {
      setState(() => _error = 'Payment may still be processing. Refresh in a moment.');
    }
  }

  Future<void> _checkout(String planId) async {
    final user = ref.read(authUserProvider).asData?.value;
    if (planId == 'free' || planId == user?.plan) return;

    setState(() {
      _loadingPlan = planId;
      _error = null;
    });

    try {
      final auth = await ref.read(authServiceProvider.future);
      final data = await auth.api.post('/payments/checkout', body: {
        'plan': planId,
        'origin_url': ApiConfig.appOrigin,
      });
      final url = data is Map ? data['url']?.toString() : null;
      if (url == null || url.isEmpty) throw Exception('No checkout URL returned');
      final uri = Uri.parse(url);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw Exception('Could not open checkout');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loadingPlan = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authUserProvider).asData?.value;
    final current = user?.plan ?? 'free';

    return Scaffold(
      appBar: AppBar(title: const Text('Upgrade')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_error!, style: const TextStyle(color: Colors.red)),
            ),
          ..._plans.map((plan) {
            final isCurrent = plan.id == current;
            final loading = _loadingPlan == plan.id;
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(plan.name, style: Theme.of(context).textTheme.titleLarge),
                    Text(plan.price, style: const TextStyle(color: AlignaColors.textSecondary)),
                    const SizedBox(height: 8),
                    ...plan.features.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            children: [
                              const Icon(Icons.check, size: 18, color: AlignaColors.primary),
                              const SizedBox(width: 8),
                              Expanded(child: Text(f)),
                            ],
                          ),
                        )),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: isCurrent || plan.id == 'free' || loading
                            ? null
                            : () => _checkout(plan.id),
                        child: loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(isCurrent ? 'Current plan' : plan.cta),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
