'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function coupleLinkPage() {
  return (
    <div className='flex flex-col items-center p-8'>

      <button type="submit"className="btn-register mb-32">
        couple code 받기
      </button>

      <div className='flex items-center gap-2'> 
        <input
          type="sharedCode"
          className="text-register"
          name="sharedCode"
          placeholder='커플 공유코드를 입력해주세요'
        />

        <button
          type="submit"
          className="btn-register"
          //disabled={loading}
        > 
          제출하기
          {/*loading ? '코드 확인중...' : '제출하기'*/}
        </button>
      </div>

      

    </div>
  );
  
}
  