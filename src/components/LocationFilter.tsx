'use client';

import { Location } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  locations: Location[];
  selectedLocation: number | null;
  onChange: (locationId: number | null) => void;
}

export default function LocationFilter({ locations, selectedLocation, onChange }: LocationFilterProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-gray-900 text-sm">지관서가 선택</h3>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => onChange(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedLocation === null
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          전체 보기
        </button>
        {(locations ?? []).map(location => (
          <button
            key={location.id}
            onClick={() => onChange(location.id)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedLocation === location.id
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
}
