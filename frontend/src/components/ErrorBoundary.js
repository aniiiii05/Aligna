import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Aligna error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-dvh bg-aligna-bg flex flex-col items-center justify-center px-6 text-center">
                    <img src="/assets/icons/Equanimity.svg" alt="" className="w-16 h-16 mb-6 opacity-40" />
                    <h1 className="font-heading text-3xl text-aligna-text mb-3">Something went still</h1>
                    <p className="text-aligna-text-secondary font-body text-sm mb-8 max-w-xs leading-relaxed">
                        A moment of stillness before we continue. Please refresh the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300"
                    >
                        Refresh
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
