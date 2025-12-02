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
    <div className="soft-card p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
