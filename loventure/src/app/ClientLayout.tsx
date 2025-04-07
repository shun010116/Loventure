'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import user_image from '../../public/user.png';
import "../styles/globals.css";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, user, loading, logout } = useAuth();

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
                <Link href="/myPage" className="text-base">My Page</Link>
                <button onClick={logout} className="text-base">Logout</button>
              </>
            ) : (
              <Link href="/login" className="text-base">Login</Link>
            )
          )}

          <button className="text-xl relative">
            🔔
            <span className="absolute -top-1 -right-2 text-xs text-red-500 font-bold">0</span>
          </button>

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