'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-[440px] z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 accent-gradient rounded-2xl shadow-xl shadow-blue-200 mb-6 group transition-transform hover:scale-110">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">PARE</h1>
                    <p className="text-gray-500 font-medium">Personalized Academic Recovery Engine</p>
                </div>

                <div className="glass-card bg-white/80 backdrop-blur-xl p-10 border border-white shadow-2xl shadow-blue-900/5">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Continue your recovery journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-100 px-11 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="name@university.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-[10px] font-bold text-primary-blue hover:underline uppercase tracking-tight">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50/50 border border-gray-100 px-11 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="••••••••"
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
                                    <span>Sign In to Recovery</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account yet?{' '}
                            <Link href="/register" className="text-primary-blue font-bold hover:underline">
                                Start Recovery
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        INTELLIGENT ACADEMIC ASSISTANCE<br />
                        EST. 2024 • SUPPORTING 5,000+ STUDENTS
                    </p>
                </div>
            </div>
        </div>
    );
}
