'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ACTIVITY_TYPE_LABELS,
  ActivityType,
  CurriculumItem,
  FormField,
  DEFAULT_FORM_FIELDS,
} from '@/lib/types';
import { useLocations } from '@/hooks/useLocations';
import CurriculumEditor from './CurriculumEditor';
import FormFieldEditor from './FormFieldEditor';
import ApplicationForm from './ApplicationForm';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';

export default function ActivityForm() {
  const { locations } = useLocations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFromCalendar = searchParams.get('date') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Step 1 데이터
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
    // 확장 필드
    speaker_name: '',
    speaker_bio: '',
    fee: '무료',
    schedule_text: '',
    notice: '',
  });

  // Step 1 확장 데이터
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);

  // Step 2 데이터
  const [formFields, setFormFields] = useState<FormField[]>([...DEFAULT_FORM_FIELDS]);

  const validateStep1 = (): boolean => {
    if (!form.creator_name.trim()) { setError('등록자 이름을 입력하세요'); return false; }
    if (!form.creator_phone.trim()) { setError('등록자 연락처를 입력하세요'); return false; }
    if (!form.title.trim()) { setError('제목을 입력하세요'); return false; }
    if (!form.location_id) { setError('장소를 선택하세요'); return false; }
    if (!form.start_date) { setError('날짜를 선택하세요'); return false; }
    if (!form.start_time) { setError('시작 시간을 입력하세요'); return false; }
    if (!form.end_time) { setError('종료 시간을 입력하세요'); return false; }
    return true;
  };

  const goToStep2 = () => {
    setError('');
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const startDate = `${form.start_date}T${form.start_time}:00`;
    const endDate = `${form.start_date}T${form.end_time}:00`;

    const { data, error: insertError } = await supabase
      .from('activities')
      .insert({
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
        speaker_name: form.speaker_name || null,
        speaker_bio: form.speaker_bio || null,
        curriculum: curriculum.length > 0 ? curriculum : null,
        fee: form.fee || null,
        schedule_text: form.schedule_text || null,
        notice: form.notice || null,
        form_fields: formFields,
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      router.push(`/activities/${data.id}`);
    } else {
      router.push('/activities');
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center justify-center gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            step === 1
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
            1
          </span>
          활동 정보
        </div>
        <div className="w-8 h-0.5 bg-gray-300" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            step === 2
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
            2
          </span>
          신청서 설정
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step 1: 활동 정보 */}
      {step === 1 && (
        <div className="space-y-6">
          {/* 등록자 정보 */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-indigo-900 text-sm">등록자 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  required
                  value={form.creator_name}
                  onChange={(e) => setForm({ ...form, creator_name: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, creator_phone: e.target.value })}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* 활동 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">활동 유형</label>
            <div className="flex gap-3">
              {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(
                ([value, label]) => (
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
                )
              )}
            </div>
          </div>

          {/* 제목, 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="예: 니체 읽기 독서모임"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">활동 소개</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="활동에 대한 상세한 소개를 작성해주세요"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* 강연자 정보 */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-amber-900 text-sm">
              강연자/진행자 정보 <span className="text-amber-500 font-normal">(선택)</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={form.speaker_name}
                onChange={(e) => setForm({ ...form, speaker_name: e.target.value })}
                placeholder="예: 김남호 (경력, 소속 등)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
              <textarea
                rows={3}
                value={form.speaker_bio}
                onChange={(e) => setForm({ ...form, speaker_bio: e.target.value })}
                placeholder="강연자/진행자에 대한 소개를 작성해주세요"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* 커리큘럼 */}
          <CurriculumEditor items={curriculum} onChange={setCurriculum} />

          {/* 장소, 날짜, 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소 *</label>
            <select
              required
              value={form.location_id}
              onChange={(e) => setForm({ ...form, location_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">장소를 선택하세요</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜 *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간 *</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간 *</label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* 일정 설명, 참가비, 정원 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                일정 설명 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={form.schedule_text}
                onChange={(e) => setForm({ ...form, schedule_text: e.target.value })}
                placeholder="예: 매주 화요일 14:00~16:00, 총7회"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">참가비</label>
                <input
                  type="text"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder="무료"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="500"
                  value={form.max_participants}
                  onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* 당부사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              참여 당부사항 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              rows={3}
              value={form.notice}
              onChange={(e) => setForm({ ...form, notice: e.target.value })}
              placeholder="참여자에게 안내할 주의사항을 작성해주세요"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* 다음 단계 버튼 */}
          <button
            type="button"
            onClick={goToStep2}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            다음: 신청서 설정
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: 신청서 설정 */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              활동 등록 시 아래 필드로 <strong>신청서가 자동 제작</strong>됩니다.
              필드를 추가/수정/삭제하여 맞춤 신청서를 만드세요.
            </p>
          </div>

          {/* 신청서 필드 편집 */}
          <FormFieldEditor fields={formFields} onChange={setFormFields} />

          {/* 미리보기 토글 */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? '미리보기 닫기' : '신청서 미리보기'}
          </button>

          {showPreview && (
            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 bg-white">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  止觀書架지관서가 {form.title || '활동 제목'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">신청서 미리보기</p>
              </div>
              <ApplicationForm
                fields={formFields}
                onSubmit={async () => {
                  alert('미리보기입니다. 실제 제출되지 않습니다.');
                }}
                disabled={true}
              />
            </div>
          )}

          {/* 이전/등록 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              이전
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '활동 등록 완료'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
