import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const Landing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = () => {
        setLoading(true);
        // Navigate directly to the backend — backend sets the state cookie and
        // redirects to Google in the same request, so the cookie stays same-origin.
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google/login`;
    };

    return (
        <div className="min-h-screen bg-aligna-bg flex flex-col overflow-hidden" data-testid="landing-page">

            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-aligna-primary/8 blur-[80px]" />
                <div className="absolute bottom-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-aligna-accent/8 blur-[100px]" />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-aligna-primary/5 blur-[60px]" />
            </div>

            <div className="flex-1 flex flex-col relative z-10">

                {/* Hero section */}
                <div className="relative w-full overflow-hidden" style={{ height: '45vh', minHeight: '260px', maxHeight: '400px' }}>
                    <img
                        src="/assets/1255.png"
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {/* Multi-layer gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-aligna-bg/40 via-transparent to-aligna-bg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-aligna-bg via-transparent to-transparent" />

                    {/* Brand overlay on hero */}
                    <div className="absolute top-0 left-0 right-0 pt-safe-top pt-8 px-6 flex items-center gap-3 animate-float-up">
                        <img src="/assets/icons/Lotus.svg" alt="Aligna" className="w-8 h-8 opacity-90" />
                        <span className="font-heading text-3xl text-aligna-text tracking-tight">Aligna</span>
                    </div>
                </div>

                {/* Content below hero */}
                <div className="flex-1 flex flex-col items-center px-5 pb-10 -mt-2">

                    {/* Headline */}
                    <div className="text-center mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="font-heading text-3xl sm:text-5xl text-aligna-text leading-tight mb-3">
                            Your complete<br />
                            <span className="text-aligna-primary">manifestation</span> practice
                        </h1>
                        <p className="text-aligna-text-secondary font-body text-sm leading-relaxed max-w-[280px] mx-auto">
                            10 proven techniques — scripting, 3‑6‑9, mirror work, visualisation &amp; more — all in one place
                        </p>
                    </div>

                    {/* Technique preview cards */}
                    <div className="w-full max-w-xs sm:max-w-sm mb-7 animate-float-up" style={{ animationDelay: '0.2s' }}>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '/assets/icons/Candle.svg',        label: '3‑6‑9 Method',     tag: 'Repetition',     color: 'from-amber-50 to-orange-50',  border: 'border-amber-200/60' },
                                { icon: '/assets/icons/Lotus.svg',          label: 'Scripting',        tag: 'Journaling',     color: 'from-rose-50 to-pink-50',     border: 'border-rose-200/60' },
                                { icon: '/assets/icons/Mindfulness.svg',    label: 'Visualisation',    tag: 'Meditation',     color: 'from-teal-50 to-cyan-50',     border: 'border-teal-200/60' },
                                { icon: '/assets/icons/Singing Bowl.svg',   label: 'Mirror Work',      tag: 'Ritual',         color: 'from-indigo-50 to-purple-50', border: 'border-indigo-200/60' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-3 py-3 px-4 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border}`}
                                >
                                    <img src={item.icon} alt={item.label} className="w-7 h-7 shrink-0" />
                                    <div>
                                        <p className="font-body font-medium text-aligna-text text-sm leading-tight">{item.label}</p>
                                        <p className="text-[11px] font-body text-aligna-text-secondary">{item.tag}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-[11px] font-body text-aligna-text-secondary mt-2 opacity-60">+ 6 more techniques inside</p>
                    </div>

                    {/* Benefit pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 animate-float-up" style={{ animationDelay: '0.25s' }}>
                        {['10 techniques', 'Daily rituals', 'Track streaks', 'Grow with intention'].map((b) => (
                            <span key={b} className="text-xs font-body text-aligna-text-secondary bg-aligna-surface border border-aligna-border px-3 py-1.5 rounded-full">
                                {b}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="w-full max-w-sm animate-float-up" style={{ animationDelay: '0.3s' }}>
                        {error && (
                            <p className="text-center text-aligna-error text-xs font-body mb-3">{error}</p>
                        )}
                        <button
                            data-testid="google-login-button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-aligna-text text-aligna-bg font-body font-medium py-4 px-8 rounded-full hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5 shadow-sm disabled:opacity-60"
                        >
                            {loading ? (
                                <img src="/assets/icons/Lotus.svg" alt="" className="w-5 h-5 animate-soft-pulse invert" />
                            ) : (
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" opacity=".9"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity=".9"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity=".9"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity=".9"/>
                                </svg>
                            )}
                            {loading ? 'Connecting...' : 'Continue with Google'}
                        </button>

                        <p className="text-center text-aligna-text-secondary text-xs font-body mt-4 leading-relaxed opacity-70">
                            By continuing, you agree to our{' '}
                            <Link to="/terms" className="underline underline-offset-2 hover:opacity-100 transition-opacity">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="underline underline-offset-2 hover:opacity-100 transition-opacity">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom decorative row */}
            <div className="relative z-10 py-5 flex justify-center gap-5 opacity-20">
                {['/assets/icons/Yin Yang.svg', '/assets/icons/Hamsa.svg', '/assets/icons/Lotus.svg', '/assets/icons/Ajna.svg', '/assets/icons/Equanimity.svg'].map((icon, i) => (
                    <img key={i} src={icon} alt="" className="w-5 h-5" />
                ))}
            </div>
        </div>
    );
};

export default Landing;
