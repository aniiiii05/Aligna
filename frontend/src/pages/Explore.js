import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Clock, Zap } from 'lucide-react';
import { TECHNIQUES, DIFFICULTY_COLORS, CATEGORY_LABELS } from '../constants/techniques';

const FILTERS = ['All', 'Repetition', 'Journaling', 'Visualization', 'Ritual'];

const TechniqueSheet = ({ technique, onClose, onUse }) => (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg bg-aligna-surface rounded-t-3xl md:rounded-3xl max-h-[85vh] flex flex-col shadow-xl animate-float-up">
            {/* Header */}
            <div className={`rounded-t-3xl md:rounded-t-3xl bg-gradient-to-br ${technique.color.card} p-6 border-b ${technique.color.border} shrink-0`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <img src={technique.icon} alt={technique.name} className="w-7 h-7" />
                        </div>
                        <div>
                            <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[technique.difficulty]}`}>
                                {technique.difficulty}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors">
                        <X size={16} className="text-aligna-text" />
                    </button>
                </div>
                <h2 className="font-heading text-3xl text-aligna-text mb-1">{technique.name}</h2>
                <p className="font-body text-sm text-aligna-text-secondary italic">{technique.tagline}</p>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-aligna-text-secondary">
                        <Clock size={13} />
                        <span className="font-body text-xs">{technique.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-aligna-text-secondary">
                        <Zap size={13} />
                        <span className="font-body text-xs">{CATEGORY_LABELS[technique.category]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-aligna-text-secondary">
                        <img src="/assets/icons/Mindfulness.svg" alt="" className="w-3.5 h-3.5 opacity-60" />
                        <span className="font-body text-xs">{technique.sessions.length} session{technique.sessions.length > 1 ? 's' : ''}/day</span>
                    </div>
                </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Description */}
                <p className="font-body text-sm text-aligna-text leading-relaxed">{technique.description}</p>

                {/* Benefits */}
                <div>
                    <p className="font-body text-xs font-medium text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">Benefits</p>
                    <div className="space-y-2">
                        {technique.benefits.map((b, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <img src="/assets/icons/Lotus.svg" alt="" className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                                <p className="font-body text-sm text-aligna-text leading-relaxed">{b}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How To */}
                <div>
                    <p className="font-body text-xs font-medium text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">How To Practice</p>
                    <div className="space-y-2">
                        {technique.howTo.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="font-heading text-lg text-aligna-accent leading-none shrink-0 w-5">{i + 1}</span>
                                <p className="font-body text-sm text-aligna-text leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sessions */}
                <div>
                    <p className="font-body text-xs font-medium text-aligna-text-secondary tracking-[0.15em] uppercase mb-3">Daily Sessions</p>
                    <div className="space-y-2">
                        {technique.sessions.map(s => (
                            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br ${technique.color.card} border ${technique.color.border}`}>
                                <img src={s.icon} alt={s.label} className="w-7 h-7 opacity-80" />
                                <div className="flex-1">
                                    <p className="font-body text-sm font-medium text-aligna-text">{s.label}</p>
                                    <p className="font-body text-xs text-aligna-text-secondary">{s.subtitle}</p>
                                </div>
                                <span className="font-heading text-lg text-aligna-accent">
                                    {s.type === 'freeform' ? '✍️' : `${s.count}×`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="p-5 border-t border-aligna-border shrink-0">
                <button
                    onClick={() => onUse(technique.id)}
                    className="w-full flex items-center justify-center gap-2 bg-aligna-text text-aligna-bg font-body font-medium py-4 rounded-full hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5"
                >
                    Use This Technique
                    <ArrowRight size={17} />
                </button>
            </div>
        </div>
    </div>
);

const Explore = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const [selected, setSelected] = useState(null);

    const filtered = activeFilter === 'All'
        ? TECHNIQUES
        : TECHNIQUES.filter(t => CATEGORY_LABELS[t.category] === activeFilter);

    const handleUse = (techniqueId) => {
        navigate('/goals', { state: { techniqueId } });
    };

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 md:px-8">
            {/* Header */}
            <div className="mb-7 animate-float-up">
                <p className="text-aligna-text-secondary text-xs font-body tracking-[0.18em] uppercase mb-1">Your Practice</p>
                <h1 className="font-heading text-4xl text-aligna-text">Explore</h1>
                <p className="text-aligna-text-secondary font-body text-sm mt-1 leading-relaxed">
                    10 proven manifestation techniques — find the practice that resonates with you.
                </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide animate-float-up" style={{ animationDelay: '0.05s' }}>
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`shrink-0 px-4 py-2 rounded-full font-body text-sm transition-all duration-200 ${
                            activeFilter === f
                                ? 'bg-aligna-text text-aligna-bg'
                                : 'bg-aligna-surface border border-aligna-border text-aligna-text-secondary hover:border-aligna-primary/40'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Technique grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((t, i) => (
                    <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={`text-left rounded-3xl p-5 bg-gradient-to-br ${t.color.card} border ${t.color.border} hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 animate-float-up`}
                        style={{ animationDelay: `${i * 0.04}s` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
                                <img src={t.icon} alt={t.name} className="w-7 h-7" />
                            </div>
                            <span className={`text-[10px] font-body font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[t.difficulty]}`}>
                                {t.difficulty}
                            </span>
                        </div>
                        <h3 className="font-heading text-xl text-aligna-text leading-tight mb-1">{t.name}</h3>
                        <p className="font-body text-xs text-aligna-text-secondary italic mb-3 leading-relaxed">{t.tagline}</p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-aligna-text-secondary">
                                <Clock size={11} />
                                <span className="font-body text-[11px]">{t.duration}</span>
                            </div>
                            <span className="text-aligna-border">·</span>
                            <span className="font-body text-[11px] text-aligna-text-secondary">
                                {t.sessions.length}× daily
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Bottom hint */}
            <p className="text-center font-body text-xs text-aligna-text-secondary mt-8 opacity-60 animate-float-up">
                Tap any technique to learn more and start practicing
            </p>

            {/* Detail sheet */}
            {selected && (
                <TechniqueSheet
                    technique={selected}
                    onClose={() => setSelected(null)}
                    onUse={handleUse}
                />
            )}
        </div>
    );
};

export default Explore;
