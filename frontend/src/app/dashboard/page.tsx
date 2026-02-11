'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subjectAPI, planAPI, arisAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import {
    DashboardCard,
    ProgressRing,
    ProgressBar
} from '@/components/DashboardComponents';
import {
    Plus,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    TrendingUp,
    BrainCircuit,
    Zap,
    BookOpen,
    Sparkles
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
    const { user, loading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [plan, setPlan] = useState<RecoveryPlan | null>(null);
    const [aiInsight, setAiInsight] = useState<string>('AI is calculating your path...');
    const [loading, setLoading] = useState(true);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: '',
        deadline: '',
        total_topics: 1,
        weightage: 3,
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

            // Fetch AI Insights
            try {
                const aiRes = await arisAPI.getAIInsights();
                setAiInsight(aiRes.data.data);
            } catch (error) {
                console.error('Error fetching AI insights:', error);
                setAiInsight('Could not load AI insights at this time.');
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
                total_topics: 1,
                weightage: 3,
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
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate plan');
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

    const todaySessions = useMemo(() => {
        if (!plan) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySchedule = plan.schedule.find(s => s.date.startsWith(todayStr));
        return todaySchedule ? todaySchedule.sessions : [];
    }, [plan]);

    const academicRisk = useMemo(() => {
        if (subjects.length === 0) return 0;
        let totalTopics = 0;
        let completedTopics = 0;
        subjects.forEach(s => {
            totalTopics += s.topics.length;
            completedTopics += s.topics.filter(t => t.completed).length;
        });
        const completionRate = completedTopics / totalTopics;
        // Mock risk calculation: 100 - completion percentage, adjusted by stress
        return Math.floor((1 - completionRate) * 80 + (user?.stressLevel || 0) * 2);
    }, [subjects, user]);

    const riskColor = useMemo(() => {
        if (academicRisk < 30) return "var(--status-success)";
        if (academicRisk < 70) return "var(--status-warning)";
        return "var(--status-critical)";
    }, [academicRisk]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-primary-blue rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium">Preparing your recovery engine...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recovery Overview</h1>
                <p className="text-gray-500 mt-2 font-medium">Here's your data-driven path to academic success.</p>
            </div>

            {/* Top Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <DashboardCard
                    title="Academic Risk Level"
                    subtitle="Based on upcoming deadlines"
                    className="lg:col-span-1"
                >
                    <div className="flex flex-col items-center py-4">
                        <ProgressRing
                            value={academicRisk}
                            color={riskColor}
                            label={`${academicRisk}%`}
                            subLabel="Risk"
                            size={160}
                        />
                        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                            <AlertCircle size={16} className={academicRisk > 70 ? "text-critical" : "text-warning"} />
                            <span className="text-xs font-semibold text-gray-600">
                                {academicRisk < 30 ? "Optimal - Keep it up!" : academicRisk < 70 ? "Moderate - Stay focused" : "Critical - Action required"}
                            </span>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Stress Level Meter"
                    subtitle="Real-time emotional tracking"
                    icon={BrainCircuit}
                >
                    <div className="flex flex-col justify-center h-full py-4">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <p className="text-4xl font-bold text-gray-900">{user?.stressLevel || 0}<span className="text-lg text-gray-300 ml-1">/10</span></p>
                                <p className="text-xs font-semibold text-gray-400 uppercase">Self-reported stress</p>
                            </div>
                            <TrendingUp className="text-blue-500 mb-2" size={24} />
                        </div>
                        <ProgressBar
                            value={user?.stressLevel || 0}
                            max={10}
                            color={(user?.stressLevel || 0) > 7 ? "bg-critical" : (user?.stressLevel || 0) > 4 ? "bg-warning" : "bg-primary-blue"}
                        />
                        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                            System is adjusting your study load to prevent burnout while maintaining progress.
                        </p>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Daily Completion"
                    subtitle="Today's goal progress"
                    icon={Zap}
                >
                    <div className="flex flex-col justify-center h-full py-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-blue font-bold text-xl">
                                {todaySessions.filter(s => s.completed).length}/{todaySessions.length}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Sessions Finished</p>
                                <p className="text-xs text-gray-500 font-medium">Target: {todaySessions.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}h study</p>
                            </div>
                        </div>
                        <ProgressBar
                            value={todaySessions.filter(s => s.completed).length}
                            max={Math.max(todaySessions.length, 1)}
                            color="bg-success"
                        />
                    </div>
                </DashboardCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Today's Plan */}
                <div className="lg:col-span-3 space-y-8">
                    <DashboardCard
                        title="Today's Recovery Plan"
                        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        icon={Calendar}
                        action={
                            !plan && (
                                <button
                                    onClick={handleGeneratePlan}
                                    className="accent-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-100 transition-transform hover:scale-105"
                                >
                                    Generate Plan
                                </button>
                            )
                        }
                    >
                        {!plan ? (
                            <div className="py-20 text-center">
                                <p className="text-gray-400 font-medium">No active recovery plan detected.</p>
                                <p className="text-xs text-gray-400 mt-2">Add subjects first, then initialize the engine.</p>
                            </div>
                        ) : todaySessions.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">
                                <p>No study sessions scheduled for today.</p>
                                <p className="text-xs mt-2">Rest is also part of recovery!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaySessions.map((session) => (
                                    <div
                                        key={session._id}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                            session.completed
                                                ? "bg-success-light/30 border-success/10"
                                                : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                session.completed ? "bg-success text-white" : "bg-gray-50 text-gray-400"
                                            )}>
                                                {session.completed ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div>
                                                <h4 className={cn("font-bold", session.completed ? "text-success" : "text-gray-900")}>
                                                    {session.subject?.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium">{session.topic}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{session.startTime}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{session.duration.toFixed(1)}h session</p>
                                            </div>
                                            {!session.completed && (
                                                <button
                                                    onClick={() => handleMarkSessionComplete(plan._id, session._id)}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl hover:bg-success hover:text-white hover:border-success transition-all shadow-sm"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DashboardCard>

                    <DashboardCard
                        title="Your Subjects"
                        subtitle={`${subjects.length} active courses`}
                        icon={BookOpen}
                        action={
                            <button
                                onClick={() => setShowAddSubject(!showAddSubject)}
                                className="p-2 bg-blue-50 text-primary-blue rounded-xl hover:bg-primary-blue hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={20} />
                            </button>
                        }
                    >
                        {showAddSubject && (
                            <form onSubmit={handleAddSubject} className="mb-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Subject Name</label>
                                        <input
                                            type="text"
                                            value={newSubject.name}
                                            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                            required
                                            className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-medium"
                                            placeholder="e.g., Mathematics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Target Deadline</label>
                                        <input
                                            type="date"
                                            value={newSubject.deadline}
                                            onChange={(e) => setNewSubject({ ...newSubject, deadline: e.target.value })}
                                            required
                                            className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="accent-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
                                    >
                                        Add Subject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSubject(false)}
                                        className="bg-white text-gray-500 px-6 py-3 rounded-xl font-bold border border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.map((subject) => {
                                const completed = subject.topics.filter(t => t.completed).length;
                                const total = subject.topics.length;
                                return (
                                    <div key={subject._id} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-primary-blue transition-colors">{subject.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                    Deadline: {new Date(subject.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="px-2 py-1 bg-blue-50 rounded-lg text-[10px] font-bold text-primary-blue uppercase">
                                                Priority {subject.priority}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Progress</span>
                                                <span>{Math.round((completed / total) * 100)}%</span>
                                            </div>
                                            <ProgressBar value={completed} max={total} color="bg-primary-blue" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardCard>
                </div>

                {/* Right Column: Deadlines & Notifications */}
                <div className="lg:col-span-1 space-y-8">
                    <DashboardCard title="Upcoming Deadlines" icon={Clock}>
                        <div className="space-y-6">
                            {subjects.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5).map(s => {
                                const daysLeft = Math.ceil((new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={s._id} className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                            daysLeft < 3 ? "bg-critical" : daysLeft < 7 ? "bg-warning" : "bg-success"
                                        )}></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{s.name} Exam/Goal</p>
                                            <p className="text-[11px] text-gray-500 font-medium mt-1">
                                                {daysLeft < 0 ? "Expired" : `${daysLeft} days remaining`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardCard>

                    <div className="accent-gradient rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
                        <Sparkles className="mb-4" size={32} />
                        <h3 className="text-lg font-bold mb-2">AI Recovery Insight</h3>
                        <p className="text-sm text-blue-50 opacity-90 leading-relaxed font-medium">
                            {aiInsight}
                        </p>
                        <button
                            onClick={() => {
                                setAiInsight('AI is re-analyzing...');
                                arisAPI.getAIInsights().then(res => setAiInsight(res.data.data)).catch(() => setAiInsight('Error refreshing insights.'));
                            }}
                            className="w-full mt-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-bold transition-all"
                        >
                            Refresh Analysis
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
