// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (res.ok && data.data.user) {
                setUser(data.data.user);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch {
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        await fetch('/api/user/logout', { method: 'POST' });
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
        window.dispatchEvent(new Event("loventure:logout"));
        router.push('/');
    }

    return {
        user,
        isLoggedIn: !!user,
        loading,
        logout,
    };
}