import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SESSION_CONFIG = {
    morning: { label: 'Morning Ritual', count: 3, icon: '/assets/icons/Candle.svg', subtitle: 'Plant the seed of intention', bg: 'bg-amber-50', accent: '#D4A373' },
    midday: { label: 'Midday Ritual', count: 6, icon: '/assets/icons/Water.svg', subtitle: 'Nurture your vision', bg: 'bg-teal-50', accent: '#879C93' },
    night: { label: 'Evening Ritual', count: 9, icon: '/assets/icons/Singing Bowl.svg', subtitle: 'Surrender to the universe', bg: 'bg-indigo-50', accent: '#6E7A75' },
};

const getCurrentSession = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'midday';
    return 'night';
};

const Ritual = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef(null);

    const [goals, setGoals] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState(location.state?.goalId || null);
    const [selectedSession, setSelectedSession] = useState(location.state?.session || getCurrentSession());
    const [completedSessions, setCompletedSessions] = useState([]);
    const [phase, setPhase] = useState('select'); // select | write | done
    const [writings, setWritings] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);

    const config = SESSION_CONFIG[selectedSession];
    const selectedGoal = goals.find(g => g.goal_id === selectedGoalId);
    const requiredCount = config?.count || 3;
    const progressPct = Math.round((writings.length / requiredCount) * 100);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [goalsRes, todayRes] = await Promise.all([
                    axios.get(`${API}/goals`, { withCredentials: true }),
                    axios.get(`${API}/rituals/today`, { withCredentials: true }),
                ]);
                setGoals(goalsRes.data);
                setCompletedSessions(todayRes.data.map(e => `${e.goal_id}:${e.session_type}`));

                if (!selectedGoalId && goalsRes.data.length > 0) {
                    setSelectedGoalId(goalsRes.data[0].goal_id);
                }

                // Auto-advance to write if both goal and session already set from nav
                if (location.state?.goalId && location.state?.session) {
                    setPhase('write');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (phase === 'write' && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [phase]);

    const isSessionDone = (goalId, session) => completedSessions.includes(`${goalId}:${session}`);

    const handleWrite = () => {
        const text = currentInput.trim();
        if (!text) return;
        const newWritings = [...writings, text];
        setWritings(newWritings);
        setCurrentInput('');

        if (newWritings.length >= requiredCount) {
            handleSubmit(newWritings);
        } else {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleWrite();
        }
    };

    const handleSubmit = async (allWritings) => {
        setSubmitting(true);
        setError('');
        try {
            await axios.post(
                `${API}/rituals/entry`,
                { goal_id: selectedGoalId, session_type: selectedSession, writings: allWritings },
                { withCredentials: true }
            );
            setShowCelebration(true);
            setPhase('done');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save ritual');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <img src="/assets/icons/Mindfulness.svg" alt="Loading" className="w-10 h-10 animate-soft-pulse" />
            </div>
        );
    }

    // No goals state
    if (goals.length === 0) {
        return (
            <div className="max-w-lg mx-auto px-5 py-12 text-center" data-testid="ritual-no-goals">
                <img src="/assets/illustrations/mental health problems-03.svg" alt="No goals" className="w-32 h-32 mx-auto mb-6 opacity-70" />
                <h2 className="font-heading text-2xl text-aligna-text mb-3">Set an intention first</h2>
                <p className="text-aligna-text-secondary font-body text-sm mb-6">Create a manifestation goal to start your ritual</p>
                <button
                    data-testid="goto-goals-btn"
                    onClick={() => navigate('/goals')}
                    className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full"
                >
                    Create a Goal
                </button>
            </div>
        );
    }

    // Done / Celebration
    if (phase === 'done') {
        return (
            <div
                data-testid="ritual-complete-screen"
                className={`min-h-screen ${config.bg} flex flex-col items-center justify-center px-6 text-center`}
            >
                <div className="animate-float-up">
                    <div className="w-24 h-24 rounded-full bg-aligna-primary/20 flex items-center justify-center mx-auto mb-6 animate-glow">
                        <img src={config.icon} alt="Complete" className="w-14 h-14" />
                    </div>
                    <h1 className="font-heading text-4xl text-aligna-text mb-3">Beautifully done</h1>
                    <p className="text-aligna-text-secondary font-body text-base mb-2">
                        You've completed your {config.label}
                    </p>
                    <p className="text-aligna-text-secondary font-body text-sm italic mb-8">
                        {requiredCount} affirmations written with intention
                    </p>

                    {/* Written affirmations */}
                    <div className="w-full max-w-sm mx-auto mb-8 space-y-2 text-left">
                        {writings.slice(0, 3).map((w, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/60 rounded-xl px-4 py-2">
                                <Check size={14} className="text-aligna-primary shrink-0" />
                                <p className="text-aligna-text font-body text-sm italic line-clamp-1">"{w}"</p>
                            </div>
                        ))}
                        {writings.length > 3 && (
                            <p className="text-aligna-text-secondary text-xs font-body text-center">+{writings.length - 3} more</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            data-testid="back-to-home-btn"
                            onClick={() => navigate('/')}
                            className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300"
                        >
                            Return Home
                        </button>
                        <button
                            data-testid="view-progress-btn"
                            onClick={() => navigate('/progress')}
                            className="text-aligna-text-secondary font-body text-sm hover:text-aligna-text transition-colors"
                        >
                            View Progress
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Select phase
    if (phase === 'select') {
        return (
            <div className="max-w-lg mx-auto px-5 py-6 md:px-8" data-testid="ritual-select-screen">
                <button
                    data-testid="ritual-back-btn"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-aligna-text-secondary hover:text-aligna-text transition-colors mb-6 font-body text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="mb-8">
                    <h1 className="font-heading text-4xl text-aligna-text mb-2">Begin Ritual</h1>
                    <p className="text-aligna-text-secondary font-body text-sm">Choose your session and intention</p>
                </div>

                {/* Goal Selection */}
                {goals.length > 1 && (
                    <div className="mb-6">
                        <p className="text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">Select Intention</p>
                        <div className="space-y-2">
                            {goals.map(goal => (
                                <button
                                    key={goal.goal_id}
                                    data-testid={`select-goal-${goal.goal_id}`}
                                    onClick={() => setSelectedGoalId(goal.goal_id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                                        selectedGoalId === goal.goal_id
                                            ? 'border-aligna-primary bg-aligna-primary/5'
                                            : 'border-aligna-border bg-aligna-surface hover:border-aligna-primary/30'
                                    }`}
                                >
                                    <p className="font-heading text-lg text-aligna-text">{goal.title}</p>
                                    <p className="text-aligna-text-secondary text-xs font-body italic mt-0.5 line-clamp-1">"{goal.affirmation}"</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Session Selection */}
                <div className="mb-8">
                    <p className="text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">Select Session</p>
                    <div className="space-y-3">
                        {Object.entries(SESSION_CONFIG).map(([key, conf]) => {
                            const done = selectedGoalId && isSessionDone(selectedGoalId, key);
                            const active = selectedSession === key;
                            return (
                                <button
                                    key={key}
                                    data-testid={`select-session-${key}`}
                                    onClick={() => !done && setSelectedSession(key)}
                                    disabled={done}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                                        done
                                            ? 'border-aligna-border bg-aligna-surface-secondary opacity-60 cursor-not-allowed'
                                            : active
                                                ? 'border-aligna-primary bg-aligna-primary/5'
                                                : 'border-aligna-border bg-aligna-surface hover:border-aligna-primary/30'
                                    }`}
                                >
                                    <img src={conf.icon} alt={conf.label} className="w-8 h-8" />
                                    <div className="flex-1 text-left">
                                        <p className="font-body font-medium text-aligna-text text-sm">{conf.label}</p>
                                        <p className="text-aligna-text-secondary text-xs font-body">{conf.subtitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-heading text-2xl text-aligna-accent">{conf.count}×</span>
                                        {done && <Check size={16} className="text-aligna-primary" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    data-testid="begin-writing-btn"
                    disabled={!selectedGoalId || (selectedGoalId && isSessionDone(selectedGoalId, selectedSession))}
                    onClick={() => setPhase('write')}
                    className="w-full bg-aligna-primary text-white font-body font-medium py-4 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selectedGoalId && isSessionDone(selectedGoalId, selectedSession)
                        ? 'Already completed today'
                        : `Begin ${config.label}`
                    }
                </button>
            </div>
        );
    }

    // Write phase - Immersive mode
    return (
        <div
            data-testid="ritual-write-screen"
            className={`min-h-screen ${config.bg} flex flex-col`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-4">
                <button
                    data-testid="exit-ritual-btn"
                    onClick={() => setPhase('select')}
                    className="p-2 rounded-full bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/70"
                >
                    <ArrowLeft size={18} className="text-aligna-text" />
                </button>
                <div className="text-center">
                    <p className="font-body text-xs text-aligna-text-secondary tracking-[0.15em] uppercase">{config.label}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                    <p className="font-heading text-lg text-aligna-text leading-none">{writings.length}/{requiredCount}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 mb-6">
                <div className="h-1 bg-white/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-aligna-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Affirmation Prompt */}
            <div className="flex-1 flex flex-col px-5 pb-4">
                <div className="text-center mb-8">
                    <img src={config.icon} alt={config.label} className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <p className="text-aligna-text-secondary font-body text-xs tracking-[0.15em] uppercase mb-3">Write your affirmation</p>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 mx-auto max-w-sm">
                        <p className="font-heading text-xl text-aligna-text leading-snug italic">
                            "{selectedGoal?.affirmation}"
                        </p>
                    </div>
                </div>

                {/* Written entries */}
                <div className="space-y-2 mb-6 max-h-40 overflow-y-auto scrollbar-hide">
                    {writings.map((w, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2.5 animate-float-up"
                        >
                            <span className="font-heading text-aligna-primary text-sm shrink-0">{i + 1}</span>
                            <p className="text-aligna-text font-body text-sm italic line-clamp-1 flex-1">"{w}"</p>
                            <Check size={14} className="text-aligna-primary shrink-0" />
                        </div>
                    ))}
                </div>

                {error && (
                    <p className="text-aligna-error text-sm font-body text-center mb-4" data-testid="ritual-error">{error}</p>
                )}

                {/* Input Area */}
                {!submitting && (
                    <div className="mt-auto">
                        <p className="text-center text-aligna-text-secondary text-xs font-body mb-3">
                            {writings.length < requiredCount
                                ? `Write it ${requiredCount - writings.length} more time${requiredCount - writings.length !== 1 ? 's' : ''}...`
                                : 'Saving your ritual...'
                            }
                        </p>
                        <div className="flex gap-3 items-end">
                            <textarea
                                ref={inputRef}
                                data-testid="ritual-input"
                                value={currentInput}
                                onChange={e => setCurrentInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your affirmation..."
                                rows={2}
                                className="flex-1 ritual-input px-4 py-3 font-body text-aligna-text placeholder-aligna-text-secondary/50 text-sm resize-none"
                                disabled={writings.length >= requiredCount}
                            />
                            <button
                                data-testid="ritual-write-btn"
                                onClick={handleWrite}
                                disabled={!currentInput.trim() || writings.length >= requiredCount}
                                className="w-12 h-12 rounded-full bg-aligna-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-aligna-primary-hover transition-all duration-300 shrink-0"
                            >
                                <Check size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {submitting && (
                    <div className="mt-auto text-center py-4">
                        <img src={config.icon} alt="Saving" className="w-10 h-10 mx-auto animate-soft-pulse" />
                        <p className="text-aligna-text-secondary font-body text-sm mt-2">Anchoring your intention...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ritual;
