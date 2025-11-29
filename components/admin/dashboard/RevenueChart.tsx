'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="soft-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Sales Analytics</h3>
        <p className="text-sm text-gray-500 mt-1">Revenue trend over the last 30 days</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#667eea"
            strokeWidth={3}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-lg font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.orders, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Avg Order Value</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{Math.round(
              data.reduce((sum, item) => sum + item.revenue, 0) /
              data.reduce((sum, item) => sum + item.orders, 0)
            ).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
