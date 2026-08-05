import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { SegmentedControl } from '@/components/segmented-control/SegmentedControl';
import type { InsightsPayload } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';

type HourlyView = '24h' | '7d';

function fmt(n: number | null | undefined, digits = 1): string {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(digits);
}

function fmtGap(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '—';
    const min = Math.round(seconds / 60);
    if (min < 60) return `${min}m`;
    const hours = (min / 60).toFixed(1);
    return `${hours}h`;
}

function fmtInt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString();
}

export default function BruhAdminDevicesInsights() {
    const [payload, setPayload] = useState<InsightsPayload | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [copied, setCopied] = useState(false);
    const [hourlyView, setHourlyView] = useState<HourlyView>('24h');

    useEffect(() => {
        void (async () => {
            try {
                const r = await fetch('/api/bruh/admin/devices/insights');
                const json = await r.json();
                if (json.success) setPayload(json.data);
                else setAlert({ success: false, message: json.error ?? 'Failed to load' });
            } catch (e) {
                setAlert({ success: false, message: e instanceof Error ? e.message : String(e) });
            }
        })();
    }, []);

    const jsonText = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ''), [payload]);

    const copyJson = async () => {
        if (!jsonText) return;
        try {
            await navigator.clipboard.writeText(jsonText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Fallback: select-all the textarea below so the user can Cmd-C.
            setAlert({
                success: false,
                message: 'Clipboard blocked — select the JSON below and copy manually.',
            });
        }
    };

    return (
        <>
            <Section id={'bruh-admin-devices-insights-header'} className={'admin-section'}>
                <h1>Location Insights</h1>
            </Section>

            <Section
                id={'bruh-admin-devices-insights'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />

                {!payload && <p style={{ opacity: 0.7 }}>Loading…</p>}

                {payload && payload.devices.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No devices yet. Once the mobile app has been pinging for a bit,
                        insights will show up here.
                    </p>
                )}

                {payload && payload.devices.length > 0 && (
                    <>
                        <p style={{ opacity: 0.7, marginBottom: 10 }}>
                            Timezone: <code>{payload.timezone}</code> · Generated{' '}
                            {new Date(payload.generatedAt).toLocaleString()}
                        </p>

                        <h2 style={{ marginTop: 20, marginBottom: 10 }}>Summary</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table'}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2}>Device</th>
                                        <th colSpan={6} className={'group-24h'}>
                                            Last 24h
                                        </th>
                                        <th colSpan={6} className={'group-7d'}>
                                            Last 7 days
                                        </th>
                                        <th rowSpan={2} title={'pings24h × 30'}>
                                            Rows / mo. (proj.)
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className={'group-24h'}>Pings</th>
                                        <th className={'group-24h'} title={'Distinct ~10m grid cells (GPS jitter resolution)'}>
                                            Places (~10m)
                                        </th>
                                        <th className={'group-24h'} title={'Distinct ~100m grid cells (block resolution)'}>
                                            Places (~100m)
                                        </th>
                                        <th className={'group-24h'} title={'Median horizontal accuracy'}>
                                            Acc (m)
                                        </th>
                                        <th className={'group-24h'} title={'Longest gap between pings'}>
                                            Max gap
                                        </th>
                                        <th className={'group-24h'} title={'Min battery seen off charger'}>
                                            Min bat.
                                        </th>
                                        <th className={'group-7d'}>Pings</th>
                                        <th className={'group-7d'}>Places (~10m)</th>
                                        <th className={'group-7d'}>Places (~100m)</th>
                                        <th className={'group-7d'}>Acc (m)</th>
                                        <th className={'group-7d'}>Max gap</th>
                                        <th className={'group-7d'}>Min bat.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payload.devices.map((d) => {
                                        const color = resolveProfileColor(d.profileColor);
                                        return (
                                            <tr key={d.devicesId}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span
                                                            className={'profile-dot'}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: 'bold' }}>
                                                                {d.profileName ?? '(unassigned)'}
                                                            </div>
                                                            <div style={{ fontSize: '0.85em', opacity: 0.7 }}>
                                                                {d.deviceName ?? '—'}
                                                                {d.platform ? ` · ${d.platform}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{fmtInt(d.period24h.pings)}</td>
                                                <td>{fmtInt(d.period24h.distinctCells10m)}</td>
                                                <td>{fmtInt(d.period24h.distinctCells100m)}</td>
                                                <td>{fmt(d.period24h.medianAccuracyM)}</td>
                                                <td>{fmtGap(d.period24h.maxGapSeconds)}</td>
                                                <td>
                                                    {d.period24h.minBatteryOffCharger !== null
                                                        ? `${d.period24h.minBatteryOffCharger}%`
                                                        : '—'}
                                                </td>
                                                <td>{fmtInt(d.period7d.pings)}</td>
                                                <td>{fmtInt(d.period7d.distinctCells10m)}</td>
                                                <td>{fmtInt(d.period7d.distinctCells100m)}</td>
                                                <td>{fmt(d.period7d.medianAccuracyM)}</td>
                                                <td>{fmtGap(d.period7d.maxGapSeconds)}</td>
                                                <td>
                                                    {d.period7d.minBatteryOffCharger !== null
                                                        ? `${d.period7d.minBatteryOffCharger}%`
                                                        : '—'}
                                                </td>
                                                <td>{fmtInt(d.projectedRowsPerMonth)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <h2 style={{ marginTop: 30, marginBottom: 8 }}>
                            Pings per hour of day
                        </h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                            <SegmentedControl<HourlyView>
                                ariaLabel={'Hourly view'}
                                value={hourlyView}
                                onChange={setHourlyView}
                                options={[
                                    { value: '24h', label: 'Last 24h' },
                                    { value: '7d', label: '7d avg' },
                                ]}
                            />
                            <span style={{ opacity: 0.7, fontSize: '0.9em' }}>
                                {hourlyView === '24h'
                                    ? `Raw ping counts in the last 24 hours, bucketed by hour of day (${payload.timezone}).`
                                    : `Average pings per hour of day over the last 7 days (${payload.timezone}). Best for recurring patterns.`}
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table insights-hourly'}>
                                <thead>
                                    <tr>
                                        <th>Hour</th>
                                        {payload.devices.map((d) => {
                                            const color = resolveProfileColor(d.profileColor);
                                            return (
                                                <th key={d.devicesId}>
                                                    <span
                                                        className={'profile-dot'}
                                                        style={{ backgroundColor: color, marginRight: 6 }}
                                                    />
                                                    {d.profileName ?? '(unassigned)'}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 24 }, (_, hour) => (
                                        <tr key={hour}>
                                            <td>
                                                {hour.toString().padStart(2, '0')}:00
                                            </td>
                                            {payload.devices.map((d) => {
                                                const bucket = d.hourly.find((h) => h.hour === hour);
                                                const v =
                                                    hourlyView === '24h'
                                                        ? bucket?.pings24h ?? 0
                                                        : bucket?.avgPings7d ?? 0;
                                                if (v === 0) {
                                                    return <td key={d.devicesId}>—</td>;
                                                }
                                                // 24h is a raw integer count; 7d is an average with 1 decimal.
                                                const display =
                                                    hourlyView === '24h' ? v.toString() : v.toFixed(1);
                                                return <td key={d.devicesId}>{display}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 style={{ marginTop: 30, marginBottom: 10 }}>Share with Claude</h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                            <button
                                type={'button'}
                                className={'button'}
                                onClick={() => void copyJson()}>
                                {copied ? 'Copied!' : 'Copy JSON'}
                            </button>
                            <span style={{ opacity: 0.7, fontSize: '0.9em' }}>
                                Paste into a Claude chat for interpretation and tuning
                                recommendations.
                            </span>
                        </div>
                        <textarea
                            readOnly
                            value={jsonText}
                            onFocus={(e) => e.currentTarget.select()}
                            style={{
                                width: '100%',
                                height: 200,
                                fontFamily: 'monospace',
                                fontSize: '0.85em',
                            }}
                        />
                    </>
                )}
            </Section>
        </>
    );
}
