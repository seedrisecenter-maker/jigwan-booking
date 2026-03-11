'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ACTIVITY_TYPE_LABELS, ActivityType } from '@/lib/types';
import { useLocations } from '@/hooks/useLocations';

export default function ActivityForm() {
  const { locations } = useLocations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFromCalendar = searchParams.get('date') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    creator_name: '',
    creator_phone: '',
    title: '',
    description: '',
    activity_type: 'lecture' as ActivityType,
    location_id: '',
    start_date: dateFromCalendar,
    start_time: '',
    end_time: '',
    max_participants: '20',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const startDate = `${form.start_date}T${form.start_time}:00`;
    const endDate = `${form.start_date}T${form.end_time}:00`;

    const { error: insertError } = await supabase.from('activities').insert({
      title: form.title,
      description: form.description,
      activity_type: form.activity_type,
      location_id: parseInt(form.location_id),
      creator_name: form.creator_name,
      creator_phone: form.creator_phone,
      start_date: startDate,
      end_date: endDate,
      max_participants: parseInt(form.max_participants),
      status: 'active',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/activities');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-indigo-900 text-sm">등록자 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              required
              value={form.creator_name}
              onChange={e => setForm({ ...form, creator_name: e.target.value })}
              placeholder="홍길동"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
            <input
              type="tel"
              required
              value={form.creator_phone}
              onChange={e => setForm({ ...form, creator_phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">활동 유형</label>
        <div className="flex gap-3">
          {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, activity_type: value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.activity_type === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="예: 니체 읽기 독서모임"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="활동에 대한 설명을 작성해주세요"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
        <select
          required
          value={form.location_id}
          onChange={e => setForm({ ...form, location_id: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        >
          <option value="">장소를 선택하세요</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input
            type="date"
            required
            value={form.start_date}
            onChange={e => setForm({ ...form, start_date: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
          <input
            type="time"
            required
            value={form.start_time}
            onChange={e => setForm({ ...form, start_time: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
          <input
            type="time"
            required
            value={form.end_time}
            onChange={e => setForm({ ...form, end_time: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">최대 참여 인원</label>
        <input
          type="number"
          required
          min="1"
          max="500"
          value={form.max_participants}
          onChange={e => setForm({ ...form, max_participants: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '등록 중...' : '활동 등록하기'}
      </button>
    </form>
  );
}
