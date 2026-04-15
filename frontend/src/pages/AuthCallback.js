import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Handles the OAuth redirect: /auth/callback?token=<session_token>
 *
 * With the Vercel API proxy in place, the OAuth callback goes through
 * alignaa.org/api/auth/google/callback — so the session cookie that Railway
 * sets in that response is stored as a FIRST-PARTY cookie for alignaa.org.
 *
 * This means checkAuth() on the next page load will authenticate via the
 * cookie even if localStorage is unavailable (iOS Safari Private Browsing).
 *
 * Flow:
 *  1. Store token in localStorage (best-effort — safe wrapper handles throws)
 *  2. Hard-redirect to '/' via window.location.replace
 *  3. Fresh page load → checkAuth() → /api/auth/me → authenticated via
 *     first-party cookie or Bearer token from localStorage
 */
const AuthCallback = () => {
    const { storeToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            window.location.replace('/login?error=' + encodeURIComponent(error));
            return;
        }

        // Store token for Bearer auth on future loads (safe even if localStorage
        // is blocked — the first-party session cookie serves as backup).
        if (token) {
            storeToken(token);
        }

        // Hard-redirect so checkAuth() runs fresh with full cookie + token context.
        window.location.replace('/');
    }, []);

    return (
        <div className="min-h-dvh bg-aligna-bg flex flex-col items-center justify-center gap-4">
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
