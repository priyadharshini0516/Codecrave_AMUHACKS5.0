'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    Bell,
    User,
    LogOut,
    Sparkles,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'My Subjects', icon: BookOpen, href: '/subjects' },
    { name: 'Schedule', icon: Calendar, href: '/schedule' },
    { name: 'Stress ARIS', icon: Sparkles, href: '/aris' },
];

const secondaryItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Profile', icon: User, href: '/profile' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-white font-bold text-xl italic">P</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-blue to-purple-600 bg-clip-text text-transparent">
                        PARE
                    </span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-blue-50 text-primary-blue"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon size={20} className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary-blue" : "text-gray-400 group-hover:text-gray-900"
                                )} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-2">
                <div className="pt-4 border-t border-gray-50 mb-4">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Account
                    </p>
                    {secondaryItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 group text-sm",
                                    isActive
                                        ? "bg-blue-50 text-primary-blue"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon size={18} className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary-blue" : "text-gray-400 group-hover:text-gray-900"
                                )} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Weekly Progress</p>
                    <div className="w-full bg-blue-100 rounded-full h-1.5 mb-2">
                        <div className="bg-primary-blue h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-[10px] text-blue-500 font-medium tracking-tight">
                        Keep it up! You're on track for recovery.
                    </p>
                </div>
            </div>
        </aside>
    );
}
