import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, BellOff, Crown, User } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLAN_LABELS = { free: 'Seed (Free)', pro: 'Bloom (Pro)', premium: 'Radiance (Premium)' };

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifStatus, setNotifStatus] = useState(Notification?.permission || 'default');
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        navigate('/login', { replace: true });
    };

    const handleNotifications = async () => {
        if (!('Notification' in window)) {
            alert('Notifications not supported in this browser');
            return;
        }
        if (notifStatus === 'granted') {
            setNotifStatus('denied');
            return;
        }
        const perm = await Notification.requestPermission();
        setNotifStatus(perm);
        if (perm === 'granted') {
            new Notification('Aligna', {
                body: 'You\'ll now receive ritual reminders',
                icon: '/assets/icons/Lotus.svg',
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 md:px-8" data-testid="settings-page">
            <div className="mb-8">
                <h1 className="font-heading text-4xl text-aligna-text">Settings</h1>
            </div>

            {/* Profile Card */}
            <div
                data-testid="profile-card"
                className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-4 animate-float-up"
            >
                <div className="flex items-center gap-4">
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-16 h-16 rounded-full border-2 border-aligna-border"
                            onError={e => { e.target.onerror = null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                        />
                    ) : null}
                    <div
                        className="w-16 h-16 rounded-full bg-aligna-primary/20 items-center justify-center shrink-0"
                        style={{ display: user?.picture ? 'none' : 'flex' }}
                    >
                        <span className="font-heading text-2xl text-aligna-primary leading-none">
                            {(user?.name || 'U')[0].toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="font-heading text-xl text-aligna-text">{user?.name || 'User'}</h2>
                        <p className="text-aligna-text-secondary font-body text-sm">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Subscription Card */}
            <div
                data-testid="subscription-card"
                className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 mb-4 animate-float-up"
                style={{ animationDelay: '0.05s' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-aligna-surface-secondary flex items-center justify-center">
                            <img
                                src={user?.plan === 'premium' ? '/assets/icons/Sahassara.svg' : user?.plan === 'pro' ? '/assets/icons/Hamsa.svg' : '/assets/icons/Lotus.svg'}
                                alt="Plan"
                                className="w-6 h-6"
                            />
                        </div>
                        <div>
                            <p className="font-body text-sm font-medium text-aligna-text">{PLAN_LABELS[user?.plan] || 'Free'}</p>
                            <p className="text-aligna-text-secondary text-xs font-body">Current plan</p>
                        </div>
                    </div>
                    {user?.plan === 'free' && (
                        <button
                            data-testid="upgrade-from-settings-btn"
                            onClick={() => navigate('/upgrade')}
                            className="flex items-center gap-1.5 bg-aligna-primary text-white font-body text-xs font-medium py-2 px-4 rounded-full hover:bg-aligna-primary-hover transition-all"
                        >
                            <Crown size={12} />
                            Upgrade
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications Card */}
            <div
                data-testid="notifications-card"
                className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 mb-4 animate-float-up"
                style={{ animationDelay: '0.1s' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-aligna-surface-secondary flex items-center justify-center">
                            {notifStatus === 'granted' ? (
                                <Bell size={18} className="text-aligna-primary" />
                            ) : (
                                <BellOff size={18} className="text-aligna-text-secondary" />
                            )}
                        </div>
                        <div>
                            <p className="font-body text-sm font-medium text-aligna-text">Ritual Reminders</p>
                            <p className="text-aligna-text-secondary text-xs font-body">
                                {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Blocked in browser' : 'Disabled'}
                            </p>
                        </div>
                    </div>
                    <button
                        data-testid="toggle-notifications-btn"
                        onClick={handleNotifications}
                        disabled={notifStatus === 'denied'}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 disabled:opacity-50 ${
                            notifStatus === 'granted' ? 'bg-aligna-primary' : 'bg-aligna-border'
                        }`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                            notifStatus === 'granted' ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                </div>
            </div>

            {/* 3-6-9 Info Card */}
            <div
                className="bg-aligna-surface-secondary border border-aligna-border rounded-3xl p-5 mb-4 animate-float-up"
                style={{ animationDelay: '0.15s' }}
                data-testid="info-card"
            >
                <div className="flex items-center gap-3 mb-3">
                    <img src="/assets/icons/Book.svg" alt="Method" className="w-6 h-6 opacity-70" />
                    <p className="font-body text-sm font-medium text-aligna-text">The 3-6-9 Method</p>
                </div>
                <div className="space-y-2">
                    {[
                        { icon: '/assets/icons/Candle.svg', session: 'Morning', count: '3×', desc: 'Set the day\'s intention' },
                        { icon: '/assets/icons/Water.svg', session: 'Midday', count: '6×', desc: 'Reinforce the vision' },
                        { icon: '/assets/icons/Singing Bowl.svg', session: 'Evening', count: '9×', desc: 'Anchor it before sleep' },
                    ].map(item => (
                        <div key={item.session} className="flex items-center gap-3">
                            <img src={item.icon} alt={item.session} className="w-5 h-5 opacity-60 shrink-0" />
                            <div className="flex-1">
                                <span className="text-aligna-text font-body text-xs font-medium">{item.session}</span>
                                <span className="text-aligna-text-secondary font-body text-xs ml-2">{item.desc}</span>
                            </div>
                            <span className="text-aligna-accent font-heading text-sm">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Icon attribution */}
            <div className="flex justify-center gap-3 my-4 opacity-30">
                {['/assets/icons/Ajna.svg', '/assets/icons/Manipura.svg', '/assets/icons/Sahassara.svg'].map((icon, i) => (
                    <img key={i} src={icon} alt="" className="w-5 h-5" />
                ))}
            </div>

            {/* Logout */}
            <button
                data-testid="logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 bg-aligna-surface border border-aligna-border text-aligna-error font-body font-medium py-3.5 rounded-full hover:bg-red-50 transition-all duration-300 disabled:opacity-60 animate-float-up"
                style={{ animationDelay: '0.2s' }}
            >
                <LogOut size={16} />
                {loggingOut ? 'Logging out...' : 'Sign Out'}
            </button>
        </div>
    );
};

export default Settings;
