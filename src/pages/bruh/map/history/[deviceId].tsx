import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { VIEWPORT_HEIGHT_MINUS_NAV } from '@/constants/layout';
import type { DeviceHistoryPayload } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';

// Leaflet touches window, so the map view must be client-only.
const BruhMapHistoryView = dynamic(
    () => import('@/components/bruh/BruhMapHistoryView').then((m) => m.BruhMapHistoryView),
    { ssr: false },
);

// Format today (or any Date) as YYYY-MM-DD in the *user's* local timezone.
// getFullYear/getMonth/getDate are already local. Zero-padded for parseability.
function localIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Advance a YYYY-MM-DD string by N days, staying in the local timezone.
function addDays(iso: string, delta: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    return localIsoDate(dt);
}

// Pretty label for headings. "Today", "Yesterday", or a formatted date.
function dateLabel(iso: string): string {
    const today = localIsoDate(new Date());
    const yesterday = addDays(today, -1);
    if (iso === today) return 'Today';
    if (iso === yesterday) return 'Yesterday';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function BruhMapHistory() {
    const router = useRouter();
    const deviceId = typeof router.query.deviceId === 'string' ? router.query.deviceId : '';
    const queryDate =
        typeof router.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(router.query.date)
            ? router.query.date
            : '';

    // Default to today (local) when the URL doesn't specify a date. Track a
    // separate state so we don't spin on the router before it's ready.
    const [today] = useState(() => localIsoDate(new Date()));
    const date = queryDate || today;

    const [data, setData] = useState<DeviceHistoryPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    // Fetch history whenever deviceId or date changes.
    useEffect(() => {
        if (!deviceId) return;
        setLoading(true);
        void (async () => {
            try {
                const url = `/api/bruh/devices/history?deviceId=${encodeURIComponent(
                    deviceId,
                )}&date=${encodeURIComponent(date)}`;
                const res = await fetch(url, { cache: 'no-store' });
                const json = await res.json();
                if (!json.success) {
                    setAlert({ success: false, message: json.error ?? 'Failed to load' });
                    setData(null);
                } else {
                    setAlert({ success: false, message: '' });
                    setData(json.data as DeviceHistoryPayload);
                }
            } catch (e) {
                setAlert({
                    success: false,
                    message: e instanceof Error ? e.message : String(e),
                });
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [deviceId, date]);

    const setDate = (nextDate: string) => {
        // Use replace so paging dates doesn't flood the browser history.
        void router.replace(
            { pathname: router.pathname, query: { ...router.query, date: nextDate } },
            undefined,
            { shallow: true },
        );
    };

    const goPrev = () => setDate(addDays(date, -1));
    const goNext = () => setDate(addDays(date, 1));
    // "Next day" past today would return no data, but we still allow it so
    // users can jump forward and confirm. Cap at some far-future sanity limit? Skip for v1.

    const profileColor = data ? resolveProfileColor(data.device.profileColor) : undefined;
    const headerLabel = useMemo(() => {
        if (!data) return dateLabel(date);
        return `${data.device.profileName ?? data.device.deviceName ?? 'Device'} — ${dateLabel(
            data.date,
        )}`;
    }, [data, date]);

    return (
        <Flex flexDirection="column" height={VIEWPORT_HEIGHT_MINUS_NAV}>
            <FlexItem>
                <Section
                    id={'bruh-map-history-header'}
                    className={'admin-section'}
                    removeArticle={true}>
                    <div className={'history-header'}>
                        <div className={'history-title'}>
                            {profileColor && (
                                <span
                                    className={'profile-dot'}
                                    style={{ backgroundColor: profileColor }}
                                />
                            )}
                            <h1 style={{ margin: 0 }}>{headerLabel}</h1>
                        </div>
                        <div className={'history-nav'}>
                            <button
                                type={'button'}
                                className={'button'}
                                onClick={goPrev}
                                aria-label={'Previous day'}>
                                ◀
                            </button>
                            <input
                                type={'date'}
                                value={date}
                                onChange={(e) => {
                                    if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) {
                                        setDate(e.target.value);
                                    }
                                }}
                            />
                            <button
                                type={'button'}
                                className={'button'}
                                onClick={goNext}
                                aria-label={'Next day'}>
                                ▶
                            </button>
                            <Link
                                href={'/bruh/map'}
                                className={'button button-secondary'}
                                style={{ marginLeft: 10 }}>
                                Back
                            </Link>
                        </div>
                    </div>
                    {data && (
                        <div style={{ opacity: 0.7, fontSize: '0.9em', marginTop: 6 }}>
                            {data.pings.length} ping{data.pings.length === 1 ? '' : 's'} in{' '}
                            {data.timezone}
                        </div>
                    )}
                </Section>
            </FlexItem>

            <FlexItem flexGrow={1} minHeight="0">
                <Alert success={alert.success} message={alert.message} />
                {loading && (
                    <div style={{ padding: 20, opacity: 0.7 }}>Loading…</div>
                )}
                {!loading && data && data.pings.length === 0 && (
                    <div style={{ padding: 20, opacity: 0.7 }}>
                        No location data for {dateLabel(data.date).toLowerCase()}. Try a
                        different day.
                    </div>
                )}
                {!loading && data && data.pings.length > 0 && (
                    <BruhMapHistoryView data={data} />
                )}
            </FlexItem>
        </Flex>
    );
}
