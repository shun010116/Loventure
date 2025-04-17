'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';
// import user_image from '../../public/user.png';
import "../styles/globals.css";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, user, loading, logout } = useAuth();

  const { data: notificationData } = useSWR(
    isLoggedIn ? "/api/notifications" : null,
    fetcher
  );

  const unreadCount = notificationData?.data?.unreadCount || 0;

  return (
    <>
      <header className="flex justify-between items-center border-b pb-2 mb-4 px-4">
        <h1 className="text-2xl font-bold">
          <Link href="/">Loventure</Link>
        </h1>

        <div className="flex items-center gap-4 relative">
        {!loading && isLoggedIn && user && (
          <span className="text-sm font-semibold">
            👋 {user.nickname}님
          </span>
        )}
          {!loading && (
            isLoggedIn ? (
              <>
                <button onClick={logout} className="text-base">Logout</button>
              </>
            ) : (
              <Link href="/login" className="text-base">Login</Link>
            )
          )}

          {isLoggedIn && (
            <Link href="/notifications" className="text-xl relative">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 text-xs text-white bg-red-500 rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          <button
            className="text-3xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <nav className="absolute right-4 top-16 bg-white shadow-lg rounded-lg px-6 py-4 flex flex-col items-end gap-2 z-20">
          <Link href="/calendar">달력</Link>
          <Link href="/diary">교환일기</Link>
          <Link href="/inventory">인벤토리</Link>
          <Link href="/shop">상점</Link>
          <Link href="/myPage">마이페이지</Link>
        </nav>
      )}

      <main className="px-4 z-0 relative">{children}</main>
    </>
  );
}