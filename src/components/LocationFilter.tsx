'use client';

import { Location, Activity } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  locations: Location[];
  selectedLocation: number | null;
  onChange: (locationId: number | null) => void;
  activities?: Activity[];
}

export default function LocationFilter({ locations, selectedLocation, onChange, activities = [] }: LocationFilterProps) {
  const countByLocation = (locId: number) =>
    activities.filter(a => a.location_id === locId).length;

  // Group locations by city
  const citiesMap = new Map<string, Location[]>();
  for (const loc of locations ?? []) {
    const list = citiesMap.get(loc.city) || [];
    list.push(loc);
    citiesMap.set(loc.city, list);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-gray-900 text-sm">지관서가 선택</h3>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => onChange(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
            selectedLocation === null
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>전체 지관서가</span>
          {activities.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
              {activities.length}
            </span>
          )}
        </button>

        {[...citiesMap.entries()].map(([city, locs]) => (
          <div key={city}>
            {citiesMap.size > 1 && (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-0.5">
                {city}
              </div>
            )}
            {locs.map(location => {
              const count = countByLocation(location.id);
              return (
                <button
                  key={location.id}
                  onClick={() => onChange(location.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedLocation === location.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{location.name}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-gray-400">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
