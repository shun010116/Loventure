// components/Layouts/MobileTopBar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Bell, UserCircle, Settings, LogOut } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MobileTopBar() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const { data: notificationData } = useSWR(isLoggedIn ? "/api/notifications" : null, fetcher);
  const unreadCount = notificationData?.data?.unreadCount || 0;

  return (
    <header className="sm:hidden bg-white px-4 py-3 shadow flex justify-end items-center gap-4">
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
          <Link href="/auth/login" className="text-gray-700">
            <Settings size={22} />
          </Link>
          <button onClick={logout} className="text-red-500">
            <LogOut size={22} />
          </button>

        </>
      )}
    </header>
  );
}