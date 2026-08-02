import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@/hooks/useSession';

export default function BruhAdminLogout() {
    const router = useRouter();
    const { signOut } = useSession();

    useEffect(() => {
        void (async () => {
            await signOut();
            void router.replace('/bruh/admin');
        })();
    }, [signOut, router]);

    return null;
}
