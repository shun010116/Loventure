'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import user_image from '../../public/user.png';
import "../styles/globals.css";

type UserInfo = {
  _id: string;
  email: string;
  nickname: string;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('api/user/logout', { method: 'POST' });
    location.reload();
  };

  return (
    <>
      <header className="flex justify-between items-center border-b pb-2 mb-4 px-4">
        <h1 className="text-2xl font-bold">
          <Link href="/">Loventure</Link>
        </h1>

        <div className="flex items-center gap-4 relative">
          <button className="text-xl relative">
            🔔
            <span className="absolute -top-1 -right-2 text-xs text-red-500 font-bold">0</span>
          </button>

          {user ? (
            <>
              <span className="text-base font-semibold">{user.nickname}님</span>
              <button onClick={handleLogout} className="text-sm text-gray-500">Logout</button>
            </>
          ) : (
            <Link href="/login" className="text-base">
              Login
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