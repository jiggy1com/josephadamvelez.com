import { useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import type { KnownLocation, BackfillResult } from '@/utils/adminQueries';

type Props = {
    place: KnownLocation;
};

// Manual "Backfill events" control shown on the edit page. Available because
// updates don't auto re-derive activity: silent updates preserve history for
// the case where a place is being repurposed (e.g. Grandma moved houses).
// This button is the escape hatch for the other case — the geometry (radius,
// pin location) was corrected and the past feed should be replayed against
// the fixed shape.
export function BruhAdminPlaceBackfill({ place }: Props) {
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);

    const run = async () => {
        setConfirming(false);
        setBusy(true);
        try {
            const res = await fetch('/api/bruh/admin/known-locations/backfill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ knownLocationsId: place.knownLocationsId }),
            });
            const json = await res.json();
            if (json.success) {
                const b = json.backfill as BackfillResult;
                setAlert({
                    success: true,
                    message: `Rebuilt events for "${place.name}": ${b.arrivals} arrivals, ${b.departures} departures across ${b.devicesScanned} devices (${b.pingsScanned} pings scanned).`,
                });
            } else {
                setAlert({ success: false, message: json.error ?? 'Failed to backfill' });
            }
        } catch (e) {
            setAlert({
                success: false,
                message: e instanceof Error ? e.message : String(e),
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Section id={'bruh-admin-place-backfill'} className={'admin-section'}>
                <h2>Backfill events</h2>
                <p style={{ opacity: 0.85, fontSize: '0.95em' }}>
                    Replays every historical device ping against this place&apos;s current
                    pin and radius, then rewrites the activity feed for &quot;{place.name}
                    &quot;.
                </p>
                <p style={{ opacity: 0.75, fontSize: '0.9em' }}>
                    Use this after correcting the radius or nudging the pin — the past
                    feed will pick up visits that were missed. <strong>Don&apos;t</strong>{' '}
                    use it if you moved the pin to a genuinely different place (e.g.
                    Grandma moved houses): all prior arrivals/departures for the old
                    location will be discarded and re-derived from the new one.
                </p>
                <Alert success={alert.success} message={alert.message} />
                <div style={{ marginTop: 15 }}>
                    <button
                        type={'button'}
                        className={'button button-danger'}
                        disabled={busy}
                        onClick={() => setConfirming(true)}>
                        {busy ? 'Rebuilding…' : 'Rebuild events for this place'}
                    </button>
                </div>
            </Section>

            {confirming && (
                <ConfirmModal
                    onConfirm={() => void run()}
                    onCancel={() => setConfirming(false)}
                    confirmLabel={'Rebuild'}>
                    <p>
                        Delete all existing arrival/departure events for &quot;{place.name}
                        &quot; and re-derive from historical pings?
                    </p>
                    <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
                        This can&apos;t be undone. Only do this if the pin/radius was
                        corrected for the same physical place.
                    </p>
                </ConfirmModal>
            )}
        </>
    );
}
