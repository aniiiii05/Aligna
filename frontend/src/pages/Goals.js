import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit2, X, Check, Lock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLAN_LIMITS = { free: 1, pro: 3, premium: 10 };
const CATEGORIES = [
    { id: 'general', label: 'General', icon: '/assets/icons/Lotus.svg' },
    { id: 'abundance', label: 'Abundance', icon: '/assets/icons/Manipura.svg' },
    { id: 'health', label: 'Health', icon: '/assets/icons/Yoga.svg' },
    { id: 'love', label: 'Love', icon: '/assets/icons/Hamsa.svg' },
    { id: 'clarity', label: 'Clarity', icon: '/assets/icons/Ajna.svg' },
    { id: 'peace', label: 'Peace', icon: '/assets/icons/Equanimity.svg' },
];

const GoalModal = ({ goal, onSave, onClose }) => {
    const [title, setTitle] = useState(goal?.title || '');
    const [affirmation, setAffirmation] = useState(goal?.affirmation || '');
    const [category, setCategory] = useState(goal?.category || 'general');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!title.trim() || !affirmation.trim()) {
            setError('Please fill in both fields');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await onSave({ title: title.trim(), affirmation: affirmation.trim(), category });
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" data-testid="goal-modal">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg bg-aligna-surface rounded-t-3xl md:rounded-3xl p-6 shadow-xl animate-float-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-2xl text-aligna-text">{goal ? 'Edit Goal' : 'New Intention'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-aligna-surface-secondary transition-colors">
                        <X size={18} className="text-aligna-text-secondary" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-2">Goal Title</label>
                        <input
                            data-testid="goal-title-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Financial Freedom"
                            className="w-full ritual-input px-4 py-3 font-body text-aligna-text placeholder-aligna-text-secondary/50 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-2">Affirmation</label>
                        <textarea
                            data-testid="goal-affirmation-input"
                            value={affirmation}
                            onChange={e => setAffirmation(e.target.value)}
                            placeholder="e.g., I am a money magnet and wealth flows to me easily"
                            rows={3}
                            className="w-full ritual-input px-4 py-3 font-body text-aligna-text placeholder-aligna-text-secondary/50 text-sm resize-none"
                        />
                        <p className="text-aligna-text-secondary text-xs mt-1 font-body">Write in present tense, as if it's already true</p>
                    </div>

                    <div>
                        <label className="block text-xs font-body text-aligna-text-secondary tracking-[0.15em] uppercase mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    data-testid={`category-${cat.id}`}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body border transition-all duration-200 ${
                                        category === cat.id
                                            ? 'bg-aligna-primary text-white border-aligna-primary'
                                            : 'bg-aligna-surface-secondary text-aligna-text-secondary border-aligna-border'
                                    }`}
                                >
                                    <img src={cat.icon} alt={cat.label} className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-aligna-error text-sm font-body" data-testid="goal-error">{error}</p>
                    )}

                    <button
                        data-testid="save-goal-btn"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-aligna-primary text-white font-body font-medium py-3.5 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : goal ? 'Save Changes' : 'Create Intention'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Goals = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editGoal, setEditGoal] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const limit = PLAN_LIMITS[user?.plan] || 1;
    const atLimit = goals.length >= limit;

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await axios.get(`${API}/goals`, { withCredentials: true });
            setGoals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        if (editGoal) {
            await axios.put(`${API}/goals/${editGoal.goal_id}`, data, { withCredentials: true });
        } else {
            await axios.post(`${API}/goals`, data, { withCredentials: true });
        }
        setEditGoal(null);
        fetchGoals();
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm('Remove this intention?')) return;
        setDeleting(goalId);
        try {
            await axios.delete(`${API}/goals/${goalId}`, { withCredentials: true });
            fetchGoals();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const getCategoryInfo = (cat) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[0];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <img src="/assets/icons/Lotus.svg" alt="Loading" className="w-10 h-10 animate-soft-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-6 md:px-8" data-testid="goals-page">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-aligna-text-secondary text-xs font-body tracking-[0.15em] uppercase mb-1">My Manifestations</p>
                    <h1 className="font-heading text-4xl text-aligna-text">Goals</h1>
                    <p className="text-aligna-text-secondary text-sm font-body mt-1">{goals.length}/{limit} intentions set</p>
                </div>
                {!atLimit ? (
                    <button
                        data-testid="add-goal-btn"
                        onClick={() => { setEditGoal(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-aligna-primary text-white font-body text-sm font-medium py-2.5 px-5 rounded-full hover:bg-aligna-primary-hover transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                ) : (
                    <button
                        data-testid="upgrade-prompt-btn"
                        onClick={() => navigate('/upgrade')}
                        className="flex items-center gap-2 bg-aligna-accent text-white font-body text-sm font-medium py-2.5 px-5 rounded-full hover:opacity-90 transition-all duration-300"
                    >
                        <Lock size={14} />
                        Upgrade
                    </button>
                )}
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="text-center py-16 animate-float-up" data-testid="empty-goals-state">
                    <img src="/assets/illustrations/mental health problems-02.svg" alt="Empty" className="w-36 h-36 mx-auto mb-6 opacity-60" />
                    <h2 className="font-heading text-2xl text-aligna-text mb-2">No intentions yet</h2>
                    <p className="text-aligna-text-secondary font-body text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                        Create your first manifestation goal and begin your 3-6-9 ritual journey
                    </p>
                    <button
                        data-testid="create-goal-empty-btn"
                        onClick={() => setShowModal(true)}
                        className="bg-aligna-primary text-white font-body font-medium py-3 px-8 rounded-full hover:bg-aligna-primary-hover transition-all duration-300"
                    >
                        Set Your Intention
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map((goal, i) => {
                        const catInfo = getCategoryInfo(goal.category);
                        return (
                            <div
                                key={goal.goal_id}
                                data-testid={`goal-card-${goal.goal_id}`}
                                className="bg-aligna-surface border border-aligna-border rounded-3xl p-5 hover:border-aligna-accent/30 transition-all duration-300 hover:-translate-y-0.5 animate-float-up"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-aligna-surface-secondary flex items-center justify-center shrink-0">
                                        <img src={catInfo.icon} alt={catInfo.label} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-heading text-xl text-aligna-text leading-tight">{goal.title}</h3>
                                            <span className="text-[10px] font-body text-aligna-text-secondary bg-aligna-surface-secondary px-2 py-0.5 rounded-full capitalize">{goal.category}</span>
                                        </div>
                                        <p className="text-aligna-text-secondary font-body text-sm italic leading-relaxed line-clamp-2">
                                            "{goal.affirmation}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            data-testid={`edit-goal-${goal.goal_id}`}
                                            onClick={() => { setEditGoal(goal); setShowModal(true); }}
                                            className="p-2 rounded-full hover:bg-aligna-surface-secondary transition-colors"
                                        >
                                            <Edit2 size={15} className="text-aligna-text-secondary" />
                                        </button>
                                        <button
                                            data-testid={`delete-goal-${goal.goal_id}`}
                                            onClick={() => handleDelete(goal.goal_id)}
                                            disabled={deleting === goal.goal_id}
                                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={15} className="text-aligna-error" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-aligna-border flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {['morning', 'midday', 'night'].map(s => (
                                            <span key={s} className="text-[10px] font-body text-aligna-text-secondary bg-aligna-surface-secondary px-2 py-0.5 rounded-full capitalize">{s}</span>
                                        ))}
                                    </div>
                                    <button
                                        data-testid={`start-ritual-${goal.goal_id}`}
                                        onClick={() => navigate('/ritual', { state: { goalId: goal.goal_id } })}
                                        className="text-xs font-body text-aligna-primary font-medium hover:underline"
                                    >
                                        Start ritual →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upgrade Notice */}
            {atLimit && user?.plan === 'free' && (
                <div
                    data-testid="upgrade-notice"
                    className="mt-6 p-5 bg-aligna-accent/10 border border-aligna-accent/30 rounded-3xl text-center animate-float-up"
                >
                    <img src="/assets/icons/Hamsa.svg" alt="Upgrade" className="w-8 h-8 mx-auto mb-2 opacity-70" />
                    <p className="font-heading text-lg text-aligna-text mb-1">Expand your vision</p>
                    <p className="text-aligna-text-secondary text-sm font-body mb-4">Upgrade to Pro for 3 intentions, or Premium for 10</p>
                    <button
                        data-testid="upgrade-from-goals-btn"
                        onClick={() => navigate('/upgrade')}
                        className="bg-aligna-accent text-white font-body text-sm font-medium py-2.5 px-6 rounded-full hover:opacity-90 transition-all"
                    >
                        View Plans
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <GoalModal
                    goal={editGoal}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditGoal(null); }}
                />
            )}
        </div>
    );
};

export default Goals;
