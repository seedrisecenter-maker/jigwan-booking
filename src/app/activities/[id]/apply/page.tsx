'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ApplicationForm from '@/components/ApplicationForm';
import { Activity, ACTIVITY_TYPE_LABELS, DEFAULT_FORM_FIELDS, FormField } from '@/lib/types';
import { Calendar, MapPin, Users, Clock, User, DollarSign, BookOpen, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ApplyPage() {
  const params = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleSubmit = async (answers: Record<string, string | string[]>) => {
    if (!activity) return;

    const { error } = await supabase.from('reservations').insert({
      activity_id: activity.id,
      participant_name: (answers.name as string) || '',
      participant_phone: (answers.phone as string) || '',
      participant_email: (answers.email as string) || '',
      participant_region: (answers.region as string) || '',
      custom_answers: answers,
      status: 'confirmed',
    });

    if (error) {
      throw new Error(error.message);
    }

    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 mb-2">활동을 찾을 수 없습니다</h2>
        <Link href="/" className="text-indigo-600 font-medium hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const location = activity.location;
  const formFields: FormField[] = activity.form_fields || DEFAULT_FORM_FIELDS;
  const isFull = (activity.reservation_count ?? 0) >= activity.max_participants;

  // 제출 완료
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">신청이 완료되었습니다!</h1>
          <p className="text-gray-600">
            <strong>{activity.title}</strong>에 신청해 주셔서 감사합니다.
            <br />
            추후 연락드리겠습니다.
          </p>
          <Link
            href={`/activities/${activity.id}`}
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            활동 상세로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center space-y-3">
            <p className="text-indigo-200 text-sm font-medium">止觀書架 지관서가</p>
            <h1 className="text-2xl font-bold leading-tight">{activity.title}</h1>
            <span className="inline-block bg-indigo-600 text-indigo-100 text-xs font-medium px-3 py-1 rounded-full">
              {ACTIVITY_TYPE_LABELS[activity.activity_type]}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 활동 정보 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">활동 정보</h2>

          <div className="grid gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span>
                {format(new Date(activity.start_date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span>
                {format(new Date(activity.start_date), 'HH:mm')}
                {activity.end_date && ` ~ ${format(new Date(activity.end_date), 'HH:mm')}`}
                {activity.schedule_text && ` (${activity.schedule_text})`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span>
                {location?.name}
                {location?.address ? ` - ${location.address}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span>
                참여자 {activity.reservation_count ?? 0} / {activity.max_participants}명
              </span>
            </div>
            {activity.fee && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span>참가비: {activity.fee}</span>
              </div>
            )}
            {activity.creator_name && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span>주최: {activity.creator_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 활동 소개 */}
        {activity.description && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3">활동 소개</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {activity.description}
            </p>
          </div>
        )}

        {/* 커리큘럼 */}
        {activity.curriculum && activity.curriculum.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
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
                    {item.desc && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 강연자 정보 */}
        {activity.speaker_name && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3">강연자/진행자</h2>
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="font-bold text-amber-900 text-lg mb-2">참여 당부사항</h2>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{activity.notice}</p>
          </div>
        )}

        {/* 신청서 */}
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-6 text-center">참여 신청서</h2>

          {isFull ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">정원이 마감되었습니다</p>
            </div>
          ) : (
            <ApplicationForm fields={formFields} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
