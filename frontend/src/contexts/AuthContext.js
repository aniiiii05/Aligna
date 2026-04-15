import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aligna_session';

// Safe localStorage wrapper — iOS Safari Private Browsing throws QuotaExceededError
// on setItem and SecurityError on some older versions. Never let storage errors
// crash the app; the session cookie (set via Vercel proxy) acts as a backup.
const storage = {
    get: (key) => {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    set: (key, val) => {
        try { localStorage.setItem(key, val); } catch { /* ignored */ }
    },
    remove: (key) => {
        try { localStorage.removeItem(key); } catch { /* ignored */ }
    },
};

const applyToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const AuthProvider = ({ children }) => {
    const onCallbackPage = window.location.pathname.startsWith('/auth/callback');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!onCallbackPage);

    const checkAuth = useCallback(async () => {
        const tokenAtStart = storage.get(TOKEN_KEY);
        if (tokenAtStart) applyToken(tokenAtStart);

        try {
            const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
            setUser(res.data);
        } catch {
            const tokenNow = storage.get(TOKEN_KEY);
            const tokenChanged = tokenNow && tokenNow !== tokenAtStart;
            if (!tokenChanged) {
                if (tokenAtStart) storage.remove(TOKEN_KEY);
                applyToken(null);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (onCallbackPage) return;
        checkAuth();
    }, [checkAuth, onCallbackPage]);

    // iOS Safari BFCache: when Safari restores a page from its back-forward
    // cache, React effects don't re-run. Re-running checkAuth on pageshow
    // picks up any token/cookie stored during the OAuth callback.
    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted && !onCallbackPage) {
                checkAuth();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [checkAuth, onCallbackPage]);

    const storeToken = useCallback((token) => {
        storage.set(TOKEN_KEY, token);
        applyToken(token);
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch {}
        storage.remove(TOKEN_KEY);
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
