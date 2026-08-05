import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import type {
    LocationEventFeedRow,
    Profile,
    KnownLocation,
} from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';

function fmtTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

// Group events by local-date bucket so the feed reads as day-separated
// sections rather than a wall of timestamps.
function bucketByDay(rows: LocationEventFeedRow[]): { date: string; rows: LocationEventFeedRow[] }[] {
    const groups = new Map<string, LocationEventFeedRow[]>();
    for (const r of rows) {
        const d = new Date(r.occurredAt);
        const key = Number.isNaN(d.getTime())
            ? 'unknown'
            : d.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
              });
        const list = groups.get(key) ?? [];
        list.push(r);
        groups.set(key, list);
    }
    return Array.from(groups, ([date, rowsForDay]) => ({ date, rows: rowsForDay }));
}

export default function BruhActivity() {
    const [rows, setRows] = useState<LocationEventFeedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    // Filter options — loaded once for the dropdowns.
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [places, setPlaces] = useState<KnownLocation[]>([]);
    const [filterProfileId, setFilterProfileId] = useState<string>('');
    const [filterPlaceId, setFilterPlaceId] = useState<string>('');

    const groups = useMemo(() => bucketByDay(rows), [rows]);

    // Fetch dropdown options once. Both endpoints are session-gated; anyone
    // signed in can read them.
    useEffect(() => {
        void (async () => {
            try {
                const [pr, kl] = await Promise.all([
                    fetch('/api/bruh/admin/profiles/list').then((r) => r.json()),
                    fetch('/api/bruh/admin/known-locations/list').then((r) => r.json()),
                ]);
                if (pr.success) setProfiles(pr.data);
                if (kl.success) setPlaces(kl.data);
            } catch {
                // Non-fatal — filter dropdowns just won't have options.
            }
        })();
    }, []);

    // Fetch feed when filters change.
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterProfileId) params.set('profilesId', filterProfileId);
        if (filterPlaceId) params.set('knownLocationsId', filterPlaceId);
        void (async () => {
            try {
                const r = await fetch(`/api/bruh/activity?${params.toString()}`, {
                    cache: 'no-store',
                });
                const json = await r.json();
                if (json.success) {
                    setRows(json.data);
                    setAlert({ success: false, message: '' });
                } else {
                    setAlert({ success: false, message: json.error ?? 'Failed to load' });
                }
            } catch (e) {
                setAlert({
                    success: false,
                    message: e instanceof Error ? e.message : String(e),
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [filterProfileId, filterPlaceId]);

    return (
        <>
            <Section id={'bruh-activity-header'} className={'admin-section'}>
                <h1>Activity</h1>
            </Section>
            <Section id={'bruh-activity-filters'} className={'admin-section'} removeArticle={true}>
                <div className={'activity-filters'}>
                    <label>
                        <span style={{ marginRight: 6 }}>Profile</span>
                        <select
                            value={filterProfileId}
                            onChange={(e) => setFilterProfileId(e.target.value)}>
                            <option value={''}>All</option>
                            {profiles.map((p) => (
                                <option key={p.profilesId} value={p.profilesId}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span style={{ marginRight: 6 }}>Place</span>
                        <select
                            value={filterPlaceId}
                            onChange={(e) => setFilterPlaceId(e.target.value)}>
                            <option value={''}>All</option>
                            {places.map((p) => (
                                <option key={p.knownLocationsId} value={p.knownLocationsId}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </Section>
            <Section id={'bruh-activity-feed'} className={'admin-section'} removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
                {!loading && rows.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No arrival/departure events yet. Once devices ping in and out of known
                        places, this feed will fill up.
                    </p>
                )}
                {!loading && rows.length > 0 && (
                    <div className={'activity-feed'}>
                        {groups.map((group) => (
                            <div key={group.date} className={'activity-day'}>
                                <h2 className={'activity-day-heading'}>{group.date}</h2>
                                <ul className={'activity-list'}>
                                    {group.rows.map((r) => {
                                        const color = resolveProfileColor(r.profileColor);
                                        const arrow = r.eventType === 'arrival' ? '→' : '←';
                                        return (
                                            <li key={r.eventId} className={'activity-item'}>
                                                <span
                                                    className={'profile-dot'}
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className={'activity-text'}>
                                                    <strong style={{ color }}>
                                                        {r.profileName ?? r.deviceName ?? 'Unknown'}
                                                    </strong>{' '}
                                                    <span className={'activity-arrow'}>{arrow}</span>{' '}
                                                    {r.eventType === 'arrival'
                                                        ? 'arrived at'
                                                        : 'left'}{' '}
                                                    <strong>{r.placeName}</strong>
                                                </span>
                                                <span className={'activity-time'}>
                                                    {fmtTime(r.occurredAt)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </>
    );
}
