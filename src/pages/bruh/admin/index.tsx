import { BruhAdminDashboard } from '@/components/bruh/admin/BruhAdminDashboard';
import { BruhLogin } from '@/components/bruh/BruhLogin';
import { useSession } from '@/hooks/useSession';

export default function BruhAdminIndex() {
    const { user, loading, refresh } = useSession();

    if (loading) {
        return null;
    }

    // Any authenticated user reaches this page (middleware only requires isAdmin
    // for the /bruh/admin/* subroutes, not the root). Non-admin viewers get
    // shown the sign-in form so they can retry with an admin credential.
    if (!user || !user.isAdmin) {
        return <BruhLogin onSignedIn={() => void refresh()} defaultNext={'/bruh/admin'} />;
    }

    return <BruhAdminDashboard />;
}
