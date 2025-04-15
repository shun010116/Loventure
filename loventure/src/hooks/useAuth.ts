// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/user/me')
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                //console.log("/api/user/me 응답:", data);
                if (data?.data.user) setUser(data.data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const logout = async () => {
        await fetch('/api/user/logout', { method: 'POST' });
        setUser(null);
        router.push('/');
    }

    return {
        user,
        isLoggedIn: !!user,
        loading,
        logout,
    };
}