import { useEffect, useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { DeviceRow, Profile } from '@/utils/adminQueries';

function formatLastSeen(iso: string | null): string {
    if (!iso) return 'never';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'never';
    return d.toLocaleString();
}

export default function BruhAdminDevicesList() {
    const [devices, setDevices] = useState<DeviceRow[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [savingId, setSavingId] = useState<string | null>(null);

    const load = async () => {
        try {
            const [dr, pr] = await Promise.all([
                fetch('/api/bruh/admin/devices/list').then((r) => r.json()),
                fetch('/api/bruh/admin/profiles/list').then((r) => r.json()),
            ]);
            if (dr.success) setDevices(dr.data);
            else setAlert({ success: false, message: dr.error ?? 'Failed to load devices' });
            if (pr.success) setProfiles(pr.data);
        } catch (e) {
            setAlert({ success: false, message: e instanceof Error ? e.message : String(e) });
        }
    };

    useEffect(() => {
        void load();
    }, []);

    // Optimistic assign — flip local state, fire API, revert on failure.
    const assign = async (devicesId: string, profilesId: number | null) => {
        setSavingId(devicesId);
        const prev = devices;
        const nextProfile = profiles.find((p) => p.profilesId === profilesId) ?? null;
        setDevices((ds) =>
            ds.map((d) =>
                d.devicesId === devicesId
                    ? {
                          ...d,
                          profilesId,
                          profileName: nextProfile?.name ?? null,
                      }
                    : d,
            ),
        );
        try {
            const res = await fetch('/api/bruh/admin/devices/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ devicesId, profilesId }),
            });
            const json = await res.json();
            if (!json.success) {
                setDevices(prev);
                setAlert({ success: false, message: json.error ?? 'Failed to assign' });
            } else {
                setAlert({
                    success: true,
                    message: nextProfile
                        ? `Assigned to ${nextProfile.name}`
                        : 'Unassigned',
                });
            }
        } catch (e) {
            setDevices(prev);
            setAlert({ success: false, message: e instanceof Error ? e.message : String(e) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <>
            <Section id={'bruh-admin-devices-list-header'} className={'admin-section'}>
                <h1>Devices</h1>
            </Section>
            <Section
                id={'bruh-admin-devices-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />

                {devices.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No devices yet. Install the iOS or Android app on a phone; the first
                        location ping will register a device here.
                    </p>
                )}

                {devices.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={'devices-table'}>
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>Platform</th>
                                    <th>Last seen</th>
                                    <th>Assigned to</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((d) => (
                                    <tr key={d.devicesId}>
                                        <td>
                                            <div>{d.name ?? '(unnamed)'}</div>
                                            <div className={'devices-table-meta'}>
                                                {d.devicesId}
                                            </div>
                                        </td>
                                        <td>{d.platform ?? '—'}</td>
                                        <td>{formatLastSeen(d.lastSeen)}</td>
                                        <td>
                                            <select
                                                value={d.profilesId ?? ''}
                                                disabled={savingId === d.devicesId}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    void assign(
                                                        d.devicesId,
                                                        v === '' ? null : Number(v),
                                                    );
                                                }}>
                                                <option value={''}>Unassigned</option>
                                                {profiles.map((p) => (
                                                    <option
                                                        key={p.profilesId}
                                                        value={p.profilesId}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </>
    );
}
