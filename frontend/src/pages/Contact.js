import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock } from 'lucide-react';

const Contact = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const email = 'alignaa.io@gmail.com';

    const handleCopy = () => {
        navigator.clipboard.writeText(email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleEmail = () => {
        window.location.href = `mailto:${email}?subject=Aligna Support`;
    };

    return (
        <div className="min-h-screen bg-aligna-bg">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-primary/6 blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-aligna-accent/6 blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-5 py-8 md:px-8">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-aligna-text-secondary hover:text-aligna-text transition-colors mb-8 font-body text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Header */}
                <div className="mb-10 animate-float-up">
                    <div className="flex items-center gap-3 mb-4">
                        <img src="/assets/icons/Greeting Card.svg" alt="" className="w-8 h-8 opacity-60" />
                        <span className="font-body text-xs text-aligna-text-secondary tracking-[0.18em] uppercase">Support</span>
                    </div>
                    <h1 className="font-heading text-4xl text-aligna-text mb-2">Get in Touch</h1>
                    <p className="text-aligna-text-secondary font-body text-sm leading-relaxed max-w-sm">
                        Have a question, issue, or feedback? We'd love to hear from you.
                    </p>
                </div>

                {/* Email card */}
                <div
                    className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 mb-4 animate-float-up"
                    style={{ animationDelay: '0.05s' }}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-aligna-primary/10 flex items-center justify-center shrink-0">
                            <Mail size={20} className="text-aligna-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-body text-sm font-medium text-aligna-text mb-0.5">Email Support</p>
                            <p className="text-aligna-text-secondary font-body text-xs mb-4">
                                Send us an email and we'll get back to you within 24–48 hours.
                            </p>
                            <p className="font-body text-sm text-aligna-primary font-medium mb-4 break-all">{email}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleEmail}
                                    className="flex-1 bg-aligna-primary text-white font-body text-sm font-medium py-2.5 rounded-full hover:bg-aligna-primary-hover transition-all duration-300"
                                >
                                    Send Email
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="px-5 bg-aligna-surface-secondary text-aligna-text font-body text-sm py-2.5 rounded-full hover:bg-aligna-border transition-all duration-300"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response time */}
                <div
                    className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 mb-4 animate-float-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-aligna-accent/10 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-aligna-accent" />
                        </div>
                        <div>
                            <p className="font-body text-sm font-medium text-aligna-text">Response Time</p>
                            <p className="text-aligna-text-secondary font-body text-xs">
                                We typically reply within 24–48 hours on business days.
                            </p>
                        </div>
                    </div>
                </div>

                {/* What to include */}
                <div
                    className="bg-aligna-surface-secondary border border-aligna-border rounded-3xl p-5 mb-8 animate-float-up"
                    style={{ animationDelay: '0.15s' }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <MessageCircle size={16} className="text-aligna-text-secondary shrink-0" />
                        <p className="font-body text-sm font-medium text-aligna-text">When reaching out, include:</p>
                    </div>
                    <ul className="space-y-1.5">
                        {[
                            'The email address linked to your Aligna account',
                            'A clear description of the issue or question',
                            'Any relevant screenshots if it\'s a visual issue',
                            'For billing: your order confirmation number',
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-aligna-primary font-body text-xs mt-0.5 shrink-0">·</span>
                                <span className="text-aligna-text-secondary font-body text-xs leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal links */}
                <div className="flex justify-center gap-4 pb-4">
                    <Link to="/terms" className="text-aligna-text-secondary font-body text-xs hover:text-aligna-text transition-colors">Terms of Service</Link>
                    <span className="text-aligna-border">·</span>
                    <Link to="/privacy" className="text-aligna-text-secondary font-body text-xs hover:text-aligna-text transition-colors">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
};

export default Contact;
