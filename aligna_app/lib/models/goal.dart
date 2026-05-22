class Goal {
  final String goalId;
  final String title;
  final String affirmation;
  final String category;
  final String techniqueId;
  final bool isActive;

  const Goal({
    required this.goalId,
    required this.title,
    required this.affirmation,
    required this.category,
    required this.techniqueId,
    required this.isActive,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      goalId: json['goal_id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      affirmation: json['affirmation'] as String? ?? '',
      category: json['category'] as String? ?? 'general',
      techniqueId: json['technique_id'] as String? ?? '369',
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'title': title,
        'affirmation': affirmation,
        'category': category,
        'technique_id': techniqueId,
      };
}
