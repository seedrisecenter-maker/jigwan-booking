'use client';

import { useState } from 'react';
import CalendarView from '@/components/Calendar';
import LocationFilter from '@/components/LocationFilter';
import { useActivities } from '@/hooks/useActivities';
import { useLocations } from '@/hooks/useLocations';
import { ACTIVITY_TYPE_LABELS, ActivityType } from '@/lib/types';

export default function Home() {
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
        <h1 className="text-2xl font-bold text-gray-900">인문활동 캘린더</h1>
        <p className="text-gray-500 mt-1">지관서가에서 진행되는 강연, 독서모임, 인문활동을 확인하고 참여하세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0 space-y-4">
          <LocationFilter
            locations={locations}
            selectedLocation={selectedLocation}
            onChange={setSelectedLocation}
          />

          {/* Activity type filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">활동 유형</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedType(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === null
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedType === value
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              로딩 중...
            </div>
          ) : (
            <CalendarView activities={filteredActivities} />
          )}
        </div>
      </div>
    </div>
  );
}
