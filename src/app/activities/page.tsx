'use client';

import { useState } from 'react';
import ActivityCard from '@/components/ActivityCard';
import LocationFilter from '@/components/LocationFilter';
import { useActivities } from '@/hooks/useActivities';
import { useLocations } from '@/hooks/useLocations';
import { ACTIVITY_TYPE_LABELS, ActivityType } from '@/lib/types';
import { List } from 'lucide-react';

export default function ActivitiesPage() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const { activities, loading } = useActivities(selectedLocation ?? undefined);
  const { locations } = useLocations();

  const filteredActivities = selectedType
    ? activities.filter(a => a.activity_type === selectedType)
    : activities;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <List className="w-6 h-6 text-indigo-600" />
          활동 목록
        </h1>
        <p className="text-gray-500 mt-1">참여 가능한 인문활동을 확인하세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0 space-y-4">
          <LocationFilter
            locations={locations}
            selectedLocation={selectedLocation}
            onChange={setSelectedLocation}
          />

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">활동 유형</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedType(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === null ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedType === value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400">로딩 중...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">등록된 활동이 없습니다</p>
              <p className="text-sm">새로운 활동이 등록되면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
