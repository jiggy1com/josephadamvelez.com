import { useCallback, useEffect, useState } from 'react';

export type SessionUser = {
    profilesId: number;
    username: string;
    name: string;
    role: 'child' | 'parent';
    isAdmin: boolean;
};

type SessionState = {
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
};

// Client helper for the session. Reads from /api/bruh/auth/session — the JWT
// itself is HttpOnly and never touched by client JS. To add "write" behaviors
// later (e.g., updating preferences on the JWT), extend this hook with
// additional actions that POST to dedicated endpoints.
export function useSession() {
    const [state, setState] = useState<SessionState>({
        user: null,
        loading: true,
        error: null,
    });

    const refresh = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const res = await fetch('/api/bruh/auth/session', { cache: 'no-store' });
            const json = await res.json();
            setState({ user: json.user ?? null, loading: false, error: null });
        } catch (e) {
            setState({
                user: null,
                loading: false,
                error: e instanceof Error ? e.message : String(e),
            });
        }
    }, []);

    const signIn = useCallback(
        async (username: string, password: string) => {
            const res = await fetch('/api/bruh/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const json = await res.json();
            if (!json.success) {
                return { success: false as const, error: json.error ?? 'Login failed' };
            }
            await refresh();
            return { success: true as const, user: json.user as SessionUser };
        },
        [refresh],
    );

    const signOut = useCallback(async () => {
        await fetch('/api/bruh/auth/logout', { method: 'POST' });
        await refresh();
    }, [refresh]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { ...state, refresh, signIn, signOut };
}
