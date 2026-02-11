'use client';

import { useState, useEffect } from 'react';
import { arisAPI } from '@/lib/arisApi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        ARIS Intelligence Console
                    </h1>
                    <p className="mt-2 text-slate-400">Predictive Analytics & Predictive Optimization System</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                    Back to Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Academic Risk Card */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="p-2 bg-red-500/10 text-red-400 rounded-lg">⚠️</span>
                        Academic Risk Model
                    </h2>
                    <div className="mt-8 flex flex-col items-center">
                        <div className="relative w-48 h-24 overflow-hidden">
                            <div className="absolute inset-0 border-t-[12px] border-slate-800 rounded-full" />
                            <div
                                className={`absolute inset-0 border-t-[12px] rounded-full transition-all duration-1000`}
                                style={{
                                    borderColor: risk?.score > 60 ? '#f43f5e' : risk?.score > 30 ? '#f59e0b' : '#10b981',
                                    transform: `rotate(${(risk?.score / 100) * 180 - 180}deg)`
                                }}
                            />
                        </div>
                        <div className="text-center -mt-4">
                            <span className="text-5xl font-black block">{risk?.score}</span>
                            <span className={`text-sm font-bold uppercase tracking-widest ${risk?.level === 'High' ? 'text-red-400' : risk?.level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                {risk?.level} RISK
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        {Object.entries(risk?.breakdown || {}).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between items-center text-sm">
                                <span className="capitalize text-slate-400">{key.replace('Factor', '')} Impact</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-600" style={{ width: `${(value / 35) * 100}%` }} />
                                    </div>
                                    <span className="w-12 text-right">{value}pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completion Probability Card */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">🎯</span>
                        Recovery Probability
                    </h2>
                    <div className="mt-12 text-center">
                        <div className="relative inline-block">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (simulation?.completionProbability / 100) * 364}
                                    className="text-cyan-500 transition-all duration-1000"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-3xl font-black">
                                {simulation?.completionProbability}%
                            </span>
                        </div>
                        <p className="mt-6 text-slate-400 text-sm">Probability of syllabus completion</p>
                    </div>
                    <div className="mt-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500">REQUIRED HOURS</span>
                            <span className="text-sm font-bold text-slate-300">{simulation?.requiredHours}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">ESTIMATED COMPLETION</span>
                            <span className="text-sm font-bold text-cyan-400">
                                {new Date(simulation?.expectedCompletionDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Behavioral Status Card */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">🧠</span>
                        Behavioral Baseline
                    </h2>
                    <div className="mt-4 space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-400">Consistency Score</span>
                                <span className="text-sm font-bold text-purple-400">{((user?.consistency_score ?? 0) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${(user?.consistency_score ?? 0) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-400">Stress Capacity</span>
                                <span className="text-sm font-bold text-amber-400">{100 - (user?.stressLevel ?? 0) * 10}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${Math.max(0, 100 - (user?.stressLevel ?? 0) * 10)}%` }} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-xl">
                                    🗺️
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Academic GPS Active</p>
                                    <p className="text-xs text-slate-500">Recalculating optimal path...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic GPS Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">🗺️</span>
                    Academic GPS Recovery Path
                </h2>
                <div className="relative p-8 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500" />
                    <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-12 left-0 w-full h-0.5 bg-slate-800 hidden md:block" />

                        {[
                            { label: 'Current Status', status: 'COMPLETE', date: 'Today' },
                            { label: '50% Milestone', status: 'IN_PROGRESS', date: 'Phase 1' },
                            { label: '90% Critical Buffer', status: 'PENDING', date: 'Phase 2' },
                            { label: 'Exam Readiness', status: 'PENDING', date: 'Destination' }
                        ].map((node, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center flex-1">
                                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${node.status === 'COMPLETE' ? 'bg-cyan-500/20 border-cyan-500' :
                                    node.status === 'IN_PROGRESS' ? 'bg-purple-500/20 border-purple-500 animate-pulse' :
                                        'bg-slate-900 border-slate-800'
                                    }`}>
                                    <span className="text-2xl">
                                        {node.status === 'COMPLETE' ? '✅' : i + 1}
                                    </span>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="font-bold text-slate-100">{node.label}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">{node.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Optimized Schedule Display */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">⚡</span>
                        Constrained Optimized Roadmap
                    </h2>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-800 text-xs rounded-full">Stress-Aware</span>
                        <span className="px-3 py-1 bg-slate-800 text-xs rounded-full">Cognitive-Load Balanced</span>
                    </div>
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="flex gap-6 min-w-max">
                        {schedule?.map((day: any, idx: number) => (
                            <div key={idx} className="w-64">
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tighter mb-4 px-2">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                <div className="space-y-3">
                                    {day.sessions.map((session: any, sIdx: number) => (
                                        <div key={sIdx} className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl hover:border-cyan-500/30 transition-all cursor-default">
                                            <p className="text-xs font-bold text-slate-400 mb-1">{session.startTime} - {session.endTime}</p>
                                            <p className="text-sm font-black text-slate-100">{session.subjectName}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{session.duration}h Deep Focus</p>
                                        </div>
                                    ))}
                                    {day.sessions.length === 0 && (
                                        <div className="p-3 border border-dashed border-slate-800 rounded-xl text-center">
                                            <p className="text-xs text-slate-600 font-bold">BUFFER TIME</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
