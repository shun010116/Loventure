'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ClientLayout from "@/app/ClientLayout";

export default function MyPage() {
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();
  const [sharedCode, setSharedCode] = useState('');

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  const handleJoinCouple = async () => {
    const res = await fetch('/api/couple/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sharedCode }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Successfully joined the Couple!');
      setSharedCode('');
    } else {
      alert(data.message);
    }
  };

  if (loading || !isLoggedIn || !user) return null;

  return (
      <div className='flex flex-col items-center p-8'>
      <p className='mb-4 text-center text-sm text-blue-700'>
        나의 커플 초대 코드: <strong>{user.sharedCode}</strong>
      </p>

      <div className='flex items-center gap-2'> 
        <input
          type="text"
          className="text-register"
          placeholder='커플 공유코드를 입력해주세요'
          value={sharedCode}
          onChange={(e) => setSharedCode(e.target.value)}
        />

        <button
          className="btn-register"
          //disabled={loading}
          onClick={handleJoinCouple}
        > 
          제출하기
        </button>
      </div>

    </div>
  );
}
  