'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Calendar, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut, isCreator, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>止觀書架 예약</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
              <Calendar className="w-4 h-4" />
              캘린더
            </Link>
            <Link href="/activities" className="text-gray-600 hover:text-indigo-600 transition-colors">
              활동 목록
            </Link>

            {user ? (
              <>
                {isCreator && (
                  <Link href="/activities/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    활동 만들기
                  </Link>
                )}
                <Link href="/mypage" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
                  <User className="w-4 h-4" />
                  {profile?.name || '마이페이지'}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
                    <Shield className="w-4 h-4" />
                    관리
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  로그인
                </Link>
                <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
            <Link href="/" className="text-gray-600 hover:text-indigo-600 py-1" onClick={() => setMenuOpen(false)}>
              캘린더
            </Link>
            <Link href="/activities" className="text-gray-600 hover:text-indigo-600 py-1" onClick={() => setMenuOpen(false)}>
              활동 목록
            </Link>
            {user ? (
              <>
                {isCreator && (
                  <Link href="/activities/new" className="text-indigo-600 font-medium py-1" onClick={() => setMenuOpen(false)}>
                    활동 만들기
                  </Link>
                )}
                <Link href="/mypage" className="text-gray-600 hover:text-indigo-600 py-1" onClick={() => setMenuOpen(false)}>
                  마이페이지
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-indigo-600 py-1" onClick={() => setMenuOpen(false)}>
                    관리자
                  </Link>
                )}
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left text-red-500 py-1">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 py-1" onClick={() => setMenuOpen(false)}>
                  로그인
                </Link>
                <Link href="/signup" className="text-indigo-600 font-medium py-1" onClick={() => setMenuOpen(false)}>
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
