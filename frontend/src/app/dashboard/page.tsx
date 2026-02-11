'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subjectAPI, planAPI } from '@/lib/api';

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
}

interface Session {
    _id: string;
    subject: Subject;
    topic: string;
    startTime: string;
    endTime: string;
    duration: number;
    completed: boolean;
}

interface DaySchedule {
    date: string;
    sessions: Session[];
}

interface RecoveryPlan {
    _id: string;
    startDate: string;
    endDate: string;
    schedule: DaySchedule[];
    status: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, loading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [plan, setPlan] = useState<RecoveryPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '',
        deadline: '',
        topics: [{ name: '', difficulty: 5, estimatedHours: 2 }],
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        try {
            const [subjectsRes, planRes] = await Promise.allSettled([
                subjectAPI.getAll(),
                planAPI.getActive(),
            ]);

            if (subjectsRes.status === 'fulfilled') {
                setSubjects(subjectsRes.value.data.data);
            }

            if (planRes.status === 'fulfilled') {
                setPlan(planRes.value.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await subjectAPI.create(newSubject);
            setShowAddSubject(false);
            setNewSubject({
                name: '',
                deadline: '',
                topics: [{ name: '', difficulty: 5, estimatedHours: 2 }],
            });
            fetchData();
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const handleGeneratePlan = async () => {
        try {
            const response = await planAPI.generate();
            setPlan(response.data.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate plan');
        }
    };

    const handleRegeneratePlan = async () => {
        try {
            const response = await planAPI.regenerate();
            setPlan(response.data.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to regenerate plan');
        }
    };

    const handleMarkSessionComplete = async (planId: string, sessionId: string) => {
        try {
            await planAPI.markSessionComplete(planId, sessionId);
            fetchData();
        } catch (error) {
            console.error('Error marking session complete:', error);
        }
    };

    const addTopicField = () => {
        setNewSubject({
            ...newSubject,
            topics: [...newSubject.topics, { name: '', difficulty: 5, estimatedHours: 2 }],
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            PARE Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Subjects</p>
                                <p className="text-3xl font-bold text-gray-800">{subjects.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📚</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stress Level</p>
                                <p className="text-3xl font-bold text-gray-800">{user?.stressLevel}/10</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">😰</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Daily Hours</p>
                                <p className="text-3xl font-bold text-gray-800">{user?.dailyAvailableHours}h</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⏰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Your Subjects</h2>
                        <button
                            onClick={() => setShowAddSubject(!showAddSubject)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
                        >
                            + Add Subject
                        </button>
                    </div>

                    {showAddSubject && (
                        <form onSubmit={handleAddSubject} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                                    <input
                                        type="text"
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                        placeholder="e.g., Mathematics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                                    <input
                                        type="date"
                                        value={newSubject.deadline}
                                        onChange={(e) => setNewSubject({ ...newSubject, deadline: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                                    {newSubject.topics.map((topic, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-3 mb-3">
                                            <input
                                                type="text"
                                                value={topic.name}
                                                onChange={(e) => {
                                                    const topics = [...newSubject.topics];
                                                    topics[index].name = e.target.value;
                                                    setNewSubject({ ...newSubject, topics });
                                                }}
                                                required
                                                placeholder="Topic name"
                                                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                            />
                                            <input
                                                type="number"
                                                value={topic.difficulty}
                                                onChange={(e) => {
                                                    const topics = [...newSubject.topics];
                                                    topics[index].difficulty = parseInt(e.target.value);
                                                    setNewSubject({ ...newSubject, topics });
                                                }}
                                                min="1"
                                                max="10"
                                                required
                                                placeholder="Difficulty (1-10)"
                                                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                            />
                                            <input
                                                type="number"
                                                value={topic.estimatedHours}
                                                onChange={(e) => {
                                                    const topics = [...newSubject.topics];
                                                    topics[index].estimatedHours = parseFloat(e.target.value);
                                                    setNewSubject({ ...newSubject, topics });
                                                }}
                                                min="0.5"
                                                step="0.5"
                                                required
                                                placeholder="Hours"
                                                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTopicField}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                    >
                                        + Add Topic
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                                    >
                                        Save Subject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSubject(false)}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {subjects.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No subjects added yet. Add your first subject to get started!</p>
                    ) : (
                        <div className="space-y-4">
                            {subjects.map((subject) => (
                                <div key={subject._id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                                        <span className="text-sm text-gray-500">
                                            Deadline: {new Date(subject.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {subject.topics.map((topic) => (
                                            <span
                                                key={topic._id}
                                                className={`px-3 py-1 rounded-full text-sm ${topic.completed
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {topic.name} ({topic.estimatedHours}h)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recovery Plan Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Recovery Plan</h2>
                        <div className="flex gap-3">
                            {plan && (
                                <button
                                    onClick={handleRegeneratePlan}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                                >
                                    Regenerate Plan
                                </button>
                            )}
                            <button
                                onClick={handleGeneratePlan}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
                            >
                                {plan ? 'Generate New Plan' : 'Generate Plan'}
                            </button>
                        </div>
                    </div>

                    {!plan ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No active recovery plan. Generate one to get started!</p>
                            <p className="text-sm text-gray-400">Add subjects first, then generate your personalized plan.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {plan.schedule.slice(0, 7).map((day, dayIndex) => (
                                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">
                                        {new Date(day.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
                                    <div className="space-y-2">
                                        {day.sessions.map((session) => (
                                            <div
                                                key={session._id}
                                                className={`p-3 rounded-lg border ${session.completed
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-purple-50 border-purple-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {session.subject?.name || 'Subject'} - {session.topic}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {session.startTime} - {session.endTime} ({session.duration}h)
                                                        </p>
                                                    </div>
                                                    {!session.completed && (
                                                        <button
                                                            onClick={() => handleMarkSessionComplete(plan._id, session._id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
