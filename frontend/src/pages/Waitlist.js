import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../lib/api';

const FEATURES = [
    { icon: '/assets/icons/Candle.svg',       label: 'Morning ritual',      desc: 'Write your affirmation 3× to set the day\'s intention' },
    { icon: '/assets/icons/Water.svg',         label: 'Midday reinforcement', desc: 'Return at midday and write 6× to strengthen focus' },
    { icon: '/assets/icons/Singing Bowl.svg',  label: 'Evening anchor',      desc: 'Close the day with 9× — the most powerful session' },
    { icon: '/assets/icons/Lotus.svg',         label: 'Streak tracking',     desc: 'Build a daily practice and watch your streaks grow' },
    { icon: '/assets/icons/Ajna.svg',          label: 'Progress calendar',   desc: 'See your full journey on a beautiful month-view calendar' },
    { icon: '/assets/icons/Hamsa.svg',         label: 'Multiple goals',      desc: 'Set intentions for career, health, love, and more' },
];

const Waitlist = () => {
    const [email, setEmail]           = useState('');
    const [status, setStatus]         = useState('idle'); // idle | loading | success | error | duplicate
    const [errorMsg, setErrorMsg]     = useState('');
    const [count, setCount]           = useState(null);
    const [copied, setCopied]         = useState(false);

    const waitlistUrl = `${window.location.origin}/waitlist`;

    useEffect(() => {
        axios.get(`${API}/waitlist/count`)
            .then(r => setCount(r.data.count))
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await axios.post(`${API}/waitlist`, { email: email.trim() });
            if (res.data.already_joined) {
                setStatus('duplicate');
            } else {
                setStatus('success');
                setCount(res.data.count);
            }
        } catch (err) {
            const msg = err?.response?.data?.detail;
            if (typeof msg === 'string') {
                setErrorMsg(msg);
            } else if (Array.isArray(msg)) {
                setErrorMsg(msg[0]?.msg || 'Please enter a valid email.');
            } else {
                setErrorMsg('Something went wrong. Please try again.');
            }
            setStatus('error');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(waitlistUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-dvh bg-aligna-bg flex flex-col overflow-hidden">

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-aligna-primary/8 blur-[100px]" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-aligna-accent/8 blur-[120px]" />
                <div className="absolute top-[45%] left-[35%] w-[300px] h-[300px] rounded-full bg-aligna-primary/5 blur-[60px]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-12 md:py-16">

                {/* Brand */}
                <div className="flex items-center gap-3 mb-10 animate-float-up">
                    <img src="/assets/icons/Lotus.svg" alt="Aligna" className="w-9 h-9 opacity-90" />
                    <span className="font-heading text-3xl text-aligna-text tracking-tight">Aligna</span>
                </div>

                {/* Hero */}
                <div className="text-center mb-10 animate-float-up max-w-md" style={{ animationDelay: '0.05s' }}>
                    <p className="font-body text-xs text-aligna-text-secondary tracking-[0.2em] uppercase mb-4">
                        Coming soon
                    </p>
                    <h1 className="font-heading text-5xl sm:text-6xl text-aligna-text leading-tight mb-4">
                        Manifest with<br />
                        <span className="text-aligna-primary">intention.</span>
                    </h1>
                    <p className="text-aligna-text-secondary font-body text-sm leading-relaxed max-w-xs mx-auto">
                        A daily ritual app built around the <strong className="text-aligna-text">3‑6‑9 method</strong> — write
                        your affirmation morning, midday &amp; night to align your mindset with your deepest goals.
                    </p>
                </div>

                {/* 3-6-9 session cards */}
                <div className="w-full max-w-sm mb-10 animate-float-up" style={{ animationDelay: '0.1s' }}>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: '/assets/icons/Candle.svg',       label: 'Morning', count: '3×', from: 'from-amber-50',  to: 'to-orange-50',  border: 'border-amber-200/60'  },
                            { icon: '/assets/icons/Mindfulness.svg',  label: 'Midday',  count: '6×', from: 'from-teal-50',   to: 'to-cyan-50',    border: 'border-teal-200/60'   },
                            { icon: '/assets/icons/Singing Bowl.svg', label: 'Evening', count: '9×', from: 'from-indigo-50', to: 'to-purple-50',  border: 'border-indigo-200/60' },
                        ].map(item => (
                            <div
                                key={item.label}
                                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-br ${item.from} ${item.to} border ${item.border}`}
                            >
                                <img src={item.icon} alt={item.label} className="w-8 h-8" />
                                <div className="text-center">
                                    <p className="font-heading text-xl text-aligna-accent leading-none">{item.count}</p>
                                    <p className="text-xs font-body text-aligna-text-secondary mt-0.5">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signup card */}
                <div
                    className="w-full max-w-md bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-8 animate-float-up shadow-sm"
                    style={{ animationDelay: '0.15s' }}
                >
                    {status === 'success' || status === 'duplicate' ? (
                        /* --- Success state --- */
                        <div className="text-center py-2">
                            <div className="flex justify-center gap-3 mb-4">
                                {['/assets/icons/Lotus.svg', '/assets/icons/Ajna.svg', '/assets/icons/Hamsa.svg'].map((ic, i) => (
                                    <img key={i} src={ic} alt="" className="w-8 h-8 opacity-80" />
                                ))}
                            </div>
                            <h2 className="font-heading text-2xl text-aligna-text mb-2">
                                {status === 'duplicate' ? 'You\'re already on the list!' : 'You\'re in!'}
                            </h2>
                            <p className="text-aligna-text-secondary font-body text-sm mb-6 leading-relaxed">
                                {status === 'duplicate'
                                    ? 'We already have your email. We\'ll reach out when Aligna launches.'
                                    : `You're #${count} on the waitlist. We'll email you the moment Aligna is live.`
                                }
                            </p>
                            {/* Share nudge */}
                            <p className="text-aligna-text font-body text-xs font-medium mb-3">
                                Share with someone who needs this:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={waitlistUrl}
                                    className="flex-1 bg-aligna-surface-secondary border border-aligna-border rounded-full px-4 py-2.5 font-body text-xs text-aligna-text-secondary truncate"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 bg-aligna-primary text-white font-body text-xs font-medium px-4 py-2.5 rounded-full hover:bg-aligna-primary-hover transition-all duration-300"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* --- Form state --- */
                        <>
                            {count !== null && (
                                <div className="flex items-center justify-center gap-2 mb-5">
                                    <div className="flex -space-x-1.5">
                                        {['/assets/icons/Lotus.svg', '/assets/icons/Ajna.svg', '/assets/icons/Equanimity.svg'].map((ic, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-aligna-surface-secondary border-2 border-aligna-surface flex items-center justify-center">
                                                <img src={ic} alt="" className="w-4 h-4 opacity-70" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="font-body text-xs text-aligna-text-secondary">
                                        <strong className="text-aligna-text">{count.toLocaleString()}</strong> people already waiting
                                    </p>
                                </div>
                            )}

                            <h2 className="font-heading text-xl text-aligna-text text-center mb-1">
                                Be the first to know
                            </h2>
                            <p className="text-aligna-text-secondary font-body text-xs text-center mb-5">
                                Drop your email — we'll reach out the moment we launch.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-aligna-surface-secondary border border-aligna-border rounded-full px-5 py-3.5 font-body text-sm text-aligna-text placeholder-aligna-text-secondary/60 focus:outline-none focus:border-aligna-primary transition-colors"
                                />
                                {status === 'error' && (
                                    <p className="text-center font-body text-xs" style={{ color: '#C67D6F' }}>
                                        {errorMsg}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-aligna-text text-aligna-bg font-body font-medium py-3.5 rounded-full hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <img src="/assets/icons/Lotus.svg" alt="" className="w-4 h-4 animate-soft-pulse invert" />
                                            Joining...
                                        </span>
                                    ) : 'Join the Waitlist'}
                                </button>
                            </form>
                            <p className="text-center font-body text-xs text-aligna-text-secondary mt-3 opacity-70">
                                No spam. Just one email when we launch.
                            </p>
                        </>
                    )}
                </div>

                {/* Feature grid */}
                <div className="w-full max-w-md mb-10 animate-float-up" style={{ animationDelay: '0.2s' }}>
                    <p className="font-body text-xs text-aligna-text-secondary text-center tracking-[0.18em] uppercase mb-4">
                        What's coming
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURES.map(f => (
                            <div
                                key={f.label}
                                className="flex items-start gap-3 bg-aligna-surface border border-aligna-border rounded-2xl p-4"
                            >
                                <img src={f.icon} alt="" className="w-6 h-6 opacity-70 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-body text-sm font-medium text-aligna-text leading-snug">{f.label}</p>
                                    <p className="font-body text-xs text-aligna-text-secondary leading-relaxed mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tagline */}
                <p
                    className="font-heading text-2xl text-aligna-text-secondary text-center mb-10 animate-float-up"
                    style={{ animationDelay: '0.25s' }}
                >
                    Align your mind.<br />
                    <span className="text-aligna-primary">Manifest your life.</span>
                </p>

                {/* Bottom icons */}
                <div className="flex justify-center gap-5 opacity-20 animate-float-up" style={{ animationDelay: '0.3s' }}>
                    {['/assets/icons/Yin Yang.svg', '/assets/icons/Hamsa.svg', '/assets/icons/Lotus.svg', '/assets/icons/Ajna.svg', '/assets/icons/Equanimity.svg'].map((ic, i) => (
                        <img key={i} src={ic} alt="" className="w-5 h-5" />
                    ))}
                </div>

                {/* Legal */}
                <div className="flex gap-4 mt-8 opacity-50">
                    <a href="/terms" className="font-body text-xs text-aligna-text-secondary hover:text-aligna-text transition-colors">Terms</a>
                    <span className="text-aligna-border">·</span>
                    <a href="/privacy" className="font-body text-xs text-aligna-text-secondary hover:text-aligna-text transition-colors">Privacy</a>
                </div>
            </div>
        </div>
    );
};

export default Waitlist;
