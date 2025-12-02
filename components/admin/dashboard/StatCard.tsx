'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string;
}

export default function StatCard({ label, value, icon, trend, gradient }: StatCardProps) {
  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between">
        {/* Left side - Text content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>

        {/* Right side - Icon */}
        <div className={`stat-card-icon ${gradient}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
