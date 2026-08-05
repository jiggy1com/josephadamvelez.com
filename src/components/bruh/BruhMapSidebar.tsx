import Link from 'next/link';
import type { DeviceLocationRow } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';

type Props = {
    devices: DeviceLocationRow[];
    // Device IDs whose markers are currently hidden. Empty set = show everyone.
    hiddenDeviceIds: Set<string>;
    onToggleVisibility: (deviceId: string) => void;
    // Called when the profile name is tapped — the map should pan/zoom to
    // this device's last-known coordinates.
    onCenterOn: (device: DeviceLocationRow) => void;
};

// Sidebar for /bruh/map. One row per tracked device (a "device" here is what
// the location beacon reports — a profile could theoretically have more than
// one, but that's rare enough to leave for later).
export function BruhMapSidebar({ devices, hiddenDeviceIds, onToggleVisibility, onCenterOn }: Props) {
    if (devices.length === 0) {
        return (
            <div className={'bruh-map-sidebar'}>
                <p style={{ opacity: 0.6, padding: 12 }}>
                    No profiles have location data yet.
                </p>
            </div>
        );
    }

    return (
        <div className={'bruh-map-sidebar'}>
            <ul className={'bruh-map-sidebar-list'}>
                {devices.map((d) => {
                    const color = resolveProfileColor(d.profileColor);
                    const hidden = hiddenDeviceIds.has(d.deviceId);
                    const label = d.profileName ?? d.deviceName ?? d.deviceId;
                    return (
                        <li
                            key={d.deviceId}
                            className={`bruh-map-sidebar-row ${hidden ? 'is-hidden' : ''}`}>
                            <span
                                className={'profile-dot'}
                                style={{ backgroundColor: color }}
                                aria-hidden={true}
                            />
                            <button
                                type={'button'}
                                className={'bruh-map-sidebar-name'}
                                onClick={() => onCenterOn(d)}
                                title={'Center on marker'}>
                                {label}
                            </button>
                            <button
                                type={'button'}
                                className={'bruh-map-sidebar-eye'}
                                onClick={() => onToggleVisibility(d.deviceId)}
                                aria-pressed={!hidden}
                                aria-label={hidden ? 'Show marker' : 'Hide marker'}
                                title={hidden ? 'Show marker' : 'Hide marker'}>
                                <span className={'material-symbols-outlined'}>
                                    {hidden ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                            <Link
                                href={`/bruh/map/history/${d.deviceId}`}
                                className={'bruh-map-sidebar-details'}
                                title={'View location history'}>
                                Details
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
