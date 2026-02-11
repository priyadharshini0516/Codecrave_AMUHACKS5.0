'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subjectAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardCard, ProgressBar } from '@/components/DashboardComponents';
import {
    Plus,
    Trash2,
    BookOpen,
    Clock,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    X,
    MoreVertical,
    Calendar,
    AlertCircle,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
    _id: string;
    name: string;
    difficulty: number;
    estimatedHours: number;
    completed: boolean;
}

interface Subject {
    _id: string;
    name: string;
    topics: Topic[];
    deadline: string;
    examDate?: string;
    priority: number;
    weightage: number;
}

export default function SubjectsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [newSubject, setNewSubject] = useState({
        name: '',
        deadline: '',
        weightage: 3,
        topics: [{ name: '', difficulty: 5, estimatedHours: 2 }]
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchSubjects();
        }
    }, [user, authLoading, router]);

    const fetchSubjects = async () => {
        try {
            const response = await subjectAPI.getAll();
            setSubjects(response.data.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await subjectAPI.delete(id);
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    const handleMarkTopicComplete = async (subjectId: string, topicId: string) => {
        try {
            await subjectAPI.markTopicComplete(subjectId, topicId);
            fetchSubjects();
        } catch (error) {
            console.error('Error completing topic:', error);
        }
    };

    const handleAddTopicRow = () => {
        setNewSubject({
            ...newSubject,
            topics: [...newSubject.topics, { name: '', difficulty: 5, estimatedHours: 2 }]
        });
    };

    const handleRemoveTopicRow = (index: number) => {
        const updatedTopics = [...newSubject.topics];
        updatedTopics.splice(index, 1);
        setNewSubject({ ...newSubject, topics: updatedTopics });
    };

    const handleTopicChange = (index: number, field: string, value: any) => {
        const updatedTopics = [...newSubject.topics];
        updatedTopics[index] = { ...updatedTopics[index], [field]: value };
        setNewSubject({ ...newSubject, topics: updatedTopics });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await subjectAPI.create(newSubject);
            setShowAddModal(false);
            setNewSubject({
                name: '',
                deadline: '',
                weightage: 3,
                topics: [{ name: '', difficulty: 5, estimatedHours: 2 }]
            });
            fetchSubjects();
        } catch (error) {
            console.error('Error creating subject:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-primary-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Subjects</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your curriculum and track progress for each course.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="accent-gradient text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-transform hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Add Subject
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {subjects.length === 0 ? (
                    <DashboardCard className="py-20 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-primary-blue mx-auto mb-6">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No subjects found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">Start by adding your first subject to begin your academic recovery journey.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-primary-blue font-bold hover:underline"
                        >
                            Add your first subject now →
                        </button>
                    </DashboardCard>
                ) : (
                    subjects.map((subject) => {
                        const completedCount = subject.topics.filter(t => t.completed).length;
                        const totalTopics = subject.topics.length;
                        const progress = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;
                        const isExpanded = expandedSubject === subject._id;

                        return (
                            <div
                                key={subject._id}
                                className={cn(
                                    "glass-card overflow-hidden transition-all duration-300",
                                    isExpanded ? "ring-2 ring-primary-blue/10" : "hover:border-blue-100"
                                )}
                            >
                                <div
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedSubject(isExpanded ? null : subject._id)}
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-blue shrink-0">
                                            <BookOpen size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                                                <span className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-primary-blue uppercase tracking-wider">
                                                    Weightage {subject.weightage}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 mt-2">
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Calendar size={14} />
                                                    <span className="text-xs font-semibold">Deadline: {new Date(subject.deadline).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock size={14} />
                                                    <span className="text-xs font-semibold">{totalTopics} Topics</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-48 hidden md:block">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                                                <span className="text-[11px] font-bold text-primary-blue">{Math.round(progress)}%</span>
                                            </div>
                                            <ProgressBar value={completedCount} max={totalTopics} color="bg-primary-blue" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-8">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSubject(subject._id);
                                            }}
                                            className="p-2.5 text-gray-400 hover:text-critical hover:bg-critical-light rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <div className="text-gray-300">
                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-50 bg-gray-50/30 p-8 animate-slide-down">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Info size={16} className="text-primary-blue" />
                                                Study Topics Breakdown
                                            </h4>
                                        </div>

                                        <div className="space-y-4">
                                            {subject.topics.map((topic) => (
                                                <div
                                                    key={topic._id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border bg-white transition-all shadow-sm",
                                                        topic.completed ? "border-success/20 bg-success-light/30" : "border-gray-100 hover:border-blue-100"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                                            topic.completed ? "bg-success text-white" : "bg-gray-50 text-gray-300"
                                                        )}>
                                                            {topic.completed ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className={cn("font-bold", topic.completed ? "text-success" : "text-gray-900")}>
                                                                {topic.name}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Difficulty {topic.difficulty}/10</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">•</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{topic.estimatedHours}h estimate</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!topic.completed && (
                                                        <button
                                                            onClick={() => handleMarkTopicComplete(subject._id, topic._id)}
                                                            className="px-4 py-2 bg-white border border-gray-100 text-gray-900 text-xs font-bold rounded-xl hover:bg-success hover:text-white hover:border-success transition-all shadow-sm"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add New Subject</h2>
                                <p className="text-sm text-gray-500 mt-1">Initialize another node in your recovery graph.</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        className="w-full bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue/30 transition-all font-medium"
                                        placeholder="e.g., Computer Architecture"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Target Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        value={newSubject.deadline}
                                        onChange={(e) => setNewSubject({ ...newSubject, deadline: e.target.value })}
                                        className="w-full bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue/30 transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                                        Subject Weightage
                                        <span className="text-primary-blue">{newSubject.weightage}/5</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={newSubject.weightage}
                                        onChange={(e) => setNewSubject({ ...newSubject, weightage: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium italic">Higher weightage prioritizes this subject in the recovery algorithm.</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">Topic Breakdown</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddTopicRow}
                                        className="text-xs font-bold text-primary-blue hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Topic
                                    </button>
                                </div>

                                {newSubject.topics.map((topic, index) => (
                                    <div key={index} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-1">
                                                <input
                                                    type="text"
                                                    required
                                                    value={topic.name}
                                                    onChange={(e) => handleTopicChange(index, 'name', e.target.value)}
                                                    className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 text-sm outline-none focus:border-primary-blue/30"
                                                    placeholder="Topic name"
                                                />
                                            </div>
                                            {newSubject.topics.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTopicRow(index)}
                                                    className="p-2 text-gray-300 hover:text-critical transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Difficulty (1-10)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={topic.difficulty}
                                                    onChange={(e) => handleTopicChange(index, 'difficulty', parseInt(e.target.value))}
                                                    className="w-full bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Est. Hours</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0.5"
                                                    value={topic.estimatedHours}
                                                    onChange={(e) => handleTopicChange(index, 'estimatedHours', parseFloat(e.target.value))}
                                                    className="w-full bg-white px-4 py-2 rounded-xl border border-gray-100 text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 accent-gradient text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Initialize Subject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-8 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
