import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
            navigate('/login', { replace: true });
            return;
        }

        const exchange = async () => {
            try {
                const res = await axios.post(
                    `${API}/auth/session`,
                    { session_id: sessionId },
                    { withCredentials: true }
                );
                setUser(res.data.user);
                navigate('/', { replace: true, state: { user: res.data.user } });
            } catch (err) {
                console.error('Auth callback error:', err);
                navigate('/login', { replace: true });
            }
        };

        exchange();
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen bg-aligna-bg flex items-center justify-center">
            <div className="text-center animate-float-up">
                <img src="/assets/icons/Lotus.svg" alt="Loading" className="w-16 h-16 mx-auto mb-6 animate-soft-pulse" />
                <h2 className="font-heading text-3xl text-aligna-text mb-2">Aligning your space...</h2>
                <p className="text-aligna-text-secondary font-body text-sm">Just a moment</p>
            </div>
        </div>
    );
};

export default AuthCallback;
