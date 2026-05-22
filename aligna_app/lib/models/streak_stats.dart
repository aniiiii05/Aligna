class StreakStats {
  final int streak;
  final int longestStreak;
  final int totalDays;

  const StreakStats({
    required this.streak,
    required this.longestStreak,
    required this.totalDays,
  });

  factory StreakStats.fromJson(Map<String, dynamic> json) {
    return StreakStats(
      streak: json['streak'] as int? ?? 0,
      longestStreak: json['longest_streak'] as int? ?? 0,
      totalDays: json['total_days'] as int? ?? 0,
    );
  }
}
