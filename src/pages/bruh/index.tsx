import { useEffect, useState } from 'react';
import { BruhCalendar } from '@/components/bruh/BruhCalendar';
import { BruhLogin } from '@/components/bruh/BruhLogin';
import { BruhOnboarding } from '@/components/bruh/BruhOnboarding';
import { useSession } from '@/hooks/useSession';

// The /bruh landing has four possible views:
//   1. loading    → session state hasn't resolved yet
//   2. onboarding → no household profile exists anywhere; first-time setup
//   3. login      → household exists, but the visitor isn't signed in
//   4. signed-in  → show the kids-facing dashboard (currently just the calendar)
export default function Bruh() {
    const { user, loading, refresh } = useSession();
    const [householdExists, setHouseholdExists] = useState<boolean | null>(null);

    // Ask the server whether onboarding has been completed. Only relevant when
    // the visitor is unauth'd — a signed-in user by definition means a profile
    // already exists, so skip the round trip in that case.
    useEffect(() => {
        if (user) return;
        void (async () => {
            try {
                const r = await fetch('/api/bruh/auth/onboarding-status', { cache: 'no-store' });
                const json = await r.json();
                setHouseholdExists(!!json.householdExists);
            } catch {
                // Fail-safe: assume household exists so we show the login form,
                // not an accidental re-onboarding path when the API is flaky.
                setHouseholdExists(true);
            }
        })();
    }, [user]);

    if (loading) return null;

    if (user) {
        return (
            <div>
                <BruhCalendar />
            </div>
        );
    }

    // Not signed in — wait for the household-status check before choosing which form to show.
    if (householdExists === null) return null;

    if (!householdExists) {
        return <BruhOnboarding onCompleted={() => void refresh()} />;
    }

    return <BruhLogin onSignedIn={() => void refresh()} defaultNext={'/bruh'} />;
}
