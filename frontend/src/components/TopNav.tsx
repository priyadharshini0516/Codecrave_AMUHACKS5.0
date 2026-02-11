'use client';

import React from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TopNav() {
    const { user, logout } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-blue transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search subjects, topics, or tasks..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-100 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Level 1 Recovery</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        <span className="text-primary-blue font-bold text-xs">{user?.name?.charAt(0)}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
