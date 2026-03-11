'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Location, LOCATIONS } from '@/lib/types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>(LOCATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: true });
    if (data && data.length > 0) {
      setLocations(data);
    }
    setLoading(false);
  };

  return { locations, loading, refetch: fetchLocations };
}
