'use client';

import { useState, useEffect, useMemo } from 'react';
import { arisAPI } from '@/lib/arisApi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
    DashboardCard,
    ProgressRing,
    ProgressBar
} from '@/components/DashboardComponents';
import {
    BrainCircuit,
    Target,
    Zap,
    ChevronRight,
    AlertCircle,
    Calendar,
    Clock,
    TrendingUp,
    Map as MapIcon,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArisPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [risk, setRisk] = useState<any>(null);
    const [simulation, setSimulation] = useState<any>(null);
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchIntelligenceData();
        }
    }, [user, authLoading]);

    const fetchIntelligenceData = async () => {
        try {
            const [riskRes, simRes, schedRes] = await Promise.all([
                arisAPI.calculateRisk(),
                arisAPI.simulateRecovery(),
                arisAPI.optimizeSchedule()
            ]);
            setRisk(riskRes.data.data);
            setSimulation(simRes.data.data);
            setSchedule(schedRes.data.data);
        } catch (error) {
            console.error('Error fetching ARIS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const riskColor = useMemo(() => {
        if (!risk) return '#2563EB';
        if (risk.score > 60) return '#EF4444';
        if (risk.score > 30) return '#F59E0B';
        return '#22C55E';
    }, [risk]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Initializing Intelligence Console...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                <BrainCircuit size={18} />
                            </div>
                            <span className="text-xs font-bold text-primary-blue uppercase tracking-widest">ARIS Intelligence Console</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            Predictive Optimization Path
                        </h1>
                        <p className="mt-1 text-gray-500 font-medium">Stress-aware trajectory analysis and schedule optimization.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Academic Risk Card */}
                    <DashboardCard
                        title="Academic Risk Model"
                        icon={AlertCircle}
                        className="flex flex-col"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                            <ProgressRing
                                value={risk?.score || 0}
                                size={160}
                                strokeWidth={12}
                                color={riskColor}
                            />
                            <div className="mt-4 text-center">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-widest",
                                    risk?.level === 'High' ? 'text-critical' : risk?.level === 'Moderate' ? 'text-warning' : 'text-success'
                                )}>
                                    {risk?.level} RISK PROFILE
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            {Object.entries(risk?.breakdown || {}).map(([key, value]: [string, any]) => (
                                <div key={key} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="capitalize text-gray-400 font-bold tracking-tight">{key.replace('Factor', '')} Impact</span>
                                        <span className="font-bold text-gray-700">{value}pts</span>
                                    </div>
                                    <ProgressBar
                                        value={(value / 35) * 100}
                                        color="#94A3B8"
                                        className="h-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </DashboardCard>

                    {/* Completion Probability Card */}
                    <DashboardCard
                        title="Recovery Probability"
                        icon={Target}
                    >
                        <div className="flex flex-col items-center justify-center py-6">
                            <ProgressRing
                                value={simulation?.completionProbability || 0}
                                size={160}
                                strokeWidth={12}
                                color="#2563EB"
                            />
                            <p className="mt-6 text-gray-400 text-sm font-medium">Syllabus completion probability</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 ring-1 ring-inset ring-white/50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Required</p>
                                <p className="text-xl font-bold text-gray-900">{simulation?.requiredHours}h</p>
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 ring-1 ring-inset ring-white/50">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Estimated</p>
                                <p className="text-xl font-bold text-primary-blue">
                                    {simulation?.expectedCompletionDate ? new Date(simulation.expectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                                </p>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Behavioral Status Card */}
                    <DashboardCard
                        title="Behavioral Baseline"
                        icon={TrendingUp}
                    >
                        <div className="space-y-8 py-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consistency Score</span>
                                    <span className="text-sm font-bold text-purple-600">{((user?.consistency_score ?? 0) * 100).toFixed(0)}%</span>
                                </div>
                                <ProgressBar
                                    value={(user?.consistency_score ?? 0) * 100}
                                    color="#A855F7"
                                    className="h-2.5"
                                />
                                <p className="text-[10px] text-gray-400 font-medium">Based on 14-day tracking window.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stress Capacity</span>
                                    <span className="text-sm font-bold text-warning">{Math.max(0, 100 - (user?.stressLevel ?? 0) * 10)}%</span>
                                </div>
                                <ProgressBar
                                    value={Math.max(0, 100 - (user?.stressLevel ?? 0) * 10)}
                                    color="#F59E0B"
                                    className="h-2.5"
                                />
                                <p className="text-[10px] text-gray-400 font-medium">Emotional bandwidth for new tasks.</p>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                                        <MapIcon className="text-primary-blue" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Academic GPS Active</p>
                                        <p className="text-xs text-blue-500 font-medium">Recalculating optimal path...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                {/* Academic GPS Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6 ml-1">
                        <MapIcon className="text-primary-blue" size={20} />
                        <h2 className="text-xl font-bold text-gray-900">Academic GPS Recovery Path</h2>
                    </div>

                    <div className="relative p-10 bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-1.5 accent-gradient" />

                        <div className="flex flex-col md:flex-row justify-between gap-12 relative px-4">
                            {/* Connecting Line */}
                            <div className="absolute top-[48px] left-0 w-full h-0.5 bg-gray-100 hidden md:block -z-0" />

                            {[
                                { label: 'Current Status', status: 'COMPLETE', date: 'Checkpoint 1', variant: 'blue' },
                                { label: '50% Milestone', status: 'IN_PROGRESS', date: 'Checkpoint 2', variant: 'purple' },
                                { label: '90% Buffer', status: 'PENDING', date: 'Checkpoint 3', variant: 'gray' },
                                { label: 'Readiness', status: 'PENDING', date: 'Destination', variant: 'gray' }
                            ].map((node, i) => (
                                <div key={i} className="relative z-10 flex flex-col items-center flex-1 transition-all hover:scale-105">
                                    <div className={cn(
                                        "w-24 h-24 rounded-[28px] border-4 flex items-center justify-center transition-all duration-500 shadow-xl shadow-transparent",
                                        node.status === 'COMPLETE' ? "bg-blue-50 border-primary-blue shadow-blue-100/50" :
                                            node.status === 'IN_PROGRESS' ? "bg-purple-50 border-purple-500 animate-pulse shadow-purple-100/50" :
                                                "bg-white border-gray-100"
                                    )}>
                                        {node.status === 'COMPLETE' ? (
                                            <CheckCircle2 size={32} className="text-primary-blue" />
                                        ) : (
                                            <span className={cn(
                                                "text-2xl font-black",
                                                node.status === 'IN_PROGRESS' ? "text-purple-600" : "text-gray-300"
                                            )}>{i + 1}</span>
                                        )}
                                    </div>
                                    <div className="mt-6 text-center">
                                        <p className="font-bold text-gray-900">{node.label}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{node.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Optimized Schedule Display */}
                <div className="glass-card bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Constrained Optimized Roadmap</h2>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Dynamically balanced cognitive load distribution.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-1.5 bg-blue-50 text-primary-blue text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-100">Stress-Aware</span>
                            <span className="px-4 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-100">Load-Balanced</span>
                        </div>
                    </div>

                    <div className="p-8 overflow-x-auto">
                        <div className="flex gap-8 min-w-max">
                            {schedule?.map((day: any, idx: number) => (
                                <div key={idx} className="w-72">
                                    <div className="flex items-center gap-2 mb-6 px-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <h3 className="text-gray-900 text-xs font-bold uppercase tracking-widest">
                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        {day.sessions?.map((session: any, sIdx: number) => (
                                            <div key={sIdx} className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-primary-blue/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group cursor-default ring-1 ring-inset ring-transparent hover:ring-primary-blue/10">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-2">
                                                    <Clock size={12} />
                                                    {session.startTime} - {session.endTime}
                                                </div>
                                                <p className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">{session.subjectName}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-0.5 bg-gray-50 rounded text-[9px] font-bold text-gray-500 uppercase">{session.duration}h Deep Work</div>
                                                    <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                                    <div className="text-[9px] font-bold text-success uppercase">Optimized</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!day.sessions || day.sessions.length === 0) && (
                                            <div className="p-8 border-2 border-dashed border-gray-50 rounded-[24px] text-center flex flex-col items-center justify-center gap-2">
                                                <Clock size={20} className="text-gray-200" />
                                                <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Buffer Period</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
