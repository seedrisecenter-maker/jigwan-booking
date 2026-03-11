'use client';

import ActivityForm from '@/components/ActivityForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewActivityPage() {
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
