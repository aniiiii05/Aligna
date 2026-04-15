import React, { useState } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Calendar, Eye, EyeOff } from 'lucide-react';
import { API } from '../lib/api';

const WaitlistAdmin = () => {
    const [key, setKey]         = useState('');
    const [showKey, setShowKey] = useState(false);
    const [data, setData]       = useState(null);
    const [status, setStatus]   = useState('idle'); // idle | loading | error | success
    const [errorMsg, setErrorMsg] = useState('');

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!key.trim()) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await axios.get(`${API}/waitlist/admin`, {
                headers: { 'x-admin-key': key.trim() },
            });
            setData(res.data);
            setStatus('success');
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Could not fetch data. Check your admin key.';
            setErrorMsg(typeof msg === 'string' ? msg : 'Forbidden');
            setStatus('error');
        }
    };

    /* ── top 7 days for the sparkline ─────────────────────────── */
    const topDays = data
        ? Object.entries(data.daily_breakdown)
              .slice(0, 7)
              .reverse()
        : [];
    const maxCount = topDays.length ? Math.max(...topDays.map(([, v]) => v), 1) : 1;

    return (
        <div className="min-h-screen bg-aligna-bg">

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-primary/6 blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-accent/6 blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-5 py-10 md:px-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8 animate-float-up">
                    <img src="/assets/icons/Lotus.svg" alt="Aligna" className="w-7 h-7 opacity-80" />
                    <div>
                        <h1 className="font-heading text-2xl text-aligna-text">Waitlist Analytics</h1>
                        <p className="font-body text-xs text-aligna-text-secondary">Aligna · Admin only</p>
                    </div>
                </div>

                {/* Auth form (always visible until success) */}
                {status !== 'success' && (
                    <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-6 animate-float-up" style={{ animationDelay: '0.05s' }}>
                        <p className="font-body text-sm font-medium text-aligna-text mb-4">Enter your admin key</p>
                        <form onSubmit={handleFetch} className="space-y-3">
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    placeholder="WAITLIST_ADMIN_KEY value"
                                    className="w-full bg-aligna-surface-secondary border border-aligna-border rounded-full px-5 py-3 pr-12 font-body text-sm text-aligna-text placeholder-aligna-text-secondary/50 focus:outline-none focus:border-aligna-primary transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-aligna-text-secondary hover:text-aligna-text transition-colors"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {status === 'error' && (
                                <p className="text-center font-body text-xs" style={{ color: '#C67D6F' }}>{errorMsg}</p>
                            )}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-aligna-text text-aligna-bg font-body font-medium py-3 rounded-full hover:opacity-90 transition-all duration-300 disabled:opacity-60"
                            >
                                {status === 'loading' ? 'Loading...' : 'View Analytics'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Analytics */}
                {status === 'success' && data && (
                    <>
                        {/* Refresh button */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setStatus('idle')}
                                className="font-body text-xs text-aligna-text-secondary hover:text-aligna-text transition-colors underline underline-offset-2"
                            >
                                Change key
                            </button>
                        </div>

                        {/* KPI card */}
                        <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-4 animate-float-up">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-aligna-primary/10 flex items-center justify-center">
                                    <Users size={18} className="text-aligna-primary" />
                                </div>
                                <div>
                                    <p className="font-body text-xs text-aligna-text-secondary">Total signups</p>
                                    <p className="font-heading text-4xl text-aligna-text leading-none">{data.total.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Last 7 days bar chart */}
                        {topDays.length > 0 && (
                            <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-4 animate-float-up" style={{ animationDelay: '0.05s' }}>
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp size={16} className="text-aligna-text-secondary" />
                                    <p className="font-body text-sm font-medium text-aligna-text">Last 7 days</p>
                                </div>
                                <div className="flex items-end gap-2 h-24">
                                    {topDays.map(([day, cnt]) => (
                                        <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                                            <p className="font-body text-xs text-aligna-text-secondary">{cnt}</p>
                                            <div
                                                className="w-full rounded-t-lg bg-aligna-primary/70 transition-all duration-500"
                                                style={{ height: `${Math.round((cnt / maxCount) * 72)}px`, minHeight: '4px' }}
                                            />
                                            <p className="font-body text-[10px] text-aligna-text-secondary">
                                                {day.slice(5)} {/* MM-DD */}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full daily breakdown */}
                        {Object.keys(data.daily_breakdown).length > 0 && (
                            <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-4 animate-float-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={16} className="text-aligna-text-secondary" />
                                    <p className="font-body text-sm font-medium text-aligna-text">Daily breakdown (last 30 days)</p>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {Object.entries(data.daily_breakdown).map(([day, cnt]) => (
                                        <div key={day} className="flex items-center justify-between">
                                            <p className="font-body text-xs text-aligna-text-secondary">{day}</p>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-1.5 rounded-full bg-aligna-primary/60"
                                                    style={{ width: `${Math.round((cnt / maxCount) * 80)}px`, minWidth: '4px' }}
                                                />
                                                <p className="font-body text-xs font-medium text-aligna-text w-4 text-right">{cnt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent signups */}
                        {data.recent.length > 0 && (
                            <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 animate-float-up" style={{ animationDelay: '0.15s' }}>
                                <p className="font-body text-sm font-medium text-aligna-text mb-4">
                                    Recent signups ({data.recent.length})
                                </p>
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                    {data.recent.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-aligna-border last:border-0">
                                            <p className="font-body text-sm text-aligna-text truncate flex-1 mr-4">{s.email}</p>
                                            <p className="font-body text-xs text-aligna-text-secondary shrink-0">
                                                {s.joined_at ? s.joined_at.slice(0, 10) : '—'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WaitlistAdmin;
