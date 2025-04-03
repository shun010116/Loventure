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
            router.push('/');
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
    <div>

        <form onSubmit={handleSubmit} className="register">
            
            <table className="table-register">
            <tbody>
                <tr>
                    <th><h2>로그인</h2></th>
                </tr>
                <tr><td>
                    <div>&nbsp;&nbsp;이메일</div>
                    <input
                        type="email"
                        className="text-register"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </td></tr>

                <tr><td>
                    <div>&nbsp;&nbsp;비밀번호</div>
                    <input
                        type="password"
                        className="text-register"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </td></tr>

                <tr><th>
                    <button
                        type="submit"
                        className="btn-register"
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </th></tr>
            </tbody>
            </table>
            <Link href="/register">register</Link>
            
        </form>    
        {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
