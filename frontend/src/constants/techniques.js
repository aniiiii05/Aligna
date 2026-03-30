/**
 * Single source of truth for all manifestation techniques in Aligna.
 * Each technique defines its sessions, which the Ritual and Home pages
 * render dynamically — no hardcoded session lists anywhere else.
 *
 * Session types:
 *   "repetition" — user writes the SAME affirmation N times
 *   "freeform"   — user writes ONE free-form journal entry (count: 1)
 *   "list"       — user writes N DISTINCT items (e.g. 5 gratitudes)
 */

export const TECHNIQUES = [
    {
        id: "369",
        name: "3-6-9 Method",
        tagline: "Tesla's sacred numerology",
        icon: "/assets/icons/Singing Bowl.svg",
        duration: "21 days",
        difficulty: "Beginner",
        category: "repetition",
        color: { card: "from-amber-50 to-orange-50", border: "border-amber-200/60", accent: "#D4A373" },
        description: "The 3-6-9 method harnesses the sacred power of Nikola Tesla's favorite numbers. By writing your affirmation 3 times in the morning, 6 at midday, and 9 in the evening, you align your thoughts with the universe's frequency at every transition point in your day.",
        benefits: [
            "Creates consistent daily alignment across 3 key moments",
            "Anchors your intention at natural energy transitions",
            "Builds powerful momentum through accumulation",
            "The perfect starting point for any manifestation practice",
        ],
        howTo: [
            "Choose one clear, present-tense affirmation (e.g. 'I am wealthy and free')",
            "Morning — write it 3 times before checking your phone or starting your day",
            "Midday — pause and write it 6 times with full focus",
            "Evening — close your day with 9 writings, feeling each one deeply",
            "Repeat for 21 consecutive days without skipping",
        ],
        sessions: [
            { id: "morning", label: "Morning Ritual",   count: 3,  type: "repetition", icon: "/assets/icons/Candle.svg",       subtitle: "Plant the seed of intention",     bg: "bg-amber-50",  accent: "#D4A373", prompt: "Write your affirmation 3 times to set the day's intention. Feel each word." },
            { id: "midday",  label: "Midday Ritual",    count: 6,  type: "repetition", icon: "/assets/icons/Water.svg",        subtitle: "Nurture your vision",             bg: "bg-teal-50",   accent: "#879C93", prompt: "Return to your intention. Write it 6 times — let it grow stronger." },
            { id: "night",   label: "Evening Ritual",   count: 9,  type: "repetition", icon: "/assets/icons/Singing Bowl.svg", subtitle: "Surrender to the universe",        bg: "bg-indigo-50", accent: "#6E7A75", prompt: "Complete the cycle. Write 9 times and fully surrender your desire to the universe." },
        ],
    },
    {
        id: "55x5",
        name: "55×5 Method",
        tagline: "Immersive repetition for rapid alignment",
        icon: "/assets/icons/Mindfulness.svg",
        duration: "5 days",
        difficulty: "Intermediate",
        category: "repetition",
        color: { card: "from-cyan-50 to-teal-50", border: "border-cyan-200/60", accent: "#879C93" },
        description: "Write your desire 55 times in a single focused session, once per day, for 5 consecutive days. The sheer volume of repetition drowns out the voice of doubt and floods your subconscious with your chosen reality. The flow state you enter is the key.",
        benefits: [
            "Rapidly reprograms subconscious beliefs",
            "Induces a deep meditative flow state",
            "Short 5-day commitment with lasting impact",
            "Clears mental resistance through sheer immersion",
        ],
        howTo: [
            "Write a single concise, positive affirmation (keep it short — you'll write it 55 times)",
            "Set aside 15–20 uninterrupted minutes each day",
            "Write all 55 repetitions in one sitting — no pausing, no stopping",
            "Feel the emotion behind each word as your pen moves",
            "Do this once daily for exactly 5 days",
        ],
        sessions: [
            { id: "daily", label: "Daily Session", count: 55, type: "repetition", icon: "/assets/icons/Mindfulness.svg", subtitle: "Enter the manifestation flow", bg: "bg-cyan-50", accent: "#879C93", prompt: "Find your flow — write your affirmation 55 times with full presence. Each repetition deepens the imprint." },
        ],
    },
    {
        id: "scripting",
        name: "Scripting",
        tagline: "Write your future into existence",
        icon: "/assets/icons/Book.svg",
        duration: "30 days",
        difficulty: "Intermediate",
        category: "journaling",
        color: { card: "from-rose-50 to-pink-50", border: "border-rose-200/60", accent: "#C67D6F" },
        description: "Scripting is the art of writing your desired reality as if it has already happened. Like a movie script for your life, you narrate in present tense — capturing what happened, how it felt, and who you've become. Your brain cannot distinguish between a vividly imagined experience and a real one.",
        benefits: [
            "Activates the reticular activating system to find evidence of your desires",
            "Builds a deep emotional connection to your vision",
            "Trains your mind to expect and recognize opportunities",
            "Creates a living record of your entire manifestation journey",
        ],
        howTo: [
            "Open your journal as if you're writing from a future date",
            "Begin: 'Today was incredible. I woke up and...'",
            "Write in present tense about your desired life as if it is already real",
            "Include emotions, sensory details, conversations, and gratitude",
            "Write freely for at least 5 minutes — no editing, no judgment",
        ],
        sessions: [
            { id: "daily", label: "Daily Scripting", count: 1, type: "freeform", icon: "/assets/icons/Book.svg", subtitle: "Write your future now", bg: "bg-rose-50", accent: "#C67D6F", prompt: "Write as if you are already living your dream. Use present tense: describe what happened today in your desired reality, what you felt, who you talked to, and what you are grateful for." },
        ],
    },
    {
        id: "gratitude",
        name: "Gratitude Practice",
        tagline: "Attract more of what you love",
        icon: "/assets/icons/Hamsa.svg",
        duration: "21 days",
        difficulty: "Beginner",
        category: "journaling",
        color: { card: "from-yellow-50 to-amber-50", border: "border-yellow-200/60", accent: "#D4A373" },
        description: "Gratitude is the highest-frequency emotion available to you. By deliberately writing what you're grateful for — including desired things as if they're already real — you shift your vibration and signal to the universe that you are already in abundance.",
        benefits: [
            "Instantly shifts focus from scarcity to abundance",
            "Raises your emotional vibration to the highest level",
            "Scientifically proven to improve wellbeing and optimism",
            "Trains the brain's filter to notice positive evidence",
        ],
        howTo: [
            "Each morning, write 5 genuine gratitudes — start with what you already have",
            "Include at least 1–2 desired things written as if they're already real",
            "Be specific: 'I am grateful for the $10,000 that came to me this month' beats 'I'm grateful for money'",
            "Feel the genuine warmth of gratitude as you write each one",
            "Repeat in the evening to bookend your day in a high vibration",
        ],
        sessions: [
            { id: "morning", label: "Morning Gratitude", count: 5, type: "list", icon: "/assets/icons/Candle.svg",       subtitle: "Open your day with thankfulness", bg: "bg-yellow-50", accent: "#D4A373", prompt: "Write 5 things you are deeply grateful for. Mix current blessings with desired ones written as if they already exist. Feel the warmth of each one." },
            { id: "night",   label: "Evening Gratitude", count: 5, type: "list", icon: "/assets/icons/Singing Bowl.svg", subtitle: "Close your day in high vibration",  bg: "bg-amber-50",  accent: "#D4A373", prompt: "Write 5 more gratitudes to anchor your evening in abundance. Recall the best moments of your day and the blessings already around you." },
        ],
    },
    {
        id: "visualization",
        name: "Visualization Journaling",
        tagline: "See it, feel it, live it",
        icon: "/assets/icons/Ajna.svg",
        duration: "21 days",
        difficulty: "Intermediate",
        category: "visualization",
        color: { card: "from-violet-50 to-purple-50", border: "border-violet-200/60", accent: "#6E7A75" },
        description: "Elite athletes have used visualization for decades — and neuroscience proves it activates the same brain regions as real experience. In visualization journaling, you describe your desired reality in vivid sensory detail, creating neural pathways that guide your subconscious toward your goal.",
        benefits: [
            "Activates the same neural pathways as actually experiencing your goal",
            "Sharpens the clarity and specificity of your vision",
            "Enhances motivation, belief, and emotional expectancy",
            "Creates a mental blueprint your actions naturally follow",
        ],
        howTo: [
            "Sit quietly and close your eyes for 60 seconds",
            "Mentally step into your desired reality and look around",
            "Open your eyes and begin writing: 'I am...' or 'Right now I can see...'",
            "Describe every detail — what you see, hear, feel, smell, and taste",
            "Stay in present tense; you are living it RIGHT NOW, not imagining it",
        ],
        sessions: [
            { id: "daily", label: "Visualization", count: 1, type: "freeform", icon: "/assets/icons/Ajna.svg", subtitle: "See your reality vividly", bg: "bg-violet-50", accent: "#6E7A75", prompt: "Close your eyes for 60 seconds first. Then write: describe your desired reality in vivid sensory detail. What do you see, hear, and feel? Who is with you? Write in present tense as if you are there right now." },
        ],
    },
    {
        id: "two-cup",
        name: "Two Cup Method",
        tagline: "Quantum-jump to your desired reality",
        icon: "/assets/icons/Water.svg",
        duration: "7 days",
        difficulty: "Advanced",
        category: "ritual",
        color: { card: "from-sky-50 to-blue-50", border: "border-sky-200/60", accent: "#879C93" },
        description: "Inspired by quantum mechanics and the observer effect, the Two Cup method invites you to acknowledge your current reality fully, then consciously step into your desired one. By clearly describing both states, you create an energetic bridge between where you are and where you want to be.",
        benefits: [
            "Creates powerful contrast that accelerates desire",
            "Helps release attachment and resistance to current limits",
            "Draws on quantum consciousness principles",
            "The ideal technique for those wanting a specific breakthrough",
        ],
        howTo: [
            "Label two cups of water with your current and desired state",
            "Write a clear, honest description of your current reality — no judgment",
            "Then write your desired reality in rich, specific present-tense detail",
            "Pour the 'current' cup into the 'desired' cup as a symbolic act",
            "Drink it slowly, feeling yourself shift into the new reality",
        ],
        sessions: [
            { id: "from", label: "Current Reality", count: 1, type: "freeform", icon: "/assets/icons/Water.svg",  subtitle: "Acknowledge where you are",    bg: "bg-sky-50",    accent: "#879C93", prompt: "Describe your current reality honestly and without judgment. What is your situation right now regarding this desire? Be specific and clear. This is the cup you are pouring FROM." },
            { id: "to",   label: "Desired Reality", count: 1, type: "freeform", icon: "/assets/icons/Ajna.svg",   subtitle: "Step into your new reality",  bg: "bg-indigo-50", accent: "#6E7A75", prompt: "Now describe your desired reality in vivid, specific detail as if it is already true. How does it feel? What is different? Who are you now? This is the cup you are pouring INTO — step fully into this version of yourself." },
        ],
    },
    {
        id: "pillow",
        name: "Pillow Method",
        tagline: "Sleep your way to your desires",
        icon: "/assets/icons/Equanimity.svg",
        duration: "7 days",
        difficulty: "Beginner",
        category: "repetition",
        color: { card: "from-indigo-50 to-slate-50", border: "border-indigo-200/60", accent: "#6E7A75" },
        description: "The Pillow Method harnesses the hypnagogic state — the 20 minutes before sleep when your subconscious is most receptive to new beliefs. By writing and focusing on your affirmation just before bed, you plant the seed directly into your subconscious mind for overnight processing.",
        benefits: [
            "Leverages the brain's most receptive sleep-entry state",
            "Allows desires to be processed during dreams",
            "Extremely simple — requires just minutes each night",
            "Ideal for beginners or those new to affirmation work",
        ],
        howTo: [
            "Write your affirmation 3 times in your journal just before sleep",
            "Read it back once and feel it as if it's already real",
            "Place your journal or a note under your pillow (symbolic anchor)",
            "Release all effort as you fall asleep — let your subconscious take over",
            "Repeat for 7 consecutive nights without missing a day",
        ],
        sessions: [
            { id: "night", label: "Bedtime Ritual", count: 3, type: "repetition", icon: "/assets/icons/Equanimity.svg", subtitle: "Plant the seed before sleep", bg: "bg-indigo-50", accent: "#6E7A75", prompt: "Write your affirmation 3 times as you prepare for sleep. Feel each word land in your heart — then release all effort and let your subconscious work through the night." },
        ],
    },
    {
        id: "mirror-work",
        name: "Mirror Work",
        tagline: "Love yourself into alignment",
        icon: "/assets/icons/Sahassara.svg",
        duration: "21 days",
        difficulty: "Advanced",
        category: "repetition",
        color: { card: "from-purple-50 to-pink-50", border: "border-purple-200/60", accent: "#8D9B89" },
        description: "Pioneered by Louise Hay, Mirror Work involves speaking and writing 'I am' affirmations while looking at yourself with love. Research shows that self-directed compassion is among the most powerful tools for reprogramming limiting core beliefs about identity and worthiness.",
        benefits: [
            "Builds deep self-love and unconditional self-worth",
            "Rewires identity-level beliefs at the deepest layer",
            "Backed by Louise Hay's decades of transformational research",
            "Directly challenges the inner critic that blocks manifestation",
        ],
        howTo: [
            "Stand before a mirror and make eye contact with yourself",
            "Look into your own eyes with warmth and openness — breathe",
            "Write 'I am...' statements that reflect who you are becoming",
            "If you feel resistance, keep going — discomfort means it's working",
            "Practice three times daily for 21 days: morning, midday, and evening",
        ],
        sessions: [
            { id: "morning", label: "Morning Mirror", count: 5, type: "repetition", icon: "/assets/icons/Candle.svg",       subtitle: "Begin as your highest self",  bg: "bg-purple-50", accent: "#8D9B89", prompt: "Stand before a mirror and write your 'I am' affirmation 5 times while looking at yourself with love. Feel the truth of every word." },
            { id: "midday",  label: "Midday Mirror",  count: 5, type: "repetition", icon: "/assets/icons/Sahassara.svg",    subtitle: "Reaffirm your worth",        bg: "bg-pink-50",   accent: "#8D9B89", prompt: "Return to the mirror. Write your affirmation 5 times — let your midday self receive the same love and recognition as your morning self." },
            { id: "night",   label: "Evening Mirror", count: 5, type: "repetition", icon: "/assets/icons/Equanimity.svg",   subtitle: "Close your day in self-love", bg: "bg-purple-50", accent: "#6E7A75", prompt: "Your final mirror session. Write 5 times with warmth, then say aloud: 'I love you, [your name]. I am proud of you.'" },
        ],
    },
    {
        id: "future-self",
        name: "Future Self Letter",
        tagline: "A message from who you are becoming",
        icon: "/assets/icons/Greeting Card.svg",
        duration: "7 days",
        difficulty: "Intermediate",
        category: "journaling",
        color: { card: "from-emerald-50 to-teal-50", border: "border-emerald-200/60", accent: "#8D9B89" },
        description: "Write a letter to your present self from the future version of you who has already achieved everything you desire. This technique collapses the gap between who you are and who you are becoming — giving your present self clear, emotionally certain guidance from a place of knowing.",
        benefits: [
            "Creates deep emotional certainty about your desired future",
            "Collapses the perceived gap between present and future self",
            "Provides clarity and grounded direction during difficult moments",
            "Builds unshakeable belief through the power of narrative",
        ],
        howTo: [
            "Date your letter 1–5 years in the future",
            "Begin: 'Dear [Your Name], I am writing to you from [future date]...'",
            "Write as your future self who knows everything worked out",
            "Describe your life, how you feel, and the wisdom you want to share",
            "End with encouragement and unconditional love for your present self",
        ],
        sessions: [
            { id: "daily", label: "Future Self Letter", count: 1, type: "freeform", icon: "/assets/icons/Greeting Card.svg", subtitle: "Hear from who you are becoming", bg: "bg-emerald-50", accent: "#8D9B89", prompt: "Begin: 'Dear [your name], I am writing to you from [a future date] where everything has worked out beautifully...' Write as your future self who has already achieved what you desire. Share what life looks like, how you feel, and loving guidance for today." },
        ],
    },
    {
        id: "affirmation-stacking",
        name: "Affirmation Stacking",
        tagline: "Build a ladder from doubt to certainty",
        icon: "/assets/icons/Manipura.svg",
        duration: "21 days",
        difficulty: "Advanced",
        category: "journaling",
        color: { card: "from-orange-50 to-amber-50", border: "border-orange-200/60", accent: "#D4A373" },
        description: "Affirmation Stacking is designed for minds that reject big leaps. Instead of jumping from 'I am broke' to 'I am a millionaire', you build a logical bridge — 5 progressive statements that climb from where you are to where you want to be, one believable rung at a time.",
        benefits: [
            "Bypasses the subconscious mind's resistance to big claims",
            "Creates a believable, logical pathway to your desire",
            "Ideal for those with deep-seated limiting beliefs",
            "Rewires identity through incremental, compounding steps",
        ],
        howTo: [
            "Rung 1: 'I am open to the idea that [desire] is possible for me'",
            "Rung 2: 'I am beginning to believe that [desire] is available to me'",
            "Rung 3: 'I choose to feel as if [desire] is already on its way'",
            "Rung 4: 'I know deeply that [desire] is mine'",
            "Rung 5: 'I am [full, bold desired affirmation]'",
            "Write all 5 rungs each morning and evening for 21 days",
        ],
        sessions: [
            { id: "morning", label: "Morning Stack", count: 5, type: "list", icon: "/assets/icons/Candle.svg",    subtitle: "Climb your belief ladder",     bg: "bg-orange-50", accent: "#D4A373", prompt: "Write your 5 progressive affirmations — start with openness and climb to bold certainty. Each rung should feel slightly more true than the last." },
            { id: "night",   label: "Evening Stack", count: 5, type: "list", icon: "/assets/icons/Manipura.svg",  subtitle: "Reinforce every rung",         bg: "bg-amber-50",  accent: "#D4A373", prompt: "Repeat your 5-affirmation stack to close the day. Notice which rungs feel more natural today than yesterday. The ladder is real." },
        ],
    },
];

// Fast lookup by id
export const TECHNIQUE_MAP = Object.fromEntries(TECHNIQUES.map(t => [t.id, t]));
export const DEFAULT_TECHNIQUE_ID = "369";

export const getTechniqueById = (id) => TECHNIQUE_MAP[id] || TECHNIQUE_MAP[DEFAULT_TECHNIQUE_ID];
export const getSessionById = (techniqueId, sessionId) => {
    const t = getTechniqueById(techniqueId);
    return t.sessions.find(s => s.id === sessionId) || t.sessions[0];
};

// Difficulty color helpers
export const DIFFICULTY_COLORS = {
    Beginner:     "bg-emerald-100 text-emerald-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced:     "bg-rose-100 text-rose-700",
};

export const CATEGORY_LABELS = {
    repetition:   "Repetition",
    journaling:   "Journaling",
    visualization: "Visualization",
    ritual:       "Ritual",
};
