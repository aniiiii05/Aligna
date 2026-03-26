import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Flame, ChevronRight, Bell } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SESSION_INFO = {
    morning: { label: 'Morning', count: 3, icon: '/assets/icons/Candle.svg', time: 'Before noon', color: 'from-amber-50 to-orange-50', border: 'border-amber-200' },
    midday: { label: 'Midday', count: 6, icon: '/assets/icons/Water.svg', time: '12pm – 6pm', color: 'from-sky-50 to-teal-50', border: 'border-sky-200' },
    night: { label: 'Evening', count: 9, icon: '/assets/icons/Singing Bowl.svg', time: 'After 6pm', color: 'from-indigo-50 to-purple-50', border: 'border-indigo-200' },
};

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [todayEntries, setTodayEntries] = useState([]);
    const [streak, setStreak] = useState({ streak: 0, longest_streak: 0, total_days: 0 });
    const [loading, setLoading] = useState(true);
    const [notifStatus, setNotifStatus] = useState(Notification?.permission || 'default');

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
                body: 'Reminders enabled! We\'ll nudge you for each ritual session.',
                icon: '/assets/icons/Lotus.svg',
            });
        }
    };

    const completedSessions = todayEntries.map(e => e.session_type);
    const allDone = completedSessions.length === 3;
    const featuredGoal = goals[0];

    const nextSession = ['morning', 'midday', 'night'].find(s => !completedSessions.includes(s));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <img src="/assets/icons/Lotus.svg" alt="Loading" className="w-10 h-10 animate-soft-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 md:px-8" data-testid="home-page">
            {/* Header */}
            <div className="mb-8 animate-float-up">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-aligna-text-secondary font-body text-sm tracking-[0.15em] uppercase mb-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h1 className="font-heading text-4xl text-aligna-text leading-tight">
                            {getGreeting()},<br />
                            <span className="text-aligna-primary">{user?.name?.split(' ')[0] || 'friend'}</span>
                        </h1>
                    </div>
                    {user?.picture && (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-12 h-12 rounded-full border-2 border-aligna-border"
                        />
                    )}
                </div>
            </div>

            {/* Notification Banner */}
            {notifStatus === 'default' && (
                <div
                    data-testid="notification-banner"
                    className="mb-5 flex items-center gap-3 bg-aligna-accent/10 border border-aligna-accent/30 rounded-2xl px-4 py-3 animate-float-up"
                >
                    <Bell size={18} className="text-aligna-accent shrink-0" />
                    <p className="text-aligna-text text-sm font-body flex-1">Enable reminders for your daily rituals</p>
                    <button
                        data-testid="enable-notifications-btn"
                        onClick={enableNotifications}
                        className="text-aligna-accent text-sm font-medium font-body hover:underline shrink-0"
                    >
                        Enable
                    </button>
                </div>
            )}

            {/* Streak Card */}
            <div
                data-testid="streak-card"
                className="mb-5 flex items-center gap-4 bg-aligna-surface border border-aligna-border rounded-3xl p-5 animate-float-up"
                style={{ animationDelay: '0.05s' }}
            >
                <div className="flex items-center gap-2 flex-1">
                    <Flame size={24} className="text-aligna-accent" />
                    <div>
                        <p className="font-heading text-3xl text-aligna-text leading-none">{streak.streak}</p>
                        <p className="text-aligna-text-secondary text-xs font-body mt-0.5">day streak</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-body text-sm text-aligna-text-secondary">Best: <span className="text-aligna-text font-medium">{streak.longest_streak}d</span></p>
                    <p className="font-body text-sm text-aligna-text-secondary">Total: <span className="text-aligna-text font-medium">{streak.total_days}d</span></p>
                </div>
            </div>

            {/* No Goals State */}
            {goals.length === 0 ? (
                <div
                    data-testid="no-goals-state"
                    className="text-center py-12 animate-float-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <img src="/assets/illustrations/mental health problems-01.svg" alt="Start" className="w-32 h-32 mx-auto mb-5 opacity-70" />
                    <h2 className="font-heading text-2xl text-aligna-text mb-2">Set your first intention</h2>
                    <p className="text-aligna-text-secondary font-body text-sm mb-6 max-w-xs mx-auto">
                        Create a manifestation goal to begin your 3-6-9 ritual journey
                    </p>
                    <button
                        data-testid="create-first-goal-btn"
                        onClick={() => navigate('/goals')}
                        className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Create a Goal
                    </button>
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
                            <img src="/assets/icons/Book.svg" alt="Goal" className="w-5 h-5 opacity-60" />
                            <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase">Today's Intention</p>
                        </div>
                        <h3 className="font-heading text-xl text-aligna-text mb-1">{featuredGoal?.title}</h3>
                        <p className="text-aligna-text-secondary font-body text-sm italic leading-relaxed line-clamp-2">
                            "{featuredGoal?.affirmation}"
                        </p>
                    </div>

                    {/* Today's Sessions */}
                    <div className="mb-5 animate-float-up" style={{ animationDelay: '0.15s' }}>
                        <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase mb-3">Today's Rituals</p>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(SESSION_INFO).map(([key, info]) => {
                                const done = completedSessions.includes(key);
                                return (
                                    <button
                                        key={key}
                                        data-testid={`session-card-${key}`}
                                        onClick={() => !done && navigate('/ritual', { state: { session: key, goalId: featuredGoal?.goal_id } })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                                            done
                                                ? 'bg-aligna-primary/10 border-aligna-primary/30'
                                                : `bg-gradient-to-br ${info.color} ${info.border} hover:-translate-y-0.5 cursor-pointer`
                                        }`}
                                    >
                                        <img src={info.icon} alt={info.label} className={`w-8 h-8 ${done ? 'opacity-60' : 'opacity-90'}`} />
                                        <div className="text-center">
                                            <p className={`text-xs font-body font-medium ${done ? 'text-aligna-primary' : 'text-aligna-text'}`}>
                                                {info.label}
                                            </p>
                                            <p className={`text-xs font-body ${done ? 'text-aligna-primary/70' : 'text-aligna-text-secondary'}`}>
                                                {done ? 'Done' : `${info.count}×`}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA Button */}
                    {!allDone ? (
                        <button
                            data-testid="start-ritual-btn"
                            onClick={() => navigate('/ritual', { state: { session: nextSession, goalId: featuredGoal?.goal_id } })}
                            className="w-full flex items-center justify-center gap-2 bg-aligna-primary text-white font-body font-medium py-4 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5 animate-float-up"
                            style={{ animationDelay: '0.2s' }}
                        >
                            Begin {SESSION_INFO[nextSession]?.label} Ritual
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div
                            data-testid="all-done-state"
                            className="text-center py-4 bg-aligna-success/10 border border-aligna-success/30 rounded-2xl animate-float-up animate-glow"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <p className="font-heading text-xl text-aligna-success">You are aligned for today</p>
                            <p className="text-aligna-text-secondary text-sm font-body mt-1">All 3 rituals complete</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
