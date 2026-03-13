export type ActivityType = 'lecture' | 'reading_group' | 'humanities';
export type ActivityStatus = 'active' | 'cancelled' | 'completed';
export type ReservationStatus = 'confirmed' | 'cancelled';
export type FormFieldType = 'text' | 'tel' | 'email' | 'radio' | 'checkbox' | 'textarea';

export interface Location {
  id: number;
  name: string;
  city: string;
  address: string;
}

export interface CurriculumItem {
  week: string;
  title: string;
  desc: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  builtin?: boolean;
  options?: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  location_id: number;
  creator_id?: string | null;
  creator_name: string;
  creator_phone: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: ActivityStatus;
  created_at: string;
  // 확장 필드
  speaker_name?: string;
  speaker_bio?: string;
  curriculum?: CurriculumItem[];
  fee?: string;
  schedule_text?: string;
  notice?: string;
  form_fields?: FormField[];
  // joined fields
  location?: Location;
  reservation_count?: number;
}

export interface Reservation {
  id: string;
  activity_id: string;
  user_id?: string | null;
  participant_name: string;
  participant_phone: string;
  participant_email?: string;
  participant_region?: string;
  custom_answers?: Record<string, string | string[]>;
  status: ReservationStatus;
  created_at: string;
  // joined fields
  activity?: Activity;
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  lecture: '강연',
  reading_group: '독서모임',
  humanities: '인문활동',
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  lecture: '#4F46E5',
  reading_group: '#059669',
  humanities: '#D97706',
};

export const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'name', type: 'text', label: '이름', required: true, builtin: true },
  { id: 'phone', type: 'tel', label: '전화번호', required: true, builtin: true },
  { id: 'email', type: 'email', label: '이메일', required: true, builtin: true },
  {
    id: 'region',
    type: 'radio',
    label: '거주지역',
    required: true,
    builtin: true,
    options: ['울산', '울진', '평택', '수원', '여주', '안동', '서울', '기타'],
  },
  {
    id: 'attendance',
    type: 'radio',
    label: '강연 참석을 확인합니다',
    required: true,
    options: ['네, 참석하겠습니다'],
  },
  { id: 'question', type: 'textarea', label: '문의사항', required: false },
  {
    id: 'agreement',
    type: 'checkbox',
    label: '참여 당부사항을 읽었으며 동의합니다',
    required: true,
  },
];
