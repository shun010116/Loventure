'use client'

import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationPage() {
    const { data, mutate } = useSWR("/api/notifications", fetcher);
    const router = useRouter();

    const handleRead = async (id: string, href: string) => {
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
        mutate();   // SWR 캐시 갱신
        router.push(href);  // 페이지 이동
    };

    const notifications = data?.data?.notifications || [];

    return (
      <ClientLayout>
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-xl font-bold mb-4">📬 알림</h2>
          <ul className="space-y-3">
            {notifications.map((n: any) => (
              <li
                key={n._id}
                className={`p-4 rounded shadow cursor-pointer flex justify-between items-center 
                  ${n.isRead ? "bg-gray-100" : "bg-blue-100"}`}
                onClick={() => handleRead(n._id, n.link || "/")}
              >
                <div>
                  <p>{n.content}</p>
                  <p className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="text-xs text-white bg-red-500 rounded-full px-2">NEW</span>}
              </li>
            ))}
            {notifications.length === 0 && <p className="text-gray-500">알림이 없습니다.</p>}
          </ul>
        </div>
      </ClientLayout>
        
      );
}