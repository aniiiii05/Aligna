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
  Technique(
    id: 'two-cup',
    name: 'Two Cup Method',
    tagline: 'Quantum-jump to your desired reality',
    duration: '7 days',
    difficulty: 'Advanced',
    sessions: [
      TechniqueSession(id: 'from', label: 'Current Reality', count: 1, type: 'freeform', subtitle: 'Acknowledge where you are', prompt: 'Describe your current reality honestly. This is the cup you are pouring FROM.'),
      TechniqueSession(id: 'to', label: 'Desired Reality', count: 1, type: 'freeform', subtitle: 'Step into your new reality', prompt: 'Describe your desired reality in vivid detail as if it is already true. This is the cup you are pouring INTO.'),
    ],
  ),
  Technique(
    id: 'mirror-work',
    name: 'Mirror Work',
    tagline: 'Love yourself into alignment',
    duration: '21 days',
    difficulty: 'Advanced',
    sessions: [
      TechniqueSession(id: 'morning', label: 'Morning Mirror', count: 5, type: 'repetition', subtitle: 'Begin as your highest self', prompt: "Write your 'I am' affirmation 5 times while looking at yourself with love."),
      TechniqueSession(id: 'midday', label: 'Midday Mirror', count: 5, type: 'repetition', subtitle: 'Reaffirm your worth', prompt: 'Write your affirmation 5 times — let your midday self receive the same love.'),
      TechniqueSession(id: 'night', label: 'Evening Mirror', count: 5, type: 'repetition', subtitle: 'Close in self-love', prompt: "Write 5 times, then say aloud: 'I love you. I am proud of you.'"),
    ],
  ),
  Technique(
    id: 'future-self',
    name: 'Future Self Letter',
    tagline: 'A message from who you are becoming',
    duration: '7 days',
    difficulty: 'Intermediate',
    sessions: [
      TechniqueSession(id: 'daily', label: 'Future Self Letter', count: 1, type: 'freeform', subtitle: 'Hear from your future self', prompt: "Begin: 'Dear [your name], I am writing to you from a future date where everything has worked out...' Share guidance for today."),
    ],
  ),
  Technique(
    id: 'affirmation-stacking',
    name: 'Affirmation Stacking',
    tagline: 'Build a ladder from doubt to certainty',
    duration: '21 days',
    difficulty: 'Advanced',
    sessions: [
      TechniqueSession(id: 'morning', label: 'Morning Stack', count: 5, type: 'list', subtitle: 'Climb your belief ladder', prompt: 'Write 5 progressive affirmations — start with openness and climb to bold certainty.'),
      TechniqueSession(id: 'night', label: 'Evening Stack', count: 5, type: 'list', subtitle: 'Reinforce every rung', prompt: 'Repeat your 5-affirmation stack. Notice which rungs feel more natural today.'),
    ],
  ),
];

final techniqueById = {for (final t in techniques) t.id: t};

Technique techniqueForId(String? id) => techniqueById[id] ?? techniqueById['369']!;
