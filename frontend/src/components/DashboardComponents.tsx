'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
}

export function DashboardCard({ children, className, title, subtitle, icon: Icon, action }: CardProps) {
    return (
        <div className={cn("glass-card p-6 flex flex-col", className)}>
            {(title || Icon || action) && (
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary-blue">
                                <Icon size={20} />
                            </div>
                        )}
                        <div>
                            {title && <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>}
                            {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

interface ProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    subLabel?: string;
}

export function ProgressRing({
    value,
    max = 100,
    size = 120,
    strokeWidth = 10,
    color = "var(--primary-blue)",
    label,
    subLabel
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const offset = circumference - percentage * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-100"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {label && <span className="text-2xl font-bold text-gray-900 leading-none">{label}</span>}
                {subLabel && <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{subLabel}</span>}
            </div>
        </div>
    );
}

export function ProgressBar({ value, max = 100, color = "bg-primary-blue", className }: { value: number, max?: number, color?: string, className?: string }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const isHex = color.startsWith('#');

    return (
        <div className={cn("w-full bg-gray-100 rounded-full h-2 overflow-hidden", className)}>
            <div
                className={cn("h-full transition-all duration-1000 ease-out rounded-full", !isHex && color)}
                style={{
                    width: `${percentage}%`,
                    backgroundColor: isHex ? color : undefined
                }}
            />
        </div>
    );
}
