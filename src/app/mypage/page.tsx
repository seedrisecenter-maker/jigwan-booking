'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Reservation, ACTIVITY_TYPE_LABELS, LOCATIONS } from '@/lib/types';
import { User, Calendar, MapPin, Clock, Trash2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MyPage() {
  const { user, profile, isCreator, loading: authLoading } = useAuth();
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reservations' | 'activities'>('reservations');

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [resResult, actResult] = await Promise.all([
      supabase
        .from('reservations')
        .select('*, activity:activities(*, location:locations(*))')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false }),
      isCreator
        ? supabase
            .from('activities')
            .select('*, location:locations(*), reservation_count:reservations(count)')
            .eq('creator_id', user.id)
            .order('start_date', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    if (resResult.data) setMyReservations(resResult.data as Reservation[]);
    if (actResult.data) {
      const mapped = (actResult.data as Record<string, unknown>[]).map(item => ({
        ...item,
        reservation_count: Array.isArray(item.reservation_count) && (item.reservation_count as Array<{ count: number }>).length > 0
          ? (item.reservation_count as Array<{ count: number }>)[0].count
          : 0,
      }));
      setMyActivities(mapped as Activity[]);
    }
    setLoading(false);
  }, [user, isCreator]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleCancelReservation = async (reservationId: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);
    if (!error) fetchData();
  };

  const handleCancelActivity = async (activityId: string) => {
    const { error } = await supabase
      .from('activities')
      .update({ status: 'cancelled' })
      .eq('id', activityId);
    if (!error) fetchData();
  };

  if (authLoading || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">로딩 중...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">로그인하기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              profile?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : profile?.role === 'creator'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {profile?.role === 'admin' ? '관리자' : profile?.role === 'creator' ? '활동 등록자' : '일반 회원'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('reservations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'reservations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          내 예약 ({myReservations.length})
        </button>
        {isCreator && (
          <button
            onClick={() => setTab('activities')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === 'activities' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            내 활동 ({myActivities.length})
          </button>
        )}
      </div>

      {/* Content */}
      {tab === 'reservations' && (
        <div className="space-y-3">
          {myReservations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>아직 예약한 활동이 없습니다</p>
              <Link href="/activities" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                활동 둘러보기
              </Link>
            </div>
          ) : (
            myReservations.map((res) => {
              const act = res.activity as Activity | undefined;
              if (!act) return null;
              const loc = act.location || LOCATIONS.find(l => l.id === act.location_id);
              return (
                <div key={res.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                  <Link href={`/activities/${act.id}`} className="flex-1">
                    <p className="font-semibold text-gray-900 hover:text-indigo-600">{act.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(act.start_date), 'M/d (EEE) HH:mm', { locale: ko })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {loc?.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        { lecture: 'bg-indigo-50 text-indigo-600', reading_group: 'bg-emerald-50 text-emerald-600', humanities: 'bg-amber-50 text-amber-600' }[act.activity_type]
                      }`}>
                        {ACTIVITY_TYPE_LABELS[act.activity_type]}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleCancelReservation(res.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="예약 취소"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'activities' && (
        <div className="space-y-3">
          {myActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>등록한 활동이 없습니다</p>
              <Link href="/activities/new" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                새 활동 등록하기
              </Link>
            </div>
          ) : (
            myActivities.map((act) => {
              const loc = act.location || LOCATIONS.find(l => l.id === act.location_id);
              return (
                <div key={act.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                  <Link href={`/activities/${act.id}`} className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 hover:text-indigo-600">{act.title}</p>
                      {act.status === 'cancelled' && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">취소됨</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(act.start_date), 'M/d (EEE) HH:mm', { locale: ko })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {loc?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.reservation_count ?? 0}/{act.max_participants}명
                      </span>
                    </div>
                  </Link>
                  {act.status === 'active' && (
                    <button
                      onClick={() => handleCancelActivity(act.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="활동 취소"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
