import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-aligna-bg flex items-center justify-center">
                <div className="text-center">
                    <img src="/assets/icons/Lotus.svg" alt="Loading" className="w-12 h-12 mx-auto mb-4 animate-soft-pulse" />
                    <p className="text-aligna-text-secondary font-body text-sm">Aligning...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
