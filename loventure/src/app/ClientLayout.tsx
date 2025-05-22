'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';
// import user_image from '../../public/user.png';
import "../styles/globals.css";
import useSWR from "swr";
import { UserCircle, BookHeart , CalendarDays, Settings, LogOut, LogIn, Bell } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientLayout({ children }: { children: React.ReactNode;}) {
  const { isLoggedIn, user, loading, logout } = useAuth();

  const { data: notificationData } = useSWR(
    isLoggedIn ? "/api/notifications" : null,
    fetcher
  );

  const unreadCount = notificationData?.data?.unreadCount || 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex gap-4 h-full">

        {/* 왼쪽 메뉴바 */}
        <aside className="w-52 bg-white shadow-md rounded-2xl px-4 py-6 flex flex-col gap-6">
          <Link href="/"><div className="text-lg font-bold">Loventure</div></Link>

          <nav className="flex flex-col gap-4 text-sm text-gray-700">

            <div className="flex items-center gap-4 cursor-pointer hover:text-blue-500">
              <Link href="/myPage" className="flex"><UserCircle size={20}  className="mr-2" /> 프로필</Link>
            </div>
            <div className="flex items-center gap-4 cursor-pointer hover:text-blue-500">
              <Link href="/diary" className="flex"> <BookHeart  size={20} className="mr-2"/> 교환일기 </Link>
            </div>
            <div className="flex items-center gap-4 cursor-pointer hover:text-blue-500">
              <Link href="/calendar" className="flex"><CalendarDays size={20}  className="mr-2" /> 공유 달력</Link>
            </div>
            <div className="flex items-center gap-4 cursor-pointer hover:text-blue-500">
              <Link href="/auth/login" className="flex"><Settings size={20}  className="mr-2" /> 설정</Link>
            </div>
            <div className="flex items-center gap-4 cursor-pointer hover:text-red-500 mt-auto">
              {!loading && (
                isLoggedIn ? (
                  <>
                    <button onClick={logout} className="flex items-center text-base"><LogOut size={20} className="mr-2" /> 로그아웃</button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center text-base"><LogIn size={20} className="mr-2" /> 로그인</Link>
                )
              )}
            </div>
          </nav>
        </aside>

        {/* 오른쪽 영역 : 상단 메뉴바 + 본문 */}
        <div className="flex flex-col flex-1 gap-0">
          {/* 상단 메뉴바 */}
          <header className="bg-gray-100 shadow-mb rounded-2xl px-6 py-6 flex justify-end items-center">
            <div className="flex items-center gap-4 relative">
              {!loading && isLoggedIn && user && (
                <span className="text-sm font-semibold">
                  👋 {user.nickname}님
                </span>
              )}

              {isLoggedIn && (
                <Link href="/notifications" className="text-xl relative">
                  <Bell size={25} />
                  
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-xs text-white bg-red-500 rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </header>
            
          {/* 본문 내용 */}
          <main className="flex-1 px-4 z-0 relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}