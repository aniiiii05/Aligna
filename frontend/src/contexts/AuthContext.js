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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        // Restore Bearer token from localStorage so mobile browsers (iOS Safari,
        // Android Chrome) can authenticate without cross-domain cookies.
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) applyToken(stored);

        try {
            const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
            setUser(res.data);
        } catch {
            // Session expired or invalid — clear stored token
            localStorage.removeItem(TOKEN_KEY);
            applyToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

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
        <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser, storeToken, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
