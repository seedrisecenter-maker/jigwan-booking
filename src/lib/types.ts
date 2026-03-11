export type ActivityType = 'lecture' | 'reading_group' | 'humanities';
export type ActivityStatus = 'active' | 'cancelled' | 'completed';
export type ReservationStatus = 'confirmed' | 'cancelled';

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
  creator_id?: string | null;
  creator_name: string;
  creator_phone: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: ActivityStatus;
  created_at: string;
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
