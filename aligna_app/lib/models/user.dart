class AlignaUser {
  final String userId;
  final String email;
  final String name;
  final String picture;
  final String plan;

  const AlignaUser({
    required this.userId,
    required this.email,
    required this.name,
    required this.picture,
    required this.plan,
  });

  factory AlignaUser.fromJson(Map<String, dynamic> json) {
    return AlignaUser(
      userId: json['user_id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      picture: json['picture'] as String? ?? '',
      plan: json['plan'] as String? ?? 'free',
    );
  }
}
