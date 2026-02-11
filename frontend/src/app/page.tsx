'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans antialiased">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="text-center z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 accent-gradient rounded-3xl shadow-2xl shadow-blue-200 mb-8 animate-pulse">
          <Sparkles className="text-white" size={40} />
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-gray-900 mb-4">PARE</h1>
        <p className="text-xl font-medium text-gray-500 max-w-xs mx-auto">
          Initializing your intelligent academic recovery assistant...
        </p>
        <div className="mt-12">
          <div className="w-12 h-1 border-2 border-gray-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary-blue w-1/2 animate-[loading_1s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
            @keyframes loading {
                0% { transform: translateX(-100%); width: 30%; }
                50% { width: 60%; }
                100% { transform: translateX(200%); width: 30%; }
            }
        `}</style>
    </div>
  );
}
