import { BruhAdminDashboard } from '@/components/bruh/admin/BruhAdminDashboard';
import { BruhAdminLogin } from '@/components/bruh/admin/BruhAdminLogin';
import { useSession } from '@/hooks/useSession';

export default function BruhAdminIndex() {
    const { user, loading, refresh } = useSession();

    if (loading) {
        return null;
    }

    if (!user) {
        return <BruhAdminLogin onSignedIn={() => void refresh()} />;
    }

    return <BruhAdminDashboard />;
}
