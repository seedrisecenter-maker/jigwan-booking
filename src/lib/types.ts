export type UserRole = 'user' | 'creator' | 'admin';
export type ActivityType = 'lecture' | 'reading_group' | 'humanities';
export type ActivityStatus = 'active' | 'cancelled' | 'completed';
export type ReservationStatus = 'confirmed' | 'cancelled';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  city: string;
  address: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: ActivityType;
  location_id: number;
  creator_id: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: ActivityStatus;
  created_at: string;
  // joined fields
  location?: Location;
  creator?: Profile;
  reservation_count?: number;
}

export interface Reservation {
  id: string;
  activity_id: string;
  user_id: string;
  status: ReservationStatus;
  created_at: string;
  // joined fields
  activity?: Activity;
  user?: Profile;
}

export const LOCATIONS: Location[] = [
  { id: 1, name: '울산대공원', city: '울산', address: '울산시 남구 대공원로 94' },
  { id: 2, name: '장생포', city: '울산', address: '울산시 남구 장생포고래로 110' },
  { id: 3, name: '선암호수공원', city: '울산', address: '울산시 남구 선암호수길 150' },
  { id: 4, name: 'UNIST', city: '울산', address: '울산시 울주군 UNIST길 50' },
  { id: 5, name: '울산시립미술관', city: '울산', address: '울산시 남구 두왕로 235' },
  { id: 6, name: '괴테마을', city: '울산', address: '울산시 북구 괴테마을길' },
  { id: 7, name: '박상진호수공원', city: '울산', address: '울산시 울주군 상북면' },
  { id: 8, name: '부산', city: '부산', address: '부산시' },
  { id: 9, name: '울진 금강송숲', city: '울진', address: '경북 울진군 금강송면' },
  { id: 10, name: '경주', city: '경주', address: '경주시' },
  { id: 11, name: '평택 달보드레센터', city: '평택', address: '경기도 평택시' },
];

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
