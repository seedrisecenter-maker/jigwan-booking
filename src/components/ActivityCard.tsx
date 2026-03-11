'use client';

import Link from 'next/link';
import { Activity, ACTIVITY_TYPE_LABELS } from '@/lib/types';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const location = activity.location;
  const isFull = activity.reservation_count !== undefined && activity.reservation_count >= activity.max_participants;
  const typeLabel = ACTIVITY_TYPE_LABELS[activity.activity_type];

  const typeColorClass = {
    lecture: 'bg-indigo-100 text-indigo-700',
    reading_group: 'bg-emerald-100 text-emerald-700',
    humanities: 'bg-amber-100 text-amber-700',
  }[activity.activity_type];

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColorClass}`}>
          {typeLabel}
        </span>
        {isFull && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            마감
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{activity.title}</h3>

      {activity.description && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{activity.description}</p>
      )}

      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{format(new Date(activity.start_date), 'M월 d일 (EEE) HH:mm', { locale: ko })}</span>
        </div>
        {activity.end_date && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>~ {format(new Date(activity.end_date), 'HH:mm', { locale: ko })}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{location?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{activity.reservation_count ?? 0} / {activity.max_participants}명</span>
        </div>
      </div>
    </Link>
  );
}
