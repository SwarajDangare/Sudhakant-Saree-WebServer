'use client';

import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'order' | 'product' | 'customer' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'product':
        return 'bg-purple-100 text-purple-600';
      case 'customer':
        return 'bg-green-100 text-green-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="soft-card p-4">
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
        <p className="text-xs text-gray-500 mt-0.5">Latest updates from your store</p>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-2xl mb-1">📭</div>
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(
                  activity.type
                )}`}
              >
                <span className="text-sm">{activity.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">{activity.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                  {activity.description}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
