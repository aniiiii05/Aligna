import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Handles the OAuth redirect from the backend.
 * The backend sends: /auth/callback?token=<session_token>
 *
 * This page:
 *  1. Reads the token from the URL query param
 *  2. Stores it in localStorage and sets the axios Authorization header
 *  3. Refreshes auth state so the app knows the user is logged in
 *  4. Redirects to home
 *
 * This is necessary for mobile browsers (iOS Safari ITP, Android Chrome)
 * that block cross-domain SameSite=None cookies.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const { storeToken, refreshUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            navigate('/login?error=' + error, { replace: true });
            return;
        }

        if (token) {
            storeToken(token);
        }

        refreshUser().then((userData) => {
            if (userData) {
                navigate('/', { replace: true });
            } else {
                navigate('/login?error=auth_failed', { replace: true });
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-aligna-bg flex flex-col items-center justify-center gap-3">
            <img
                src="/assets/icons/Lotus.svg"
                alt="Aligna"
                className="w-12 h-12 animate-soft-pulse"
            />
            <p className="text-aligna-text-secondary font-body text-sm">Signing you in...</p>
        </div>
    );
};

export default AuthCallback;
