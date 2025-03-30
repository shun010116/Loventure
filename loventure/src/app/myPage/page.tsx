'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [message, setMessage] = useState('');

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

        const res = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form.email,
                password: form.password,
                nickname: form.username,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setMessage('회원가입이 완료되었습니다.');
        } else {
            setMessage(data.message || '회원가입에 실패했습니다.');
        }
    };

    return (
      <div className='register'>
  
          <form onSubmit={handleSubmit} className="form-register">
              
            <table className="table-register">
              <tbody>
                <tr>
                    <th><h2>회원가입</h2></th>
                </tr>

                <tr><td>
                    <div>&nbsp;&nbsp;이름</div>
                    <input 
                        type="text"
                        className="text-register"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                    />
                </td></tr>

                <tr><td>
                    <div>&nbsp;&nbsp;이메일</div>
                    <input
                        type="text"
                        className="text-register"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
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
                    />
                </td></tr>

                <tr><td>
                    <div>&nbsp;&nbsp;비밀번호 확인</div>
                    <input
                        type="password"
                        className="text-register"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </td></tr>
    
                <tr><td>
                    <button type="submit" className="btn-register">가입하기</button>
                </td></tr>

              </tbody>
            </table>
          </form>

          {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    );
  }
  