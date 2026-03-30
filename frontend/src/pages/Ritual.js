import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check } from 'lucide-react';
import { getTechniqueById } from '../constants/techniques';

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const getCurrentDefaultSession = (technique) => {
    if (!technique) return null;
    const h = new Date().getHours();
    // Try to pick the time-appropriate session if the technique has morning/midday/night
    const sessionIds = technique.sessions.map(s => s.id);
    if (h < 12 && sessionIds.includes('morning')) return 'morning';
    if (h < 18 && sessionIds.includes('midday')) return 'midday';
    if (sessionIds.includes('night')) return 'night';
    // Fallback: first session
    return technique.sessions[0]?.id || null;
};

const Ritual = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef(null);
    const freeformRef = useRef(null);

    const [goals, setGoals]             = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState(location.state?.goalId || null);
    const [completedToday, setCompletedToday] = useState([]); // ["goalId:sessionId", ...]
    const [phase, setPhase]             = useState('select'); // select | write | done
    const [writings, setWritings]       = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [freeformText, setFreeformText] = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');

    const selectedGoal      = goals.find(g => g.goal_id === selectedGoalId);
    const technique         = getTechniqueById(selectedGoal?.technique_id);

    // Session selection — starts from location state or time-aware default
    const [selectedSession, setSelectedSession] = useState(
        location.state?.session || null
    );

    // Resolve selectedSession once technique is known
    const resolvedSession = selectedSession || (technique ? getCurrentDefaultSession(technique) : null);
    const sessionObj = technique?.sessions.find(s => s.id === resolvedSession) || technique?.sessions[0];

    const requiredCount = sessionObj?.count || 3;
    const progressPct   = sessionObj?.type === 'freeform'
        ? (freeformText.trim().length > 0 ? 100 : 0)
        : Math.round((writings.length / requiredCount) * 100);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [goalsRes, todayRes] = await Promise.all([
                    axios.get(`${API}/goals`, { withCredentials: true }),
                    axios.get(`${API}/rituals/today`, { withCredentials: true }),
                ]);
                setGoals(goalsRes.data);
                setCompletedToday(todayRes.data.map(e => `${e.goal_id}:${e.session_type}`));

                if (!selectedGoalId && goalsRes.data.length > 0) {
                    setSelectedGoalId(goalsRes.data[0].goal_id);
                }

                // Auto-advance to write if both goal and session already set from navigation
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
        if (phase === 'write') {
            if (sessionObj?.type === 'freeform') {
                setTimeout(() => freeformRef.current?.focus(), 300);
            } else {
                setTimeout(() => inputRef.current?.focus(), 300);
            }
        }
    }, [phase, sessionObj]);

    const isSessionDone = (goalId, sessionId) => completedToday.includes(`${goalId}:${sessionId}`);

    // ── Repetition / List: one entry at a time ────────────────────────────────
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

    // ── Freeform: single textarea ─────────────────────────────────────────────
    const handleFreeformSubmit = () => {
        const text = freeformText.trim();
        if (!text) return;
        handleSubmit([text]);
    };

    // ── Submit to backend ─────────────────────────────────────────────────────
    const handleSubmit = async (allWritings) => {
        setSubmitting(true);
        setError('');
        const localDate = new Date().toLocaleDateString('en-CA');
        try {
            await axios.post(
                `${API}/rituals/entry`,
                { goal_id: selectedGoalId, session_type: resolvedSession, writings: allWritings, local_date: localDate },
                { withCredentials: true }
            );
            setWritings(allWritings);
            setPhase('done');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save ritual');
            setSubmitting(false);
        }
    };

    // ── Prompt helper ─────────────────────────────────────────────────────────
    const getWritePrompt = () => {
        if (!sessionObj) return '';
        if (sessionObj.type === 'freeform') return sessionObj.prompt;
        if (sessionObj.type === 'list') {
            const remaining = requiredCount - writings.length;
            return `Write entry ${writings.length + 1} of ${requiredCount} — make each one different`;
        }
        // repetition
        const remaining = requiredCount - writings.length;
        return remaining === requiredCount
            ? `Write it ${requiredCount} times — feel each word`
            : `Write it ${remaining} more time${remaining !== 1 ? 's' : ''}...`;
    };

    // ──────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <img src="/assets/icons/Mindfulness.svg" alt="Loading" className="w-10 h-10 animate-soft-pulse" />
            </div>
        );
    }

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

    // ── Done / Celebration ────────────────────────────────────────────────────
    if (phase === 'done') {
        return (
            <div
                data-testid="ritual-complete-screen"
                className={`min-h-screen ${sessionObj?.bg || 'bg-aligna-bg'} flex flex-col items-center justify-center px-6 text-center`}
            >
                <div className="animate-float-up">
                    <div className="w-24 h-24 rounded-full bg-aligna-primary/20 flex items-center justify-center mx-auto mb-6 animate-glow">
                        <img src={sessionObj?.icon || '/assets/icons/Lotus.svg'} alt="Complete" className="w-14 h-14" />
                    </div>
                    <h1 className="font-heading text-4xl text-aligna-text mb-3">Beautifully done</h1>
                    <p className="text-aligna-text-secondary font-body text-base mb-1">
                        You've completed your {sessionObj?.label}
                    </p>
                    <p className="text-aligna-text-secondary font-body text-sm italic mb-2">
                        {sessionObj?.type === 'freeform'
                            ? 'Your entry has been written with intention'
                            : `${writings.length} ${sessionObj?.type === 'list' ? 'entries' : 'affirmations'} written with intention`
                        }
                    </p>
                    <p className="font-body text-xs text-aligna-text-secondary mb-8 opacity-70">
                        via <strong>{technique?.name}</strong>
                    </p>

                    {/* Written samples */}
                    <div className="w-full max-w-sm mx-auto mb-8 space-y-2 text-left">
                        {writings.slice(0, sessionObj?.type === 'freeform' ? 1 : 3).map((w, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white/60 rounded-xl px-4 py-2">
                                <Check size={14} className="text-aligna-primary shrink-0 mt-1" />
                                <p className="text-aligna-text font-body text-sm italic line-clamp-2">"{w}"</p>
                            </div>
                        ))}
                        {sessionObj?.type !== 'freeform' && writings.length > 3 && (
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

    // ── Select phase ──────────────────────────────────────────────────────────
    if (phase === 'select') {
        const goalTechnique = getTechniqueById(selectedGoal?.technique_id);
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
                            {goals.map(goal => {
                                const t = getTechniqueById(goal.technique_id);
                                return (
                                    <button
                                        key={goal.goal_id}
                                        data-testid={`select-goal-${goal.goal_id}`}
                                        onClick={() => {
                                            setSelectedGoalId(goal.goal_id);
                                            // Reset session to match new goal's technique default
                                            setSelectedSession(null);
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                                            selectedGoalId === goal.goal_id
                                                ? 'border-aligna-primary bg-aligna-primary/5'
                                                : 'border-aligna-border bg-aligna-surface hover:border-aligna-primary/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-heading text-lg text-aligna-text">{goal.title}</p>
                                        </div>
                                        <p className="text-aligna-text-secondary text-xs font-body italic mt-0.5 line-clamp-1">"{goal.affirmation}"</p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <img src={t.icon} alt={t.name} className="w-3.5 h-3.5 opacity-50" />
                                            <span className="text-[11px] font-body text-aligna-text-secondary">{t.name}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Session Selection — derived from the selected goal's technique */}
                {goalTechnique && (
                    <div className="mb-8">
                        <p className="text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">Select Session</p>
                        <div className="space-y-3">
                            {goalTechnique.sessions.map(sess => {
                                const done   = selectedGoalId && isSessionDone(selectedGoalId, sess.id);
                                const active = resolvedSession === sess.id;
                                return (
                                    <button
                                        key={sess.id}
                                        data-testid={`select-session-${sess.id}`}
                                        onClick={() => !done && setSelectedSession(sess.id)}
                                        disabled={done}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                                            done
                                                ? 'border-aligna-border bg-aligna-surface-secondary opacity-60 cursor-not-allowed'
                                                : active
                                                    ? 'border-aligna-primary bg-aligna-primary/5'
                                                    : 'border-aligna-border bg-aligna-surface hover:border-aligna-primary/30'
                                        }`}
                                    >
                                        <img src={sess.icon} alt={sess.label} className="w-8 h-8" />
                                        <div className="flex-1 text-left">
                                            <p className="font-body font-medium text-aligna-text text-sm">{sess.label}</p>
                                            <p className="text-aligna-text-secondary text-xs font-body">{sess.subtitle}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-heading text-2xl text-aligna-accent">
                                                {sess.type === 'freeform' ? '✍' : `${sess.count}×`}
                                            </span>
                                            {done && <Check size={16} className="text-aligna-primary" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    data-testid="begin-writing-btn"
                    disabled={!selectedGoalId || (selectedGoalId && resolvedSession && isSessionDone(selectedGoalId, resolvedSession))}
                    onClick={() => { setWritings([]); setFreeformText(''); setPhase('write'); }}
                    className="w-full bg-aligna-primary text-white font-body font-medium py-4 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selectedGoalId && resolvedSession && isSessionDone(selectedGoalId, resolvedSession)
                        ? 'Already completed today'
                        : `Begin ${sessionObj?.label || 'Session'}`
                    }
                </button>
            </div>
        );
    }

    // ── Write phase ───────────────────────────────────────────────────────────
    const isFreeform   = sessionObj?.type === 'freeform';
    const isList       = sessionObj?.type === 'list';
    const isRepetition = sessionObj?.type === 'repetition';

    return (
        <div
            data-testid="ritual-write-screen"
            className={`min-h-screen ${sessionObj?.bg || 'bg-aligna-bg'} flex flex-col`}
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
                    <p className="font-body text-xs text-aligna-text-secondary tracking-[0.15em] uppercase">{sessionObj?.label}</p>
                </div>
                <div className="px-3 h-10 rounded-full bg-white/50 flex items-center justify-center">
                    {isFreeform
                        ? <p className="font-body text-xs text-aligna-text-secondary">{freeformText.trim().split(/\s+/).filter(Boolean).length} words</p>
                        : <p className="font-heading text-lg text-aligna-text leading-none">{writings.length}/{requiredCount}</p>
                    }
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

            <div className="flex-1 flex flex-col px-5 pb-4">
                {/* Affirmation / Prompt display */}
                <div className="text-center mb-6">
                    <img src={sessionObj?.icon || '/assets/icons/Lotus.svg'} alt={sessionObj?.label} className="w-12 h-12 mx-auto mb-4 opacity-80" />

                    {/* For repetition/list: show the affirmation as the "what to write" */}
                    {(isRepetition || isList) && (
                        <>
                            <p className="text-aligna-text-secondary font-body text-xs tracking-[0.15em] uppercase mb-3">
                                {isList ? 'Write each entry distinctly' : 'Write your affirmation'}
                            </p>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 mx-auto max-w-sm">
                                <p className="font-heading text-xl text-aligna-text leading-snug italic">
                                    "{selectedGoal?.affirmation}"
                                </p>
                            </div>
                        </>
                    )}

                    {/* For freeform: show the session prompt */}
                    {isFreeform && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 mx-auto max-w-sm">
                            <p className="font-body text-sm text-aligna-text-secondary leading-relaxed">
                                {sessionObj?.prompt}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Written entries (repetition / list) ── */}
                {!isFreeform && (
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
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
                )}

                {error && (
                    <p className="text-aligna-error text-sm font-body text-center mb-4" data-testid="ritual-error">{error}</p>
                )}

                {/* ── Input area ── */}
                {!submitting && (
                    <div className="mt-auto">
                        <p className="text-center text-aligna-text-secondary text-xs font-body mb-3">
                            {getWritePrompt()}
                        </p>

                        {/* Freeform: large textarea + submit button */}
                        {isFreeform ? (
                            <div className="space-y-3">
                                <textarea
                                    ref={freeformRef}
                                    data-testid="ritual-input"
                                    value={freeformText}
                                    onChange={e => setFreeformText(e.target.value)}
                                    placeholder={`Start writing here — let your thoughts flow freely...`}
                                    rows={6}
                                    className="w-full ritual-input px-4 py-3 font-body text-aligna-text placeholder-aligna-text-secondary/50 text-sm resize-none"
                                />
                                <button
                                    data-testid="ritual-write-btn"
                                    onClick={handleFreeformSubmit}
                                    disabled={!freeformText.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-aligna-primary text-white font-body font-medium py-3.5 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 disabled:opacity-40"
                                >
                                    <Check size={17} />
                                    Complete Session
                                </button>
                            </div>
                        ) : (
                            /* Repetition / List: one-at-a-time input */
                            <div className="flex gap-3 items-end">
                                <textarea
                                    ref={inputRef}
                                    data-testid="ritual-input"
                                    value={currentInput}
                                    onChange={e => setCurrentInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        isList
                                            ? `Entry ${writings.length + 1} of ${requiredCount}...`
                                            : 'Type your affirmation...'
                                    }
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
                        )}
                    </div>
                )}

                {submitting && (
                    <div className="mt-auto text-center py-4">
                        <img src={sessionObj?.icon || '/assets/icons/Lotus.svg'} alt="Saving" className="w-10 h-10 mx-auto animate-soft-pulse" />
                        <p className="text-aligna-text-secondary font-body text-sm mt-2">Anchoring your intention...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ritual;
