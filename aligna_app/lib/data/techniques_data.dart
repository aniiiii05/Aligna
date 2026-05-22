class TechniqueSession {
  final String id;
  final String label;
  final int count;
  final String type; // repetition | freeform | list
  final String subtitle;
  final String prompt;

  const TechniqueSession({
    required this.id,
    required this.label,
    required this.count,
    required this.type,
    required this.subtitle,
    required this.prompt,
  });
}

class Technique {
  final String id;
  final String name;
  final String tagline;
  final String duration;
  final String difficulty;
  final List<TechniqueSession> sessions;

  const Technique({
    required this.id,
    required this.name,
    required this.tagline,
    required this.duration,
    required this.difficulty,
    required this.sessions,
  });
}

const techniques = <Technique>[
  Technique(
    id: '369',
    name: '3-6-9 Method',
    tagline: "Tesla's sacred numerology",
    duration: '21 days',
    difficulty: 'Beginner',
    sessions: [
      TechniqueSession(id: 'morning', label: 'Morning Ritual', count: 3, type: 'repetition', subtitle: 'Plant intention', prompt: 'Write your affirmation 3 times.'),
      TechniqueSession(id: 'midday', label: 'Midday Ritual', count: 6, type: 'repetition', subtitle: 'Nurture vision', prompt: 'Write your affirmation 6 times.'),
      TechniqueSession(id: 'night', label: 'Evening Ritual', count: 9, type: 'repetition', subtitle: 'Surrender', prompt: 'Write your affirmation 9 times.'),
    ],
  ),
  Technique(
    id: '55x5',
    name: '55×5 Method',
    tagline: 'Immersive repetition',
    duration: '5 days',
    difficulty: 'Intermediate',
    sessions: [
      TechniqueSession(id: 'daily', label: 'Daily Session', count: 55, type: 'repetition', subtitle: 'Flow state', prompt: 'Write your affirmation 55 times with presence.'),
    ],
  ),
  Technique(
    id: 'scripting',
    name: 'Scripting',
    tagline: 'Write your future',
    duration: '30 days',
    difficulty: 'Intermediate',
    sessions: [
      TechniqueSession(id: 'daily', label: 'Daily Scripting', count: 1, type: 'freeform', subtitle: 'Present tense', prompt: 'Write as if your desired reality is already true.'),
    ],
  ),
  Technique(
    id: 'gratitude',
    name: 'Gratitude Practice',
    tagline: 'Attract abundance',
    duration: '21 days',
    difficulty: 'Beginner',
    sessions: [
      TechniqueSession(id: 'morning', label: 'Morning Gratitude', count: 5, type: 'list', subtitle: 'Open with thanks', prompt: 'Write 5 gratitudes.'),
      TechniqueSession(id: 'night', label: 'Evening Gratitude', count: 5, type: 'list', subtitle: 'Close in gratitude', prompt: 'Write 5 more gratitudes.'),
    ],
  ),
  Technique(
    id: 'visualization',
    name: 'Visualization',
    tagline: 'See it, feel it',
    duration: '21 days',
    difficulty: 'Intermediate',
    sessions: [
      TechniqueSession(id: 'daily', label: 'Visualization', count: 1, type: 'freeform', subtitle: 'Sensory detail', prompt: 'Describe your desired reality in vivid present-tense detail.'),
    ],
  ),
  Technique(
    id: 'pillow',
    name: 'Pillow Method',
    tagline: 'Sleep into alignment',
    duration: '7 days',
    difficulty: 'Beginner',
    sessions: [
      TechniqueSession(id: 'night', label: 'Bedtime Ritual', count: 3, type: 'repetition', subtitle: 'Before sleep', prompt: 'Write your affirmation 3 times before sleep.'),
    ],
  ),
];

final techniqueById = {for (final t in techniques) t.id: t};

Technique techniqueForId(String? id) => techniqueById[id] ?? techniqueById['369']!;
