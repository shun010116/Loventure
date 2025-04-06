'use client';

import { useState, useEffect } from 'react';

export default function coupleLinkPage() {
  const [sharedCode, setSharedCode] = useState('');
  const [myCode, setMyCode]= useState('');

  useEffect(() => {
    const fetchUserCode = async () => {
      try {
        const resUser = await fetch('/api/user/me');
        const user = await resUser.json();
        //console.log("user", user);

        if (resUser.ok && user.data?.sharedCode) {
          setMyCode(user.data?.sharedCode);
          //console.log("coupleData", coupleData);
        }
      } catch (err) {
        console.error('Error fetching user code:', err);
      }
    };

    fetchUserCode();
  }, []);

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

  return (
    <div className='flex flex-col items-center p-8'>
      {myCode && (
        <p className='mb-4 text-center text-sm text-blue-700'>
          나의 커플 초대 코드: <strong>{myCode}</strong>
        </p>
      )}

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
          {/*loading ? '코드 확인중...' : '제출하기'*/}
        </button>
      </div>

    </div>
  );
  
}
  