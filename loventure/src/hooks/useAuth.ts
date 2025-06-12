// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [partner, setPartner] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            if (res.ok && data.data) {
                setUser(data.data.user);
                setPartner(data.data.partner);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setPartner(null);
                setIsLoggedIn(false);
            }
        } catch {
            setUser(null);
            setPartner(null);
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
        setPartner(null);
        setIsLoggedIn(false);
        setLoading(false);
        window.dispatchEvent(new Event("loventure:logout"));
        router.push('/');
    }

    return {
        user,
        partner,
        isLoggedIn: !!user,
        loading,
        logout,
    };
}