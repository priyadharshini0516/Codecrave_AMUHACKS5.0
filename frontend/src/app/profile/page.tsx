'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subjectAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardComponents';
import {
    User,
    Mail,
    Calendar,
    BookOpen,
    CheckCircle2,
    Zap,
    Settings,
    Shield,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Topic {
    completed: boolean;
}

interface Subject {
    topics: Topic[];
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalTopics: 0,
        completedTopics: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchStats();
        }
    }, [user, authLoading, router]);

    const fetchStats = async () => {
        try {
            const response = await subjectAPI.getAll();
            const subjects: Subject[] = response.data.data;

            let totalTopics = 0;
            let completedTopics = 0;

            subjects.forEach(s => {
                totalTopics += s.topics.length;
                completedTopics += s.topics.filter(t => t.completed).length;
            });

            setStats({
                totalSubjects: subjects.length,
                totalTopics,
                completedTopics
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-primary-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    const completionRate = stats.totalTopics > 0 ? (stats.completedTopics / stats.totalTopics) * 100 : 0;

    return (
        <DashboardLayout>
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agent Profile</h1>
                    <p className="text-gray-500 mt-2 font-medium">Your tactical identity and performance metrics.</p>
                </div>
                <Link
                    href="/settings"
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-100 transition-all shadow-sm active:scale-95"
                >
                    <Settings size={18} />
                    Edit Configuration
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Identity Card */}
                <DashboardCard className="lg:col-span-1 p-0 overflow-hidden text-center sticky top-24 h-fit">
                    <div className="h-24 pb-gradient"></div>
                    <div className="px-6 pb-10 -mt-12">
                        <div className="w-24 h-24 rounded-[2rem] bg-white p-1.5 shadow-xl mx-auto mb-4 scale-in">
                            <div className="w-full h-full rounded-[1.75rem] bg-gray-50 flex items-center justify-center text-primary-blue border-4 border-white overflow-hidden">
                                <span className="text-3xl font-black">{user?.name?.charAt(0) || 'A'}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-sm font-bold text-primary-blue uppercase tracking-widest mt-1">Recovery Agent</p>

                        <div className="mt-8 space-y-4 text-left border-t border-gray-50 pt-8">
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Identity</p>
                                    <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Deployed Since</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Security Clearance</p>
                                    <p className="text-sm font-bold text-success capitalize">Active Status</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                {/* Performance Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DashboardCard className="p-8 group hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-2xl bg-blue-50 text-primary-blue group-hover:scale-110 transition-transform">
                                    <BookOpen size={24} />
                                </div>
                                <Activity className="text-gray-100" size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900">{stats.totalSubjects}</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Subjects Enrolled</p>
                        </DashboardCard>

                        <DashboardCard className="p-8 group hover:border-success/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-2xl bg-success-light text-success group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={24} />
                                </div>
                                <Zap className="text-gray-100" size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900">{stats.completedTopics}</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Topics Restored</p>
                        </DashboardCard>
                    </div>

                    <DashboardCard className="p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full -mr-32 -mt-32"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Activity className="text-primary-blue" size={24} />
                            Global Recovery Metric
                        </h3>

                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="relative w-40 h-40 shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="74"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        className="text-gray-50"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="74"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray={465}
                                        strokeDashoffset={465 - (465 * completionRate) / 100}
                                        strokeLinecap="round"
                                        className="text-primary-blue transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-black text-gray-900">{Math.round(completionRate)}%</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Verified</span>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <label className="font-bold text-gray-500">Curriculum Coverage</label>
                                        <span className="font-black text-gray-900">{stats.completedTopics}/{stats.totalTopics} Topics</span>
                                    </div>
                                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-blue rounded-full transition-all duration-1000"
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed italic">
                                    Your completion rate is calculated based on topic-level verification across all registered subjects. Keep pushing to reach 100% restoration.
                                </p>
                            </div>
                        </div>
                    </DashboardCard>

                    <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/30">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-blue shadow-sm shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Recovery Pulse Active</p>
                            <p className="text-xs text-gray-500">The ARIS core is receiving real-time telemetry from your profile.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
