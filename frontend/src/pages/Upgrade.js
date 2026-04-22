import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Check } from 'lucide-react';
import { API } from '../lib/api';

const PLANS = [
    {
        id: 'free',
        name: 'Seed',
        price: '$0',
        period: '/forever',
        icon: '/assets/icons/Lotus.svg',
        description: 'Begin your journey',
        features: [
            '1 manifestation goal',
            '3-6-9 daily ritual',
            'Streak tracking',
            'Progress calendar',
        ],
        cta: 'Current Plan',
        accent: 'border-aligna-border',
        tag: null,
    },
    {
        id: 'pro',
        name: 'Bloom',
        price: '$9.99',
        period: '/month',
        icon: '/assets/icons/Hamsa.svg',
        description: 'Expand your vision',
        features: [
            '3 manifestation goals',
            'All Seed features',
            'Priority support',
            'Goal categories',
        ],
        cta: 'Upgrade to Bloom',
        accent: 'border-aligna-primary',
        tag: 'Popular',
    },
    {
        id: 'premium',
        name: 'Radiance',
        price: '$19.99',
        period: '/month',
        icon: '/assets/icons/Sahassara.svg',
        description: 'Unlimited manifestation',
        features: [
            '10 manifestation goals',
            'All Bloom features',
            'Early access to features',
            'Exclusive content',
        ],
        cta: 'Upgrade to Radiance',
        accent: 'border-aligna-accent',
        tag: 'Premium',
    },
];

const Upgrade = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState('');

    // Check for Lemon Squeezy payment return (?checkout=success)
    useEffect(() => {
        if (searchParams.get('checkout') !== 'success') return;
        const initialPlan = user?.plan || 'free';

        setCheckingPayment(true);
        // Poll /auth/me until the plan changes (webhook updates it server-side)
        const pollPlan = async (attempts = 0) => {
            if (attempts >= 15) {
                setCheckingPayment(false);
                setError('Plan not updated yet — your payment may still be processing. Please refresh in a moment.');
                return;
            }
            try {
                const updated = await refreshUser();
                if (updated && updated.plan !== initialPlan) {
                    setCheckingPayment(false);
                    setPaymentSuccess(true);
                } else {
                    setTimeout(() => pollPlan(attempts + 1), 2000);
                }
            } catch {
                setTimeout(() => pollPlan(attempts + 1), 2000);
            }
        };
        // Brief initial delay to let the webhook arrive
        setTimeout(() => pollPlan(), 1500);
    }, []);

    const handleUpgrade = async (planId) => {
        if (planId === 'free' || planId === user?.plan) return;
        setLoading(planId);
        setError('');
        try {
            const res = await axios.post(
                `${API}/payments/checkout`,
                { plan: planId, origin_url: window.location.origin },
                { withCredentials: true }
            );
            window.location.href = res.data.url;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to start checkout. Please try again.');
            setLoading(false);
        }
    };

    if (checkingPayment) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center px-6" data-testid="payment-checking">
                <img src="/assets/icons/Hamsa.svg" alt="Processing" className="w-16 h-16 mb-6 animate-soft-pulse" />
                <h2 className="font-heading text-2xl text-aligna-text mb-2">Verifying your upgrade...</h2>
                <p className="text-aligna-text-secondary font-body text-sm">Please wait while we confirm your payment</p>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center" data-testid="payment-success">
                <div className="w-20 h-20 rounded-full bg-aligna-primary/20 flex items-center justify-center mb-6 animate-glow">
                    <img src="/assets/icons/Sahassara.svg" alt="Success" className="w-12 h-12" />
                </div>
                <h1 className="font-heading text-4xl text-aligna-text mb-3">Welcome to {user?.plan === 'pro' ? 'Bloom' : 'Radiance'}</h1>
                <p className="text-aligna-text-secondary font-body text-sm mb-8 max-w-xs">
                    Your journey expands. New goals await your intention.
                </p>
                <button
                    data-testid="go-to-goals-btn"
                    onClick={() => navigate('/goals')}
                    className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full hover:bg-aligna-primary-hover transition-all"
                >
                    Add New Goals
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 md:px-8" data-testid="upgrade-page">
            {/* Header */}
            <div className="text-center mb-10">
                <img src="/assets/icons/Ajna.svg" alt="Upgrade" className="w-10 h-10 mx-auto mb-4 opacity-70" />
                <h1 className="font-heading text-4xl text-aligna-text mb-2">Choose Your Path</h1>
                <p className="text-aligna-text-secondary font-body text-sm max-w-xs mx-auto">
                    Expand your manifestation practice with more intentions
                </p>
            </div>

            {error && (
                <div data-testid="payment-error" className="mb-6 p-4 bg-red-50 border border-aligna-error/30 rounded-2xl text-center">
                    <p className="text-aligna-error font-body text-sm">{error}</p>
                </div>
            )}

            {/* Plan Cards */}
            <div className="space-y-4 mb-8">
                {PLANS.map((plan, i) => {
                    const isCurrent = user?.plan === plan.id;
                    const isLocked = plan.id === 'free';
                    return (
                        <div
                            key={plan.id}
                            data-testid={`plan-card-${plan.id}`}
                            className={`relative bg-aligna-surface border-2 rounded-3xl p-6 transition-all duration-300 ${plan.accent} ${
                                isCurrent ? 'ring-1 ring-aligna-primary' : ''
                            } animate-float-up`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {plan.tag && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aligna-primary text-white text-xs font-body font-medium px-4 py-1 rounded-full">
                                    {plan.tag}
                                </span>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-aligna-surface-secondary flex items-center justify-center">
                                        <img src={plan.icon} alt={plan.name} className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl text-aligna-text">{plan.name}</h3>
                                        <p className="text-aligna-text-secondary text-xs font-body">{plan.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-heading text-2xl text-aligna-text">{plan.price}</p>
                                    <p className="text-aligna-text-secondary text-xs font-body">{plan.period}</p>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-5">
                                {plan.features.map(feat => (
                                    <li key={feat} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-aligna-primary/20 flex items-center justify-center shrink-0">
                                            <Check size={10} className="text-aligna-primary" />
                                        </div>
                                        <span className="text-aligna-text font-body text-sm">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <div
                                    data-testid={`current-plan-${plan.id}`}
                                    className="w-full text-center py-3 bg-aligna-surface-secondary rounded-full text-aligna-text-secondary font-body text-sm font-medium"
                                >
                                    Current Plan
                                </div>
                            ) : isLocked ? (
                                <div className="w-full text-center py-3 bg-aligna-surface-secondary rounded-full text-aligna-text-secondary font-body text-sm">
                                    Free Forever
                                </div>
                            ) : (
                                <button
                                    data-testid={`upgrade-to-${plan.id}`}
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={!!loading}
                                    className={`w-full py-3 rounded-full font-body font-medium text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 ${
                                        plan.id === 'premium'
                                            ? 'bg-aligna-accent text-white hover:opacity-90'
                                            : 'bg-aligna-primary text-white hover:bg-aligna-primary-hover'
                                    }`}
                                >
                                    {loading === plan.id ? 'Redirecting...' : plan.cta}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Trust indicators */}
            <div className="text-center space-y-2">
                <p className="text-aligna-text-secondary text-xs font-body">Secure payment via Lemon Squeezy · Cancel anytime</p>
                <div className="flex justify-center gap-4">
                    {['/assets/icons/Equanimity.svg', '/assets/icons/Yin Yang.svg'].map((icon, i) => (
                        <img key={i} src={icon} alt="" className="w-5 h-5 opacity-30" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Upgrade;
