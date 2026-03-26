import React from 'react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const Landing = () => {
    const handleGoogleLogin = () => {
        const redirectUrl = window.location.origin + '/';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    return (
        <div className="min-h-screen bg-aligna-bg flex flex-col" data-testid="landing-page">
            {/* Background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full bg-aligna-primary/10 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-aligna-accent/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-aligna-primary/5 blur-2xl" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                {/* Brand */}
                <div className="text-center mb-10 animate-float-up">
                    <div className="flex items-center justify-center mb-6">
                        <img
                            src="/assets/icons/Lotus.svg"
                            alt="Aligna"
                            className="w-14 h-14 mr-3"
                        />
                        <h1 className="font-heading text-5xl text-aligna-text tracking-tight">Aligna</h1>
                    </div>
                    <p className="text-aligna-text-secondary font-body text-base leading-relaxed max-w-xs">
                        Manifest with intention through the ancient power of the 3-6-9 method
                    </p>
                </div>

                {/* Hero Image */}
                <div className="w-full max-w-sm mb-10 animate-float-up" style={{ animationDelay: '0.1s' }}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-aligna-bg via-transparent to-aligna-bg z-10" />
                        <img
                            src="/assets/1255.png"
                            alt="Manifestation"
                            className="w-full h-48 object-cover rounded-3xl opacity-70"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="w-full max-w-sm mb-10 animate-float-up" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { icon: '/assets/icons/Candle.svg', label: 'Morning ritual', sub: '3×' },
                            { icon: '/assets/icons/Mindfulness.svg', label: 'Midday ritual', sub: '6×' },
                            { icon: '/assets/icons/Singing Bowl.svg', label: 'Evening ritual', sub: '9×' },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-2xl bg-aligna-surface border border-aligna-border flex items-center justify-center">
                                    <img src={item.icon} alt={item.label} className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-body text-aligna-text-secondary">{item.label}</p>
                                    <p className="text-sm font-heading text-aligna-accent font-medium">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="w-full max-w-sm animate-float-up" style={{ animationDelay: '0.3s' }}>
                    <button
                        data-testid="google-login-button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-aligna-primary text-white font-body font-medium py-4 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity="0.9"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity="0.9"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" fillOpacity="0.9"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" fillOpacity="0.9"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-aligna-text-secondary text-xs font-body mt-4 leading-relaxed">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            {/* Bottom icons row */}
            <div className="py-6 flex justify-center gap-4 opacity-30">
                {['/assets/icons/Yin Yang.svg', '/assets/icons/Hamsa.svg', '/assets/icons/Ajna.svg', '/assets/icons/Equanimity.svg'].map((icon, i) => (
                    <img key={i} src={icon} alt="" className="w-6 h-6" />
                ))}
            </div>
        </div>
    );
};

export default Landing;
