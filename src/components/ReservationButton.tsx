'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Activity } from '@/lib/types';
import { UserPlus, UserMinus, LogIn } from 'lucide-react';
import Link from 'next/link';

interface ReservationButtonProps {
  activity: Activity;
  onReservationChange?: () => void;
}

export default function ReservationButton({ activity, onReservationChange }: ReservationButtonProps) {
  const { user } = useAuth();
  const [hasReservation, setHasReservation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const isFull = (activity.reservation_count ?? 0) >= activity.max_participants;

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    checkReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activity.id]);

  const checkReservation = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reservations')
      .select('id')
      .eq('activity_id', activity.id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();
    setHasReservation(!!data);
    setChecking(false);
  };

  const handleReserve = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('reservations').insert({
      activity_id: activity.id,
      user_id: user.id,
      status: 'confirmed',
    });
    if (!error) {
      setHasReservation(true);
      onReservationChange?.();
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('activity_id', activity.id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed');
    if (!error) {
      setHasReservation(false);
      onReservationChange?.();
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        <LogIn className="w-5 h-5" />
        로그인 후 예약하기
      </Link>
    );
  }

  if (checking) {
    return (
      <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg font-medium text-center">
        확인 중...
      </div>
    );
  }

  if (hasReservation) {
    return (
      <button
        onClick={handleCancel}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <UserMinus className="w-5 h-5" />
        {loading ? '취소 중...' : '예약 취소'}
      </button>
    );
  }

  if (isFull) {
    return (
      <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg font-medium text-center">
        정원이 마감되었습니다
      </div>
    );
  }

  return (
    <button
      onClick={handleReserve}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
      <UserPlus className="w-5 h-5" />
      {loading ? '예약 중...' : '참여 예약하기'}
    </button>
  );
}
