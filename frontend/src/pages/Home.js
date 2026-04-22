import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Flame, ChevronRight, Bell } from 'lucide-react';
import { getTechniqueById } from '../constants/techniques';
import { MANI } from '../constants/mascot';
import { API } from '../lib/api';

const CATEGORY_ICONS = {
    general:   '/assets/icons/Lotus.svg',
    abundance: '/assets/icons/Manipura.svg',
    health:    '/assets/icons/Yoga.svg',
    love:      '/assets/icons/Hamsa.svg',
    clarity:   '/assets/icons/Ajna.svg',
    peace:     '/assets/icons/Equanimity.svg',
};

const getNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
    return window.Notification.permission || 'default';
};

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [goals, setGoals]           = useState([]);
    const [todayEntries, setTodayEntries] = useState([]);
    const [streak, setStreak]         = useState({ streak: 0, longest_streak: 0, total_days: 0 });
    const [loading, setLoading]       = useState(true);
    const [notifStatus, setNotifStatus] = useState(getNotificationPermission);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [goalsRes, streakRes] = await Promise.all([
                    axios.get(`${API}/goals`, { withCredentials: true }),
                    axios.get(`${API}/progress/streak`, { withCredentials: true }),
                ]);
                setGoals(goalsRes.data);
                setStreak(streakRes.data);

                if (goalsRes.data.length > 0) {
                    const todayRes = await axios.get(`${API}/rituals/today`, { withCredentials: true });
                    setTodayEntries(todayRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const enableNotifications = async () => {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        setNotifStatus(permission);
        if (permission === 'granted') {
            new Notification('Aligna', {
                body: "Reminders enabled! We'll nudge you for each ritual session.",
                icon: '/assets/icons/Lotus.svg',
            });
        }
    };

    const featuredGoal  = goals[0];
    const technique     = getTechniqueById(featuredGoal?.technique_id);
    const goalSessions  = technique?.sessions || [];

    // Completed sessions for the featured goal specifically
    const goalCompletedSessions = todayEntries
        .filter(e => e.goal_id === featuredGoal?.goal_id)
        .map(e => e.session_type);

    const allDone    = goalSessions.length > 0 && goalSessions.every(s => goalCompletedSessions.includes(s.id));
    const nextSession = goalSessions.find(s => !goalCompletedSessions.includes(s.id));

    // Dynamic grid columns based on number of sessions
    const gridCols = goalSessions.length === 1 ? 'grid-cols-1'
                   : goalSessions.length === 2 ? 'grid-cols-2'
                   : 'grid-cols-3';

    if (loading) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
                <img src={MANI.meditating} alt="Mani meditating" className="w-24 h-24 animate-soft-pulse drop-shadow-sm" />
                <p className="text-aligna-text-secondary font-body text-sm">Aligning...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 pb-24 md:px-8 md:pb-8" data-testid="home-page">

            {/* Header */}
            <div className="mb-7 animate-float-up">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-aligna-text-secondary font-body text-xs tracking-[0.18em] uppercase mb-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h1 className="font-heading text-3xl md:text-4xl text-aligna-text leading-tight">
                            {getGreeting()},<br />
                            <span className="text-aligna-primary">{user?.name?.split(' ')[0] || 'friend'}</span>
                        </h1>
                    </div>
                    <button onClick={() => navigate('/settings')} className="rounded-full border-2 border-aligna-border shadow-sm overflow-hidden hover:border-aligna-primary/40 transition-colors">
                        {user?.picture ? (
                            <img src={user.picture} alt={user.name} className="w-12 h-12 object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-aligna-primary/20 flex items-center justify-center">
                                <span className="font-heading text-xl text-aligna-primary">{(user?.name || 'U')[0]}</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {notifStatus === 'default' && (
                <div
                    data-testid="notification-banner"
                    className="mb-5 flex items-center gap-3 bg-aligna-accent/10 border border-aligna-accent/30 rounded-2xl px-4 py-3 animate-float-up"
                >
                    <Bell size={16} className="text-aligna-accent shrink-0" />
                    <p className="text-aligna-text text-sm font-body flex-1">Enable reminders for your daily rituals</p>
                    <button
                        data-testid="enable-notifications-btn"
                        onClick={enableNotifications}
                        className="text-aligna-accent text-xs font-semibold font-body hover:underline shrink-0"
                    >
                        Enable
                    </button>
                </div>
            )}

            {/* Streak + Stats row */}
            <div
                data-testid="streak-card"
                className="mb-5 bg-aligna-surface border border-aligna-border rounded-3xl p-5 animate-float-up"
                style={{ animationDelay: '0.05s' }}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-aligna-accent/10 flex items-center justify-center">
                            <Flame size={20} className="text-aligna-accent" />
                        </div>
                        <div>
                            <p className="font-heading text-3xl text-aligna-text leading-none">{streak.streak}</p>
                            <p className="text-aligna-text-secondary text-xs font-body mt-0.5">day streak</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="font-body text-xs text-aligna-text-secondary">Best</p>
                            <p className="font-heading text-lg text-aligna-text leading-tight">{streak.longest_streak}<span className="text-xs font-body ml-0.5 text-aligna-text-secondary">d</span></p>
                        </div>
                        <div className="text-right">
                            <p className="font-body text-xs text-aligna-text-secondary">Total</p>
                            <p className="font-heading text-lg text-aligna-text leading-tight">{streak.total_days}<span className="text-xs font-body ml-0.5 text-aligna-text-secondary">d</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* No Goals State */}
            {goals.length === 0 ? (
                <div
                    data-testid="no-goals-state"
                    className="text-center py-10 animate-float-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <img
                        src={MANI.confused}
                        alt="Mani wondering where to start"
                        className="w-36 h-36 mx-auto mb-5 drop-shadow-sm"
                    />
                    <h2 className="font-heading text-2xl text-aligna-text mb-2">Set your first intention</h2>
                    <p className="text-aligna-text-secondary font-body text-sm mb-7 max-w-[260px] mx-auto leading-relaxed">
                        Choose a manifestation technique and begin your daily ritual journey
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            data-testid="create-first-goal-btn"
                            onClick={() => navigate('/goals')}
                            className="bg-aligna-primary text-white font-body font-medium py-3.5 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Create a Goal
                        </button>
                        <button
                            onClick={() => navigate('/explore')}
                            className="border border-aligna-border text-aligna-text-secondary font-body text-sm py-3.5 px-6 rounded-full hover:border-aligna-primary/40 hover:text-aligna-text transition-all duration-300"
                        >
                            Explore Techniques
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Featured Goal */}
                    <div
                        data-testid="featured-goal-card"
                        className="mb-5 bg-aligna-surface border border-aligna-border rounded-3xl p-5 animate-float-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <img
                                src={CATEGORY_ICONS[featuredGoal?.category] || '/assets/icons/Lotus.svg'}
                                alt=""
                                className="w-5 h-5 opacity-60"
                            />
                            <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase">Today's Intention</p>
                        </div>
                        <h3 className="font-heading text-xl text-aligna-text mb-1.5 leading-snug">{featuredGoal?.title}</h3>
                        <p className="text-aligna-text-secondary font-body text-sm italic leading-relaxed line-clamp-2 opacity-80 mb-3">
                            "{featuredGoal?.affirmation}"
                        </p>
                        {/* Technique badge */}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${technique?.color.card} border ${technique?.color.border}`}>
                            <img src={technique?.icon} alt={technique?.name} className="w-3.5 h-3.5 opacity-70" />
                            <span className="font-body text-[11px] text-aligna-text-secondary">{technique?.name}</span>
                        </div>
                        {goals.length > 1 && (
                            <p className="text-aligna-text-secondary text-xs font-body mt-2 opacity-60">+{goals.length - 1} more intention{goals.length > 2 ? 's' : ''}</p>
                        )}
                    </div>

                    {/* Today's Sessions — dynamic per technique */}
                    <div className="mb-5 animate-float-up" style={{ animationDelay: '0.15s' }}>
                        <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase mb-3">Today's Sessions</p>
                        <div className={`grid ${gridCols} gap-3`}>
                            {goalSessions.map(sess => {
                                const done = goalCompletedSessions.includes(sess.id);
                                return (
                                    <button
                                        key={sess.id}
                                        data-testid={`session-card-${sess.id}`}
                                        onClick={() => !done && navigate('/ritual', { state: { session: sess.id, goalId: featuredGoal?.goal_id } })}
                                        disabled={done}
                                        className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 ${
                                            done
                                                ? 'bg-aligna-primary/10 border-aligna-primary/30 cursor-default'
                                                : `bg-gradient-to-br ${technique?.color.card} ${technique?.color.border} hover:-translate-y-0.5 active:scale-95`
                                        }`}
                                    >
                                        <img src={sess.icon} alt={sess.label} className={`w-8 h-8 ${done ? 'opacity-50' : 'opacity-90'}`} />
                                        <div className="text-center">
                                            <p className={`text-xs font-body font-medium leading-tight ${done ? 'text-aligna-primary' : 'text-aligna-text'}`}>
                                                {sess.label.split(' ')[0]}
                                            </p>
                                            <p className={`text-xs font-body ${done ? 'text-aligna-primary/60' : 'text-aligna-text-secondary'}`}>
                                                {done ? '✓ Done' : sess.type === 'freeform' ? '✍' : `${sess.count}×`}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA */}
                    {!allDone ? (
                        <button
                            data-testid="start-ritual-btn"
                            onClick={() => navigate('/ritual', { state: { session: nextSession?.id, goalId: featuredGoal?.goal_id } })}
                            className="w-full flex items-center justify-center gap-2 bg-aligna-primary text-white font-body font-medium py-4 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5 animate-float-up shadow-sm"
                            style={{ animationDelay: '0.2s' }}
                        >
                            Begin {nextSession?.label}
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div
                            data-testid="all-done-state"
                            className="text-center py-5 bg-aligna-success/10 border border-aligna-success/30 rounded-3xl animate-float-up animate-glow"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <img src={MANI.cool} alt="Mani is cool — you're done!" className="w-20 h-20 mx-auto mb-2 drop-shadow-sm" />
                            <p className="font-heading text-xl text-aligna-success">You are aligned for today</p>
                            <p className="text-aligna-text-secondary text-sm font-body mt-1">
                                All {goalSessions.length} session{goalSessions.length !== 1 ? 's' : ''} complete
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
