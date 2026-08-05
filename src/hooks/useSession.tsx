import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

export type SessionUser = {
    profilesId: number;
    username: string;
    name: string;
    role: 'child' | 'parent' | 'household';
    isAdmin: boolean;
};

type SessionState = {
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
};

type SignInResult =
    | { success: true; user: SessionUser }
    | { success: false; error: string };

type SessionContextValue = SessionState & {
    refresh: () => Promise<void>;
    signIn: (username: string, password: string) => Promise<SignInResult>;
    signOut: () => Promise<void>;
};

// One context, one owner. Every useSession() call reads from here so
// login/logout mutations are visible to every consumer instantly.
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
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
        async (username: string, password: string): Promise<SignInResult> => {
            const res = await fetch('/api/bruh/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const json = await res.json();
            if (!json.success) {
                return { success: false, error: json.error ?? 'Login failed' };
            }
            await refresh();
            return { success: true, user: json.user as SessionUser };
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

    const value = useMemo<SessionContextValue>(
        () => ({ ...state, refresh, signIn, signOut }),
        [state, refresh, signIn, signOut],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return ctx;
}
