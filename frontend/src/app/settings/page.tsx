'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardComponents';
import {
    Save,
    User,
    Mail,
    Zap,
    Activity,
    Shield,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        stressLevel: 5,
        dailyAvailableHours: 6
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                stressLevel: user.stressLevel || 5,
                dailyAvailableHours: user.dailyAvailableHours || 6
            });
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await authAPI.updateDetails(formData);
            if (response.data.success) {
                // Update local auth context
                if (setUser) {
                    setUser({ ...user, ...response.data.data });
                }
                setMessage({ type: 'success', text: 'Configuration recalibrated successfully.' });
            }
        } catch (error: any) {
            console.error('Update error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update configuration.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-primary-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
                <p className="text-gray-500 mt-2 font-medium">Fine-tune your recovery engine and personal parameters.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {message && (
                    <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 animate-slide-down shadow-sm font-bold text-sm",
                        message.type === 'success' ? "bg-success-light text-success border border-success/10" : "bg-critical-light text-critical border border-critical/10"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Section */}
                    <DashboardCard className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User size={20} className="text-primary-blue" />
                            General Information
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 pl-12 pr-5 py-4 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue/30 transition-all font-medium"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-50 pl-12 pr-5 py-4 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue/30 transition-all font-medium"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Engine Parameters */}
                    <DashboardCard className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-primary-blue" />
                            Recovery Engine
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Stress Level</label>
                                    <span className={cn(
                                        "text-sm font-black px-3 py-1 rounded-full",
                                        formData.stressLevel > 7 ? "bg-critical-light text-critical" :
                                            formData.stressLevel > 4 ? "bg-primary-blue/10 text-primary-blue" : "bg-success-light text-success"
                                    )}>
                                        {formData.stressLevel}/10
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.stressLevel}
                                    onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                                />
                                <p className="text-[10px] text-gray-400 italic">Adjusts the intensity and load-balancing of your study sessions.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Daily Capacity</label>
                                    <span className="text-sm font-black text-primary-blue bg-blue-50 px-3 py-1 rounded-full">
                                        {formData.dailyAvailableHours} Hours
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="16"
                                    value={formData.dailyAvailableHours}
                                    onChange={(e) => setFormData({ ...formData, dailyAvailableHours: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                                />
                                <p className="text-[10px] text-gray-400 italic">Limits the total study hours allocated per day in your recovery schedule.</p>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        Cancel Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-10 py-4 accent-gradient text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Activity className="animate-spin" size={20} />
                                Recalibrating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
