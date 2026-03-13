'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Activity, Reservation } from '@/lib/types';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Users,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';

export default function ManagePage() {
  const params = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const fetchActivity = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) setActivity(data as Activity);
    setLoading(false);
  }, [params.id]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('activity_id', params.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });
    if (data) setParticipants(data as Reservation[]);
  }, [params.id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    // 연락처 숫자만 비교
    const inputDigits = phoneInput.replace(/\D/g, '');
    const creatorDigits = activity.creator_phone.replace(/\D/g, '');

    if (inputDigits === creatorDigits) {
      setAuthenticated(true);
      setAuthError('');
      fetchParticipants();
    } else {
      setAuthError('등록자 연락처와 일치하지 않습니다');
    }
  };

  const copyPhones = () => {
    const phones = participants.map((p) => p.participant_phone).join(', ');
    navigator.clipboard.writeText(phones);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2000);
  };

  const copyEmails = () => {
    const emails = participants
      .map((p) => p.participant_email)
      .filter(Boolean)
      .join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  const downloadCSV = () => {
    if (participants.length === 0) return;

    const headers = ['이름', '연락처', '이메일', '지역', '신청일시'];
    const rows = participants.map((p) => [
      p.participant_name,
      p.participant_phone,
      p.participant_email || '',
      p.participant_region || '',
      format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    // Add custom answers headers if any
    const firstCustom = participants.find((p) => p.custom_answers);
    if (firstCustom?.custom_answers) {
      const customKeys = Object.keys(firstCustom.custom_answers).filter(
        (k) => !['name', 'phone', 'email', 'region'].includes(k)
      );
      headers.push(...customKeys);
      rows.forEach((row, i) => {
        const answers = participants[i].custom_answers || {};
        customKeys.forEach((key) => {
          const val = answers[key];
          row.push(Array.isArray(val) ? val.join('; ') : (val as string) || '');
        });
      });
    }

    const BOM = '\uFEFF';
    const csv =
      BOM + headers.join(',') + '\n' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activity?.title || '참여자'}_목록.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // 인증 화면
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Link
          href={`/activities/${params.id}`}
          className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          활동 상세로 돌아가기
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">참여자 관리</h1>
          <p className="text-sm text-gray-500">
            <strong>{activity.title}</strong>
            <br />
            등록자 연락처를 입력하여 접근하세요.
          </p>

          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="등록자 연락처 (010-1234-5678)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-center"
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 관리 화면
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href={`/activities/${params.id}`}
        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        활동 상세로 돌아가기
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{activity.title}</h1>
        <p className="text-sm text-gray-500 mt-1">참여자 관리</p>
      </div>

      {/* 요약 & 도구 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">
            총 {participants.length}명 신청
          </h2>
          <span className="text-sm text-gray-500">
            정원 {activity.max_participants}명
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyPhones}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {copiedPhones ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            {copiedPhones ? '복사됨!' : '연락처 전체 복사'}
          </button>
          <button
            onClick={copyEmails}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {copiedEmails ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {copiedEmails ? '복사됨!' : '이메일 전체 복사'}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV 다운로드
          </button>
        </div>
      </div>

      {/* 참여자 목록 */}
      {participants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">아직 신청자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((p, index) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-gray-900">{p.participant_name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 ml-8">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {p.participant_phone}
                    </span>
                    {p.participant_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {p.participant_email}
                      </span>
                    )}
                    {p.participant_region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.participant_region}
                      </span>
                    )}
                  </div>

                  {/* 커스텀 답변 */}
                  {p.custom_answers && (
                    <div className="ml-8 mt-2 space-y-1">
                      {Object.entries(p.custom_answers)
                        .filter(([key]) => !['name', 'phone', 'email', 'region'].includes(key))
                        .map(([key, val]) => (
                          <p key={key} className="text-xs text-gray-400">
                            <span className="text-gray-500">{key}:</span>{' '}
                            {Array.isArray(val) ? val.join(', ') : val}
                          </p>
                        ))}
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-400 flex-shrink-0">
                  {format(new Date(p.created_at), 'M/d HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
