'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        setMessage('');

        const res = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form.email,
                password: form.password,
                nickname: form.nickname,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage('회원가입이 완료되었습니다.');
            setTimeout(() => router.push('/login'), 1500) // 1.5s 후 로그인 페이지 이동
        } else {
            setMessage(data.message || '회원가입에 실패했습니다.');
        }

        setLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
				<div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
					{/* 상단 Loventure 로고 */}
					<div className="text-3xl font-bold text-center mb-8">
						<Link href="/" className="hover:text-blue-500 transition">
							Loventure
						</Link>
					</div>

					{/* 회원가입 폼 */}
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label htmlFor="nickname" className="block mb-1 font-medium">
								이름
							</label>
							<input
								type="text"
								id="nickname"
								name="nickname"
								value={form.nickname}
								onChange={handleChange}
								required
								className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
						</div>

						<div>
							<label htmlFor="email" className="block mb-1 font-medium">
								이메일
							</label>
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
							<label htmlFor="password" className="block mb-1 font-medium">
								비밀번호
							</label>
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

						<div>
							<label htmlFor="confirmPassword" className="block mb-1 font-medium">
								비밀번호 확인
							</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								value={form.confirmPassword}
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
							{loading ? '가입 중...' : '가입하기'}
						</button>
					</form>

					{/* 메시지 출력 */}
					{message && (
						<p className="text-center mt-4 text-sm text-red-600 whitespace-pre-line">
							{message}
						</p>
					)}

					{/* 로그인 링크 */}
					<div className="text-center mt-6">
						<Link href="/login" className="text-sm text-blue-600 hover:underline">
							이미 계정이 있으신가요? 로그인
						</Link>
					</div>
				</div>
    	</div>
    );
  }
  