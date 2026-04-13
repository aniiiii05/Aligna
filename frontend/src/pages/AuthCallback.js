import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Landing page for the OAuth redirect from the backend.
 * URL: /auth/callback?token=<session_token>
 *
 * Flow:
 *  1. Read token from URL
 *  2. Store in localStorage + set axios Authorization header
 *  3. Call /api/auth/me to validate and load the user
 *  4. Navigate to home (or back to login if it fails)
 *
 * Why this exists: mobile browsers (iOS Safari, Android Chrome) block
 * cross-domain SameSite=None cookies, so we pass the session token
 * through the URL instead of relying on cookie forwarding.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const { storeToken, refreshUser, setLoading } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            setLoading(false);
            navigate('/login?error=' + error, { replace: true });
            return;
        }

        if (token) {
            storeToken(token);
        }

        refreshUser().then((userData) => {
            setLoading(false);
            if (userData) {
                navigate('/', { replace: true });
            } else {
                navigate('/login?error=auth_failed', { replace: true });
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-aligna-bg flex flex-col items-center justify-center gap-4">
            <img
                src="/assets/icons/Lotus.svg"
                alt="Aligna"
                className="w-14 h-14 animate-soft-pulse"
            />
            <p className="text-aligna-text-secondary font-body text-sm tracking-wide">
                Signing you in...
            </p>
        </div>
    );
};

export default AuthCallback;
