'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/lib/types';
import { UserPlus, Check } from 'lucide-react';

interface ReservationButtonProps {
  activity: Activity;
  onReservationChange?: () => void;
}

export default function ReservationButton({ activity, onReservationChange }: ReservationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });

  const isFull = (activity.reservation_count ?? 0) >= activity.max_participants;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('reservations').insert({
      activity_id: activity.id,
      participant_name: form.name,
      participant_phone: form.phone,
      status: 'confirmed',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    onReservationChange?.();
  };

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-green-50 text-green-700 py-3 rounded-lg font-medium">
        <Check className="w-5 h-5" />
        예약이 완료되었습니다!
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg font-medium text-center">
        정원이 마감되었습니다
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        <UserPlus className="w-5 h-5" />
        참여 예약하기
      </button>
    );
  }

  return (
    <form onSubmit={handleReserve} className="space-y-3 bg-indigo-50 p-4 rounded-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="이름"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
        />
      </div>
      <div>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="연락처 (010-1234-5678)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? '예약 중...' : '예약 확정'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          취소
        </button>
      </div>
    </form>
  );
}
