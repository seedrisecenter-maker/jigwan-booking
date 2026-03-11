'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/lib/types';

export function useActivities(locationId?: number) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('activities')
      .select(`
        *,
        location:locations(*),
        creator:profiles!creator_id(name),
        reservation_count:reservations(count)
      `)
      .eq('status', 'active')
      .order('start_date', { ascending: true });

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;
    if (!error && data) {
      const mapped = data.map((item: Record<string, unknown>) => ({
        ...item,
        reservation_count: Array.isArray(item.reservation_count) && item.reservation_count.length > 0
          ? (item.reservation_count[0] as { count: number }).count
          : 0,
      }));
      setActivities(mapped as Activity[]);
    }
    setLoading(false);
  }, [locationId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}
