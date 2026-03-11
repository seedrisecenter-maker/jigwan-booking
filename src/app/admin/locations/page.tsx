'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocations';
import { ArrowLeft, Shield, Plus, Trash2, MapPin } from 'lucide-react';

export default function AdminLocationsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { locations, refetch } = useLocations();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    const { error } = await supabase.from('locations').insert({
      name: newName.trim(),
      city: '',
      address: newAddress.trim(),
    });

    if (!error) {
      setNewName('');
      setNewAddress('');
      setShowForm(false);
      refetch();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 지관서가를 삭제하시겠습니까?\n이 장소에 등록된 활동이 있으면 삭제할 수 없습니다.`)) return;

    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) {
      alert('삭제할 수 없습니다. 이 장소에 등록된 활동이 있을 수 있습니다.');
    } else {
      refetch();
    }
  };

  if (authLoading) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/admin" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        관리자 대시보드로 돌아가기
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">지관서가 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          새 지관서가 추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-indigo-50 rounded-xl border border-indigo-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">새 지관서가 추가</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="예: 서울 북촌"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소 (선택)</label>
              <input
                type="text"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="예: 서울시 종로구 북촌로 123"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? '추가 중...' : '추가'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setNewName(''); setNewAddress(''); }}
                className="text-gray-500 hover:text-gray-700 px-5 py-2 rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {locations.map(location => (
            <div key={location.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium text-gray-900">{location.name}</p>
                  {location.address && (
                    <p className="text-sm text-gray-500">{location.address}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(location.id, location.name)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            등록된 지관서가가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
