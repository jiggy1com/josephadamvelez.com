'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { DeviceHistoryPayload } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';
import { useSession } from '@/hooks/useSession';

type Props = {
    data: DeviceHistoryPayload;
};

function formatTime(iso: string | null | undefined): string {
    if (!iso) return 'unknown';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return d.toLocaleTimeString();
}

// When the data changes, auto-fit the map to the bounding box of the day's
// pings. Keeps the user oriented as they page through dates.
function FitToPings({ latlngs }: { latlngs: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (latlngs.length === 0) return;
        if (latlngs.length === 1) {
            map.setView(latlngs[0], 16);
            return;
        }
        map.fitBounds(latlngs, { padding: [40, 40] });
    }, [latlngs, map]);
    return null;
}

export function BruhMapHistoryView({ data }: Props) {
    const { user } = useSession();
    const canAddPlace = user?.isAdmin === true;
    const color = resolveProfileColor(data.device.profileColor);
    // Only Leaflet-safe tuples pass through — bad coords upstream shouldn't
    // crash the polyline layer.
    const latlngs = useMemo<[number, number][]>(
        () =>
            data.pings
                .filter(
                    (p) =>
                        typeof p.latitude === 'number' &&
                        typeof p.longitude === 'number' &&
                        !Number.isNaN(p.latitude) &&
                        !Number.isNaN(p.longitude),
                )
                .map((p) => [p.latitude, p.longitude]),
        [data.pings],
    );

    // Fallback map center: home coord if no pings today. Keeps Leaflet happy —
    // it needs a valid center at mount even if we plan to fitBounds later.
    const fallbackCenter: [number, number] = [28.215702, -82.62009];
    const initialCenter = latlngs[0] ?? fallbackCenter;

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                center={initialCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <FitToPings latlngs={latlngs} />

                {latlngs.length >= 2 && (
                    <Polyline
                        positions={latlngs}
                        pathOptions={{ color, weight: 4, opacity: 0.8 }}
                    />
                )}

                {data.pings.map((ping, i) => {
                    // First and last pings get a slightly bigger radius so the day's
                    // start and end are legible without a legend.
                    const isEdge = i === 0 || i === data.pings.length - 1;
                    return (
                        <CircleMarker
                            key={`${ping.receivedAt}-${i}`}
                            center={[ping.latitude, ping.longitude]}
                            radius={isEdge ? 8 : 4}
                            pathOptions={{
                                color: '#111',
                                weight: 1,
                                fillColor: color,
                                fillOpacity: 0.9,
                            }}>
                            <Popup>
                                <div style={{ minWidth: 160 }}>
                                    <div style={{ fontWeight: 'bold', color }}>
                                        {i === 0
                                            ? 'Start'
                                            : i === data.pings.length - 1
                                              ? 'End'
                                              : `Ping ${i + 1}`}
                                    </div>
                                    {ping.placeName && (
                                        <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginTop: 2 }}>
                                            📍 {ping.placeName}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                                        {formatTime(ping.deviceTimestamp ?? ping.receivedAt)}
                                    </div>
                                    {ping.accuracy !== null && (
                                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
                                            ±{Math.round(ping.accuracy)}m
                                        </div>
                                    )}
                                    {typeof ping.battery === 'number' && ping.battery >= 0 && (
                                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
                                            🔋 {Math.round(ping.battery)}%
                                            {ping.charging ? ' ⚡' : ''}
                                        </div>
                                    )}
                                    {canAddPlace && !ping.placeName && (
                                        <div style={{ marginTop: 8 }}>
                                            <Link
                                                href={`/bruh/admin/places/add?lat=${ping.latitude}&lon=${ping.longitude}`}
                                                className={'popup-add-place'}>
                                                + Add known place
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
