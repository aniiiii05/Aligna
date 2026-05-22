class RitualEntry {
  final String goalId;
  final String sessionType;

  const RitualEntry({required this.goalId, required this.sessionType});

  factory RitualEntry.fromJson(Map<String, dynamic> json) {
    return RitualEntry(
      goalId: json['goal_id'] as String? ?? '',
      sessionType: json['session_type'] as String? ?? '',
    );
  }
}
