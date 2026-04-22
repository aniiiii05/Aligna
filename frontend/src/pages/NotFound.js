import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MANI } from '../constants/mascot';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh bg-aligna-bg flex flex-col items-center justify-center px-6 text-center">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-primary/8 blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-accent/8 blur-[80px]" />
            </div>

            <div className="relative z-10 animate-float-up">
                <img
                    src={MANI.sad}
                    alt="Mani is lost"
                    className="w-36 h-36 mx-auto mb-4 drop-shadow-sm"
                />
                <p className="font-heading text-8xl text-aligna-primary/30 leading-none mb-2">404</p>
                <h1 className="font-heading text-3xl text-aligna-text mb-3">Lost in the flow</h1>
                <p className="text-aligna-text-secondary font-body text-sm mb-10 max-w-[260px] mx-auto leading-relaxed">
                    Even Mani can't find this page. Let's bring you back to alignment.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-aligna-primary text-white font-body font-medium py-3.5 px-10 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
