import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, Trophy, BookOpen } from 'lucide-react';
import { MANI } from '../constants/mascot';
import { API } from '../lib/api';

const SESSION_COLORS = {
    morning: 'bg-amber-100 text-amber-700',
    midday: 'bg-teal-100 text-teal-700',
    night: 'bg-indigo-100 text-indigo-700',
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const Progress = () => {
    const [streak, setStreak] = useState({ streak: 0, longest_streak: 0, total_days: 0 });
    const [calendar, setCalendar] = useState({});
    const [totalSessions, setTotalSessions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [streakRes, calRes] = await Promise.all([
                    axios.get(`${API}/progress/streak`, { withCredentials: true }),
                    axios.get(`${API}/progress/calendar`, { withCredentials: true }),
                ]);
                setStreak(streakRes.data);
                setCalendar(calRes.data.calendar || {});
                setTotalSessions(calRes.data.total_sessions || 0);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDateStatus = (dateStr) => {
        const sessions = calendar[dateStr];
        if (!sessions || sessions.length === 0) return 'none';
        if (sessions.length >= 3) return 'full';
        return 'partial';
    };

    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => {
        const next = new Date(year, month + 1, 1);
        if (next <= today) setViewDate(next);
    };

    if (loading) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
                <img src={MANI.studious} alt="Mani checking your progress" className="w-24 h-24 animate-soft-pulse drop-shadow-sm" />
                <p className="text-aligna-text-secondary font-body text-sm">Loading your journey...</p>
            </div>
        );
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 pb-24 md:px-8 md:pb-8" data-testid="progress-page">
            {/* Header */}
            <div className="mb-8">
                <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase mb-1">Your Journey</p>
                <h1 className="font-heading text-3xl md:text-4xl text-aligna-text">Progress</h1>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { icon: <Flame size={20} className="text-aligna-accent" />, value: streak.streak, label: 'Day Streak', testId: 'current-streak' },
                    { icon: <Trophy size={20} className="text-aligna-primary" />, value: streak.longest_streak, label: 'Best Streak', testId: 'best-streak' },
                    { icon: <BookOpen size={20} className="text-aligna-text-secondary" />, value: totalSessions, label: 'Total Rituals', testId: 'total-rituals' },
                ].map((stat) => (
                    <div
                        key={stat.testId}
                        data-testid={stat.testId}
                        className="bg-aligna-surface border border-aligna-border rounded-3xl p-4 text-center animate-float-up"
                    >
                        <div className="flex justify-center mb-2">{stat.icon}</div>
                        <p className="font-heading text-3xl text-aligna-text leading-none">{stat.value}</p>
                        <p className="text-aligna-text-secondary text-xs font-body mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Streak Visual */}
            {streak.streak > 0 && (
                <div
                    data-testid="streak-visual"
                    className="mb-6 bg-gradient-to-r from-aligna-accent/10 to-aligna-primary/10 border border-aligna-accent/20 rounded-3xl p-5 flex items-center gap-4 animate-float-up"
                >
                    <img
                        src={streak.streak >= 30 ? MANI.wise : streak.streak >= 7 ? MANI.superhero : MANI.running}
                        alt="Mani cheering you on"
                        className="w-16 h-16 shrink-0 drop-shadow-sm"
                    />
                    <div>
                        <p className="font-heading text-xl text-aligna-text">
                            {streak.streak === 1 ? 'Day one of many' : `${streak.streak} days of alignment`}
                        </p>
                        <p className="text-aligna-text-secondary text-sm font-body">
                            {streak.total_days} unique practice days total
                        </p>
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 mb-6 animate-float-up" data-testid="calendar-section">
                <div className="flex items-center justify-between mb-4">
                    <button
                        data-testid="prev-month-btn"
                        onClick={prevMonth}
                        className="p-2 rounded-full hover:bg-aligna-surface-secondary transition-colors text-aligna-text-secondary hover:text-aligna-text"
                    >
                        ←
                    </button>
                    <p className="font-heading text-lg text-aligna-text">{monthName}</p>
                    <button
                        data-testid="next-month-btn"
                        onClick={nextMonth}
                        className={`p-2 rounded-full transition-colors ${new Date(year, month + 1) > today ? 'text-aligna-border cursor-not-allowed' : 'hover:bg-aligna-surface-secondary text-aligna-text-secondary hover:text-aligna-text'}`}
                        disabled={new Date(year, month + 1) > today}
                    >
                        →
                    </button>
                </div>

                {/* Week headers */}
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-[10px] font-body text-aligna-text-secondary font-medium py-1">{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for first week */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const status = getDateStatus(dateStr);
                        const isToday = dateStr === today.toISOString().split('T')[0];
                        const sessions = calendar[dateStr] || [];

                        return (
                            <div
                                key={day}
                                data-testid={`calendar-day-${dateStr}`}
                                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-body transition-all duration-200 cursor-default relative ${
                                    status === 'full'
                                        ? 'bg-aligna-primary text-white font-medium'
                                        : status === 'partial'
                                            ? 'bg-aligna-primary/30 text-aligna-text'
                                            : isToday
                                                ? 'bg-aligna-surface-secondary text-aligna-text font-medium ring-1 ring-aligna-primary/30'
                                                : 'text-aligna-text-secondary hover:bg-aligna-surface-secondary'
                                }`}
                                title={sessions.length > 0 ? `${sessions.join(', ')} completed` : ''}
                            >
                                <span>{day}</span>
                                {sessions.length > 0 && sessions.length < 3 && (
                                    <div className="flex gap-0.5 mt-0.5">
                                        {sessions.map((s, idx) => (
                                            <div key={idx} className="w-1 h-1 rounded-full bg-aligna-accent" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-aligna-border">
                    {[
                        { color: 'bg-aligna-primary', label: '3+ sessions' },
                        { color: 'bg-aligna-primary/30', label: 'Partial' },
                        { color: 'bg-aligna-surface-secondary ring-1 ring-aligna-primary/30', label: 'Today' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                            <span className="text-[10px] font-body text-aligna-text-secondary">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Session breakdown */}
            <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 animate-float-up" data-testid="session-breakdown">
                <p className="text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-4">Sessions by Type</p>
                <div className="space-y-3">
                    {[
                        { type: 'morning', label: 'Morning (3×)', icon: '/assets/icons/Candle.svg' },
                        { type: 'midday', label: 'Midday (6×)', icon: '/assets/icons/Water.svg' },
                        { type: 'night', label: 'Evening (9×)', icon: '/assets/icons/Singing Bowl.svg' },
                    ].map(({ type, label, icon }) => {
                        const count = Object.values(calendar).filter(sessions => sessions.includes(type)).length;
                        const pct = streak.total_days > 0 ? Math.round((count / Math.max(streak.total_days, 1)) * 100) : 0;
                        return (
                            <div key={type} className="flex items-center gap-3">
                                <img src={icon} alt={type} className="w-6 h-6 opacity-70 shrink-0" />
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-body text-aligna-text">{label}</span>
                                        <span className="text-sm font-body text-aligna-text-secondary">{count} days</span>
                                    </div>
                                    <div className="h-1.5 bg-aligna-surface-secondary rounded-full overflow-hidden">
                                        <div
                                            data-testid={`progress-bar-${type}`}
                                            className="h-full bg-aligna-primary rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Progress;
