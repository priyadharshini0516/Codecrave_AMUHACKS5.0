'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Mail, Lock, User, BrainCircuit, Clock } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        stressLevel: 5,
        dailyAvailableHours: 6,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-[480px] z-10 animate-fade-in py-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 accent-gradient rounded-2xl shadow-xl shadow-blue-200 mb-6 group transition-transform hover:scale-110">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Join PARE</h1>
                    <p className="text-gray-500 font-medium">Initialize your academic recovery engine.</p>
                </div>

                <div className="glass-card bg-white/80 backdrop-blur-xl p-10 border border-white shadow-2xl shadow-blue-900/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-100 px-11 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-100 px-11 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="name@university.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    className="w-full bg-gray-50/50 border border-gray-100 px-11 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-2">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit size={14} className="text-gray-400" />
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stress Level</label>
                                    </div>
                                    <span className="text-sm font-bold text-primary-blue transition-all">{formData.stressLevel}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.stressLevel}
                                    onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Hours</label>
                                    </div>
                                    <span className="text-sm font-bold text-primary-blue transition-all">{formData.dailyAvailableHours}h daily</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="16"
                                    value={formData.dailyAvailableHours}
                                    onChange={(e) => setFormData({ ...formData, dailyAvailableHours: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-critical/5 border border-critical/10 text-critical px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full accent-gradient text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create Recovery Account</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-blue font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
