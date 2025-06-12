'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ClientLayout from "@/app/ClientLayout";

export default function MyPage() {
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();
  const [sharedCode, setSharedCode] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [load, setLoad] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoad(true);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLoad(false);

    if (res.ok) {
      setImageUrl(data.url);

      const fileName = data.url.split('/uploads/')[1];
      await fetch('/api/character/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: fileName }),

      })
    } else {
      alert(data.message || 'failed to upload image');
    }
  };

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
    <>
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

      <div className='p-4 text-center rounded-lg'>
        <p className='mb-4 text-center text-sm'>캐릭터 변경</p>
        <input type="file" onChange={(e) =>  setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} disabled={!file || load} className='mt-2 bg-blue-500 text-white px-4 py-2 rounded'>
          {load ? 'Uploading...' : 'Upload Image'}
        </button>

      </div>
    </>
  );
}
  