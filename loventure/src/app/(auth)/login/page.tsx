'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const res = await fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage(`환영합니다!, ${data.user.nickname}님! 🎉`);
            // Redirect to home page or dashboard
            //window.location.href = '/';
            setTimeout(() => {
                window.location.href  = '/';
            }, 500);
        } else {
            const fallbackMessage =
                res.status === 401
                ? '이메일 또는 비밀번호가 일치하지 않습니다.'
                : '로그인 중 오류가 발생했습니다.';
            setMessage(data?.message || fallbackMessage);
        }

        setLoading(false);
    };

  return (
     <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* 상단 로고 */}
        <div className="text-3xl font-bold text-center mb-8">
          <Link href="/" className="hover:text-blue-500 transition">Loventure</Link>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 메시지 출력 */}
        {message && (
          <p className="text-center mt-4 text-sm text-red-600 whitespace-pre-line">{message}</p>
        )}

        {/* 회원가입 링크 */}
        <div className="text-center mt-6">
          <Link href="/register" className="text-sm text-blue-600 hover:underline">
            아직 계정이 없으신가요? 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
