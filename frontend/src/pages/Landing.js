import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const Landing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API}/auth/google/login`);
            window.location.href = res.data.url;
        } catch {
            setError('Could not connect to server. Please try again.');
            setLoading(false);
        }
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
                <div className="relative w-full overflow-hidden" style={{ height: '52vh', minHeight: '300px' }}>
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
                <div className="flex-1 flex flex-col items-center px-6 pb-8 -mt-2">

                    {/* Headline */}
                    <div className="text-center mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="font-heading text-4xl sm:text-5xl text-aligna-text leading-tight mb-3">
                            Manifest with<br />
                            <span className="text-aligna-primary">intention</span>
                        </h1>
                        <p className="text-aligna-text-secondary font-body text-sm leading-relaxed max-w-[280px] mx-auto">
                            The 3‑6‑9 method — write your affirmation morning, midday &amp; night to align your reality
                        </p>
                    </div>

                    {/* 3-6-9 ritual cards */}
                    <div className="w-full max-w-sm mb-8 animate-float-up" style={{ animationDelay: '0.2s' }}>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: '/assets/icons/Candle.svg', label: 'Morning', count: '3×', color: 'from-amber-50 to-orange-50', border: 'border-amber-200/60' },
                                { icon: '/assets/icons/Mindfulness.svg', label: 'Midday', count: '6×', color: 'from-teal-50 to-cyan-50', border: 'border-teal-200/60' },
                                { icon: '/assets/icons/Singing Bowl.svg', label: 'Evening', count: '9×', color: 'from-indigo-50 to-purple-50', border: 'border-indigo-200/60' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border}`}
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

                    {/* Benefit pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 animate-float-up" style={{ animationDelay: '0.25s' }}>
                        {['Build daily streaks', 'Track your journey', 'Grow with intention'].map((b) => (
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
