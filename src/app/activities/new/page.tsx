'use client';

import { useAuth } from '@/hooks/useAuth';
import ActivityForm from '@/components/ActivityForm';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function NewActivityPage() {
  const { user, isCreator, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500 mb-4">활동을 등록하려면 먼저 로그인해주세요</p>
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          로그인하기
        </Link>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">권한이 필요합니다</h2>
        <p className="text-gray-500 mb-4">
          활동 등록은 권한을 부여받은 시민만 가능합니다.<br />
          관리자에게 권한을 요청해주세요.
        </p>
        <Link href="/" className="text-indigo-600 font-medium hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/activities" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        활동 목록으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">새 활동 등록</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ActivityForm />
      </div>
    </div>
  );
}
