'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Users, Calendar, BookOpen, ArrowRight, MapPin } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalActivities: number;
  totalReservations: number;
  creators: number;
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalActivities: 0,
    totalReservations: 0,
    creators: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const [usersRes, activitiesRes, reservationsRes, creatorsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['creator', 'admin']),
    ]);

    setStats({
      totalUsers: usersRes.count ?? 0,
      totalActivities: activitiesRes.count ?? 0,
      totalReservations: reservationsRes.count ?? 0,
      creators: creatorsRes.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchStats();
  }, [authLoading, isAdmin, fetchStats]);

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">로딩 중...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">관리자 권한이 필요합니다</h2>
        <Link href="/" className="text-indigo-600 font-medium hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  const statCards = [
    { label: '전체 회원', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: '활동 등록자', value: stats.creators, icon: Shield, color: 'bg-purple-50 text-purple-600' },
    { label: '진행 중 활동', value: stats.totalActivities, icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
    { label: '총 예약', value: stats.totalReservations, icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-indigo-600" />
        관리자 대시보드
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">관리 메뉴</h2>
        <div className="space-y-3">
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">사용자 권한 관리</p>
                <p className="text-sm text-gray-500">일반 회원에게 활동 등록 권한 부여</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link
            href="/admin/locations"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">지관서가 관리</p>
                <p className="text-sm text-gray-500">지관서가 추가, 삭제 관리</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
