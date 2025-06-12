// components/Layouts/MobileTopBar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Bell, UserCircle, Settings, LogOut, LogIn } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MobileTopBar() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const { data: notificationData } = useSWR(isLoggedIn ? "/api/notifications" : null, fetcher);
  const unreadCount = notificationData?.data?.unreadCount || 0;

  return (
    <header className="md:hidden bg-white px-4 py-3 shadow flex justify-end items-center gap-4">
      {/* 로그인 한 상태 */}
      {!loading && isLoggedIn && (
        <>
          <Link href="/notifications" className="relative text-gray-700">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/myPage" className="text-gray-700">
            <UserCircle size={22} />
          </Link>
          <Link href="/settings" className="text-gray-700">
            <Settings size={22} />
          </Link>
          <button onClick={logout} className="text-red-500">
            <LogOut size={22} />
          </button>
        </>
      )}

      {/* 로그인 안 한 상태 */}
      {!loading && !isLoggedIn && (
        <Link
        href="/login" 
          className="flex items-center text-blue-600 hover:underline"
        >
          <LogIn size={22} />
          <span className="ml-1 text-sm">로그인</span>
        </Link>
      )}
    </header>
  );
}