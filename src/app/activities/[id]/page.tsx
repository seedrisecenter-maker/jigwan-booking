'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Activity, ACTIVITY_TYPE_LABELS, Reservation } from '@/lib/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  DollarSign,
  BookOpen,
  FileText,
  Settings,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ActivityDetailPage() {
  const params = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchActivity = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select(`
        *,
        location:locations(*),
        reservation_count:reservations(count)
      `)
      .eq('id', params.id)
      .single();

    if (data) {
      const mapped = {
        ...data,
        reservation_count:
          Array.isArray(data.reservation_count) && data.reservation_count.length > 0
            ? (data.reservation_count[0] as { count: number }).count
            : 0,
      };
      setActivity(mapped as Activity);
    }
    setLoading(false);
  }, [params.id]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('activity_id', params.id)
      .eq('status', 'confirmed');
    if (data) setParticipants(data as Reservation[]);
  }, [params.id]);

  useEffect(() => {
    fetchActivity();
    fetchParticipants();
  }, [fetchActivity, fetchParticipants]);

  const copyApplyLink = () => {
    const url = `${window.location.origin}/activities/${params.id}/apply`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">로딩 중...</div>
    );
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

  const location = activity.location;
  const typeLabel = ACTIVITY_TYPE_LABELS[activity.activity_type];

  const typeColorClass = {
    lecture: 'bg-indigo-100 text-indigo-700',
    reading_group: 'bg-emerald-100 text-emerald-700',
    humanities: 'bg-amber-100 text-amber-700',
  }[activity.activity_type];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/activities"
        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        활동 목록으로 돌아가기
      </Link>

      {/* 메인 정보 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${typeColorClass}`}>
            {typeLabel}
          </span>
          {activity.status === 'cancelled' && (
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">
              취소됨
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{activity.title}</h1>

        {activity.description && (
          <p className="text-gray-600 mb-6 whitespace-pre-wrap">{activity.description}</p>
        )}

        <div className="grid gap-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>
              {format(new Date(activity.start_date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span>
              {format(new Date(activity.start_date), 'HH:mm', { locale: ko })}
              {activity.end_date &&
                ` ~ ${format(new Date(activity.end_date), 'HH:mm', { locale: ko })}`}
              {activity.schedule_text && (
                <span className="text-gray-400 ml-2">({activity.schedule_text})</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span>
              {location?.name}
              {location?.address ? ` - ${location.address}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <span>
              참여자 {activity.reservation_count ?? 0} / {activity.max_participants}명
            </span>
          </div>
          {activity.fee && (
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span>참가비: {activity.fee}</span>
            </div>
          )}
          {activity.creator_name && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span>주최: {activity.creator_name}</span>
            </div>
          )}
        </div>

        {/* 신청하기 & 관리 버튼 */}
        {activity.status === 'active' && (
          <div className="space-y-3">
            <Link
              href={`/activities/${activity.id}/apply`}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              참여 신청하기
            </Link>

            <div className="flex gap-2">
              <button
                onClick={copyApplyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    신청 링크 복사
                  </>
                )}
              </button>
              <Link
                href={`/activities/${activity.id}/manage`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                참여자 관리
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 커리큘럼 */}
      {activity.curriculum && activity.curriculum.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            커리큘럼
          </h2>
          <div className="space-y-3">
            {activity.curriculum.map((item, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded flex-shrink-0 h-fit">
                  {item.week}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.desc && <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 강연자 정보 */}
      {activity.speaker_name && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">강연자/진행자</h2>
          <p className="text-sm font-medium text-gray-900">{activity.speaker_name}</p>
          {activity.speaker_bio && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {activity.speaker_bio}
            </p>
          )}
        </div>
      )}

      {/* 당부사항 */}
      {activity.notice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-amber-900 mb-2">참여 당부사항</h2>
          <p className="text-sm text-amber-800 whitespace-pre-wrap">{activity.notice}</p>
        </div>
      )}

      {/* 참여자 목록 */}
      {participants.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">참여자 목록 ({participants.length}명)</h2>
          <div className="divide-y divide-gray-100">
            {participants.map((reservation) => (
              <div key={reservation.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{reservation.participant_name}</p>
                  <p className="text-sm text-gray-500">{reservation.participant_phone}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(reservation.created_at), 'M/d HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
