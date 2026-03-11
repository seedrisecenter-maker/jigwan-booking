'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Profile, UserRole } from '@/lib/types';
import { ArrowLeft, Shield, Search, ChevronDown } from 'lucide-react';

export default function AdminUsersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchUsers();
  }, [authLoading, isAdmin, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

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

  const filteredUsers = search
    ? users.filter(u => u.name.includes(search) || u.phone.includes(search))
    : users;

  const roleLabel: Record<UserRole, string> = {
    user: '일반 회원',
    creator: '활동 등록자',
    admin: '관리자',
  };

  const roleColor: Record<UserRole, string> = {
    user: 'bg-gray-100 text-gray-600',
    creator: 'bg-indigo-100 text-indigo-700',
    admin: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/admin" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        관리자 대시보드로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">사용자 권한 관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이름 또는 전화번호로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor[user.role]}`}>
                  {roleLabel[user.role]}
                </span>
                <div className="relative">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
                  >
                    <option value="user">일반 회원</option>
                    <option value="creator">활동 등록자</option>
                    <option value="admin">관리자</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
