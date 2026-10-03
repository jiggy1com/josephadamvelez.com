import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { SegmentedControl } from '@/components/segmented-control/SegmentedControl';
import type { InsightsAppStatus, InsightsDevice, InsightsPayload } from '@/utils/adminQueries';
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

function fmtPct(x: number | null | undefined): string {
    if (x === null || x === undefined) return '—';
    return `${Math.round(x * 100)}%`;
}

function fmtInterval(s: number | null | undefined): string {
    if (s === null || s === undefined) return '—';
    if (s < 60) return `${Math.round(s)}s`;
    return `${(s / 60).toFixed(1)}m`;
}

function fmtMeters(m: number | null | undefined): string {
    if (m === null || m === undefined) return '—';
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function fmtAgo(iso: string | null): string {
    if (!iso) return 'never';
    const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
    if (sec < 86400) return `${(sec / 3600).toFixed(1)}h ago`;
    return `${Math.round(sec / 86400)}d ago`;
}

const APP_STATUS_LABEL: Record<InsightsAppStatus, string> = {
    unknown: 'Unknown — no ping since version tracking began',
    'no-build': 'Old build — predates build reporting, update it',
    behind: 'Behind — newer build seen on this platform',
    current: 'Current (newest build seen)',
};

function fmtApp(d: InsightsDevice): string {
    const { appVersion, appBuild } = d.app;
    if (!appVersion) return '—';
    return appBuild ? `${appVersion} (${appBuild})` : appVersion;
}

// Battery start/end are point-in-time readings while off charger — if the phone
// spent most of the window on a charger, or off-charger readings straddled a
// plug-in, the delta is noise. So we only render drain when we have both bounds
// AND end ≤ start (i.e., it actually dropped).
function fmtDrain(start: number | null, end: number | null): string {
    if (start === null || end === null) return '—';
    const drop = start - end;
    if (drop <= 0) return '—';
    return `${start}→${end}% (−${drop}%)`;
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

                        <h2 style={{ marginTop: 20, marginBottom: 10 }}>App &amp; OS</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table'}>
                                <thead>
                                    <tr>
                                        <th>Device</th>
                                        <th>App (build)</th>
                                        <th>OS</th>
                                        <th>Model</th>
                                        <th>Last ping</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payload.devices.map((d) => (
                                        <tr key={d.devicesId}>
                                            <td>
                                                <span
                                                    className={'profile-dot'}
                                                    style={{
                                                        backgroundColor: resolveProfileColor(d.profileColor),
                                                        marginRight: 6,
                                                    }}
                                                />
                                                {d.profileName ?? '(unassigned)'} · {d.deviceName ?? '—'}
                                            </td>
                                            <td>{fmtApp(d)}</td>
                                            <td>{d.app.systemVersion ?? '—'}</td>
                                            <td>{d.app.deviceModel ?? '—'}</td>
                                            <td>{fmtAgo(d.app.lastPingAt)}</td>
                                            <td>{APP_STATUS_LABEL[d.app.status]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 style={{ marginTop: 30, marginBottom: 10 }}>Summary</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table'}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2}>Device</th>
                                        <th colSpan={9} className={'group-24h'}>
                                            Last 24h
                                        </th>
                                        <th colSpan={9} className={'group-7d'}>
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
                                        <th className={'group-24h'} title={'Median seconds between consecutive pings'}>
                                            Med. int.
                                        </th>
                                        <th className={'group-24h'} title={'p95 seconds between consecutive pings — catches OS throttling'}>
                                            p95 int.
                                        </th>
                                        <th className={'group-24h'} title={'Longest gap between pings'}>
                                            Max gap
                                        </th>
                                        <th className={'group-24h'} title={'First → last battery reading off charger (drop)'}>
                                            Drain (off)
                                        </th>
                                        <th className={'group-24h'} title={'Share of pings while device was charging'}>
                                            % chg.
                                        </th>
                                        <th className={'group-7d'}>Pings</th>
                                        <th className={'group-7d'}>Places (~10m)</th>
                                        <th className={'group-7d'}>Places (~100m)</th>
                                        <th className={'group-7d'}>Acc (m)</th>
                                        <th className={'group-7d'}>Med. int.</th>
                                        <th className={'group-7d'}>p95 int.</th>
                                        <th className={'group-7d'}>Max gap</th>
                                        <th className={'group-7d'}>Drain (off)</th>
                                        <th className={'group-7d'}>% chg.</th>
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
                                                <td>{fmtInterval(d.period24h.medianIntervalSeconds)}</td>
                                                <td>{fmtInterval(d.period24h.p95IntervalSeconds)}</td>
                                                <td>{fmtGap(d.period24h.maxGapSeconds)}</td>
                                                <td>{fmtDrain(d.period24h.batteryStartOffCharger, d.period24h.batteryEndOffCharger)}</td>
                                                <td>{fmtPct(d.period24h.pctPingsCharging)}</td>
                                                <td>{fmtInt(d.period7d.pings)}</td>
                                                <td>{fmtInt(d.period7d.distinctCells10m)}</td>
                                                <td>{fmtInt(d.period7d.distinctCells100m)}</td>
                                                <td>{fmt(d.period7d.medianAccuracyM)}</td>
                                                <td>{fmtInterval(d.period7d.medianIntervalSeconds)}</td>
                                                <td>{fmtInterval(d.period7d.p95IntervalSeconds)}</td>
                                                <td>{fmtGap(d.period7d.maxGapSeconds)}</td>
                                                <td>{fmtDrain(d.period7d.batteryStartOffCharger, d.period7d.batteryEndOffCharger)}</td>
                                                <td>{fmtPct(d.period7d.pctPingsCharging)}</td>
                                                <td>{fmtInt(d.projectedRowsPerMonth)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <h2 style={{ marginTop: 30, marginBottom: 4 }}>Trip fidelity (moving only)</h2>
                        <p style={{ opacity: 0.7, marginBottom: 10, fontSize: '0.9em' }}>
                            Consecutive pings ≤ 30 min apart at &gt; 3 m/s, measured from capture time.
                            Big steps are the straight lines on the history map.
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table'}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2}>Device</th>
                                        <th colSpan={6} className={'group-24h'}>Last 24h</th>
                                        <th colSpan={6} className={'group-7d'}>Last 7 days</th>
                                    </tr>
                                    <tr>
                                        {(['24h', '7d'] as const).flatMap((w) =>
                                            ['Steps', 'Med. int.', 'p95 int.', 'Med. step', 'p95 step', '> 1 km'].map(
                                                (label) => (
                                                    <th key={`${w}-${label}`} className={`group-${w}`}>
                                                        {label}
                                                    </th>
                                                ),
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payload.devices.map((d) => (
                                        <tr key={d.devicesId}>
                                            <td>
                                                {d.profileName ?? '(unassigned)'} · {d.deviceName ?? '—'}
                                            </td>
                                            {[d.period24h.moving, d.period7d.moving].flatMap((m, i) => [
                                                <td key={`${i}-n`}>{fmtInt(m.steps)}</td>,
                                                <td key={`${i}-mi`}>{fmtInterval(m.medianIntervalSeconds)}</td>,
                                                <td key={`${i}-pi`}>{fmtInterval(m.p95IntervalSeconds)}</td>,
                                                <td key={`${i}-ms`}>{fmtMeters(m.medianStepM)}</td>,
                                                <td key={`${i}-ps`}>{fmtMeters(m.p95StepM)}</td>,
                                                <td key={`${i}-o`}>{fmtPct(m.pctStepsOver1km)}</td>,
                                            ])}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 style={{ marginTop: 30, marginBottom: 4 }}>Ping sources</h2>
                        <p style={{ opacity: 0.7, marginBottom: 10, fontSize: '0.9em' }}>
                            What triggered each ping, as 24h / 7d counts. &quot;unknown&quot; is a build that
                            predates source reporting.
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={'insights-table'}>
                                <thead>
                                    <tr>
                                        <th>Device</th>
                                        <th>Sources (24h / 7d)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payload.devices.map((d) => (
                                        <tr key={d.devicesId}>
                                            <td>
                                                {d.profileName ?? '(unassigned)'} · {d.deviceName ?? '—'}
                                            </td>
                                            <td>
                                                {d.sources.length === 0
                                                    ? '—'
                                                    : d.sources
                                                          .map((x) => `${x.source} ${x.pings24h} / ${x.pings7d}`)
                                                          .join(' · ')}
                                            </td>
                                        </tr>
                                    ))}
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
