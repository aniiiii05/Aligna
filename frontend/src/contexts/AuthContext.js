import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;
const AuthContext = createContext(null);

const TOKEN_KEY = 'aligna_session';

const applyToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const AuthProvider = ({ children }) => {
    // On the /auth/callback route we skip the loading state — AuthCallback owns it.
    const onCallbackPage = window.location.pathname.startsWith('/auth/callback');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!onCallbackPage);

    const checkAuth = useCallback(async () => {
        const tokenAtStart = localStorage.getItem(TOKEN_KEY);
        if (tokenAtStart) applyToken(tokenAtStart);

        try {
            const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
            setUser(res.data);
        } catch {
            // Guard against the OAuth callback race condition:
            // AuthCallback may have stored a fresh token while this request was
            // in flight (with no token). If the token changed, don't wipe it.
            const tokenNow = localStorage.getItem(TOKEN_KEY);
            const tokenChanged = tokenNow && tokenNow !== tokenAtStart;
            if (!tokenChanged) {
                if (tokenAtStart) localStorage.removeItem(TOKEN_KEY);
                applyToken(null);
                setUser(null);
            }
            // If token was just stored by AuthCallback, leave user/token alone —
            // AuthCallback's refreshUser() call will set the user correctly.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Skip on the OAuth callback page — AuthCallback handles auth setup there.
        if (onCallbackPage) return;
        checkAuth();
    }, [checkAuth, onCallbackPage]);

    const storeToken = useCallback((token) => {
        localStorage.setItem(TOKEN_KEY, token);
        applyToken(token);
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch {}
        localStorage.removeItem(TOKEN_KEY);
        applyToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
            setUser(res.data);
            return res.data;
        } catch {
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, logout, refreshUser, storeToken, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
