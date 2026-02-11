'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { planAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardComponents';
import {
    Calendar,
    Clock,
    CheckCircle2,
    RefreshCcw,
    ChevronRight,
    AlertCircle,
    Zap,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
    _id: string;
    name: string;
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
    _id: string;
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

export default function SchedulePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [plan, setPlan] = useState<RecoveryPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchPlan();
        }
    }, [user, authLoading, router]);

    const fetchPlan = async () => {
        try {
            const response = await planAPI.getActive();
            setPlan(response.data.data);
        } catch (error) {
            console.error('Error fetching plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePlan = async () => {
        setLoading(true);
        try {
            const response = await planAPI.generate();
            setPlan(response.data.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate plan. Make sure you have added subjects.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegeneratePlan = async () => {
        setRegenerating(true);
        try {
            const response = await planAPI.regenerate();
            setPlan(response.data.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to regenerate plan');
        } finally {
            setRegenerating(false);
        }
    };

    const handleMarkSessionComplete = async (sessionId: string) => {
        if (!plan) return;
        try {
            const response = await planAPI.markSessionComplete(plan._id, sessionId);
            setPlan(response.data.data);
        } catch (error) {
            console.error('Error marking session complete:', error);
        }
    };

    const sortedSchedule = useMemo(() => {
        if (!plan) return [];
        return [...plan.schedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [plan]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-primary-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recovery Schedule</h1>
                    <p className="text-gray-500 mt-2 font-medium">Your personalized timeline for academic restoration.</p>
                </div>
                {plan && (
                    <button
                        onClick={handleRegeneratePlan}
                        disabled={regenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCcw size={18} className={cn(regenerating && "animate-spin")} />
                        {regenerating ? 'Recalculating...' : 'Regenerate Plan'}
                    </button>
                )}
            </div>

            {!plan ? (
                <DashboardCard className="py-24 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-primary-blue mx-auto mb-6">
                        <Zap size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Plan Detected</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8">
                        The recovery engine needs to analyze your subjects and stress levels to generate an optimal path.
                    </p>
                    <button
                        onClick={handleGeneratePlan}
                        className="accent-gradient text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-transform active:scale-95"
                    >
                        Initialize Recovery Path
                    </button>
                </DashboardCard>
            ) : (
                <div className="space-y-12">
                    {sortedSchedule.map((day, dayIndex) => {
                        const date = new Date(day.date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={day._id} className="relative">
                                {/* Date Header */}
                                <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-md">
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl border font-bold text-sm shadow-sm",
                                        isToday
                                            ? "accent-gradient text-white border-transparent"
                                            : "bg-white text-gray-900 border-gray-100"
                                    )}>
                                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="h-px flex-1 bg-gray-100"></div>
                                </div>

                                {/* Sessions */}
                                <div className="space-y-4 ml-2 md:ml-6 border-l-2 border-dashed border-gray-100 pl-6 md:pl-10 pb-4">
                                    {day.sessions.map((session, sIndex) => (
                                        <div
                                            key={session._id}
                                            className={cn(
                                                "group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-3xl border bg-white transition-all duration-300",
                                                session.completed
                                                    ? "bg-success-light/30 border-success/10 opacity-75"
                                                    : "border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50"
                                            )}
                                        >
                                            {/* Dot on the timeline */}
                                            <div className={cn(
                                                "absolute -left-[41px] md:-left-[53px] w-6 h-6 rounded-full border-4 border-background flex items-center justify-center transition-colors",
                                                session.completed ? "bg-success" : isToday ? "bg-primary-blue animate-pulse" : "bg-gray-200"
                                            )}>
                                                {session.completed && <CheckCircle2 size={10} className="text-white" />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className={cn(
                                                        "text-lg font-bold transition-colors",
                                                        session.completed ? "text-success/80" : "text-gray-900 group-hover:text-primary-blue"
                                                    )}>
                                                        {session.subject?.name}
                                                    </h4>
                                                    {!session.completed && isToday && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary-blue bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                                                            <MapPin size={10} /> CURRENT
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 mt-1">{session.topic}</p>

                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Clock size={14} />
                                                        <span className="text-xs font-bold">{session.startTime} - {session.endTime}</span>
                                                    </div>
                                                    <div className="text-gray-200">•</div>
                                                    <span className="text-xs font-bold text-gray-400 capitalize">{session.duration.toFixed(1)}h duration</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 md:mt-0 md:ml-6 shrink-0">
                                                {session.completed ? (
                                                    <div className="flex items-center gap-2 text-success font-bold text-sm px-4 py-2 bg-success-light/50 rounded-xl">
                                                        <CheckCircle2 size={16} />
                                                        Verified
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMarkSessionComplete(session._id)}
                                                        className="px-6 py-2.5 bg-white border border-gray-100 text-gray-900 text-sm font-bold rounded-xl hover:bg-success hover:text-white hover:border-success transition-all shadow-sm group-hover:shadow-md"
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* End of Path indicator */}
                    <div className="flex flex-col items-center py-10 opacity-50">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <ArrowRight size={20} className="text-gray-400 rotate-90" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">End of Path</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
