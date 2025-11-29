'use client';

import { ReactNode } from 'react';

interface StatCardCleanProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
}

export default function StatCardClean({ label, value, icon, iconBgColor }: StatCardCleanProps) {
  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
