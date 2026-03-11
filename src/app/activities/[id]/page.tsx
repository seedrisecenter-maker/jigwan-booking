'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import ReservationButton from '@/components/ReservationButton';
import { Activity, ACTIVITY_TYPE_LABELS, LOCATIONS, Reservation } from '@/lib/types';
import { ArrowLeft, Calendar, MapPin, Users, Clock, User, Pencil, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useLocations } from '@/hooks/useLocations';
import { ACTIVITY_TYPE_LABELS as TYPE_LABELS, ActivityType } from '@/lib/types';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { locations } = useLocations();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    activity_type: 'lecture' as ActivityType,
    location_id: '',
    start_date: '',
    start_time: '',
    end_time: '',
    max_participants: '',
  });

  const fetchActivity = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select(`
        *,
        location:locations(*),
        creator:profiles!creator_id(name),
        reservation_count:reservations(count)
      `)
      .eq('id', params.id)
      .single();

    if (data) {
      const mapped = {
        ...data,
        reservation_count: Array.isArray(data.reservation_count) && data.reservation_count.length > 0
          ? (data.reservation_count[0] as { count: number }).count
          : 0,
      };
      setActivity(mapped as Activity);
    }
    setLoading(false);
  }, [params.id]);

  const fetchParticipants = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reservations')
      .select('*, user:profiles!user_id(name, phone)')
      .eq('activity_id', params.id)
      .eq('status', 'confirmed');
    if (data) setParticipants(data as Reservation[]);
  }, [params.id, user]);

  useEffect(() => {
    fetchActivity();
    fetchParticipants();
  }, [fetchActivity, fetchParticipants]);

  // isOwner: 본인이 만든 활동만 수정/삭제 가능, isAdmin: 모든 활동 수정/삭제 가능
  const isOwner = user?.id === activity?.creator_id;
  const canManage = isOwner || isAdmin;

  const startEditing = () => {
    if (!activity) return;
    const start = new Date(activity.start_date);
    const end = activity.end_date ? new Date(activity.end_date) : start;
    setEditForm({
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      location_id: String(activity.location_id),
      start_date: format(start, 'yyyy-MM-dd'),
      start_time: format(start, 'HH:mm'),
      end_time: format(end, 'HH:mm'),
      max_participants: String(activity.max_participants),
    });
    setEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    const startDate = `${editForm.start_date}T${editForm.start_time}:00`;
    const endDate = `${editForm.start_date}T${editForm.end_time}:00`;

    const { error } = await supabase
      .from('activities')
      .update({
        title: editForm.title,
        description: editForm.description,
        activity_type: editForm.activity_type,
        location_id: parseInt(editForm.location_id),
        start_date: startDate,
        end_date: endDate,
        max_participants: parseInt(editForm.max_participants),
      })
      .eq('id', activity.id);

    if (!error) {
      setEditing(false);
      fetchActivity();
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    if (!confirm('이 활동을 삭제하시겠습니까? 모든 예약도 함께 삭제됩니다.')) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activity.id);

    if (!error) {
      router.push('/activities');
    }
  };

  const handleCancel = async () => {
    if (!activity) return;
    if (!confirm('이 활동을 취소하시겠습니까?')) return;

    const { error } = await supabase
      .from('activities')
      .update({ status: 'cancelled' })
      .eq('id', activity.id);

    if (!error) fetchActivity();
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">로딩 중...</div>;
  }

  if (!activity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">활동을 찾을 수 없습니다</h2>
        <Link href="/activities" className="text-indigo-600 font-medium hover:underline">
          활동 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const location = activity.location || LOCATIONS.find(l => l.id === activity.location_id);
  const typeLabel = ACTIVITY_TYPE_LABELS[activity.activity_type];

  const typeColorClass = {
    lecture: 'bg-indigo-100 text-indigo-700',
    reading_group: 'bg-emerald-100 text-emerald-700',
    humanities: 'bg-amber-100 text-amber-700',
  }[activity.activity_type];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/activities" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        활동 목록으로 돌아가기
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {/* Edit mode */}
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">활동 수정</h2>
              <button type="button" onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활동 유형</label>
              <div className="flex gap-2">
                {(Object.entries(TYPE_LABELS) as [ActivityType, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, activity_type: value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      editForm.activity_type === value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input type="text" required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
              <select required value={editForm.location_id} onChange={e => setEditForm({ ...editForm, location_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                {(locations ?? []).map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input type="date" required value={editForm.start_date} onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작</label>
                <input type="time" required value={editForm.start_time} onChange={e => setEditForm({ ...editForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료</label>
                <input type="time" required value={editForm.end_time} onChange={e => setEditForm({ ...editForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
              <input type="number" required min="1" value={editForm.max_participants} onChange={e => setEditForm({ ...editForm, max_participants: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              수정 완료
            </button>
          </form>
        ) : (
          <>
            {/* View mode */}
            <div className="flex items-start justify-between mb-4">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${typeColorClass}`}>
                {typeLabel}
              </span>
              <div className="flex items-center gap-2">
                {activity.status === 'cancelled' && (
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">
                    취소됨
                  </span>
                )}
                {/* 본인 활동이거나 관리자만 수정/삭제 가능 */}
                {canManage && activity.status === 'active' && (
                  <>
                    <button onClick={startEditing} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="수정">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-amber-600 transition-colors" title="취소">
                      <X className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="삭제">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{activity.title}</h1>

            {activity.description && (
              <p className="text-gray-600 mb-6 whitespace-pre-wrap">{activity.description}</p>
            )}

            <div className="grid gap-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{format(new Date(activity.start_date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>
                  {format(new Date(activity.start_date), 'HH:mm', { locale: ko })}
                  {activity.end_date && ` ~ ${format(new Date(activity.end_date), 'HH:mm', { locale: ko })}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{location?.name}{location?.address ? ` - ${location.address}` : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span>참여자 {activity.reservation_count ?? 0} / {activity.max_participants}명</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span>주최: {(activity.creator as unknown as { name: string })?.name || '알 수 없음'}</span>
              </div>
            </div>

            {activity.status === 'active' && (
              <ReservationButton
                activity={activity}
                onReservationChange={() => {
                  fetchActivity();
                  fetchParticipants();
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Participant list - 본인 활동 주최자 또는 관리자만 볼 수 있음 */}
      {canManage && participants.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">참여자 목록 ({participants.length}명)</h2>
          <div className="divide-y divide-gray-100">
            {participants.map((reservation) => {
              const participant = reservation.user as unknown as { name: string; phone: string } | undefined;
              return (
                <div key={reservation.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{participant?.name || '알 수 없음'}</p>
                    <p className="text-sm text-gray-500">{participant?.phone}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(reservation.created_at), 'M/d HH:mm')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
