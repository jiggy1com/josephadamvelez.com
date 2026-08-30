'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Section } from '@/components/section/Section';
import { DeviceLocationRow } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';
import { BruhMapSidebar } from '@/components/bruh/BruhMapSidebar';
import { useSession } from '@/hooks/useSession';

type BruhMapProps = {
    getLastKnownDeviceLocation: DeviceLocationRow[];
};

// iOS/Android send -1 when battery reporting is unavailable (sim, disabled monitoring).
function isKnownBattery(v: number | null | undefined): v is number {
    return typeof v === 'number' && v >= 0;
}

function batteryColor(level: number): string {
    if (level >= 50) return '#51cf66';
    if (level >= 20) return '#fab005';
    return '#ff6b6b';
}

function formatTimestamp(iso: string | null | undefined): string {
    if (!iso) return 'unknown';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return d.toLocaleString();
}

function buildPinIcon(color: string, initial: string): L.DivIcon {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
            <path d="M16 0 C7.16 0 0 7.16 0 16 C0 27.5 16 42 16 42 C16 42 32 27.5 32 16 C32 7.16 24.84 0 16 0 Z"
                  fill="${color}" stroke="#111" stroke-width="1.5" />
            <circle cx="16" cy="16" r="10" fill="rgba(0,0,0,0.25)" />
            <text x="16" y="20" text-anchor="middle" font-family="system-ui, sans-serif"
                  font-size="13" font-weight="bold" fill="#fff">${initial}</text>
        </svg>
    `;
    return L.divIcon({
        className: 'bruh-map-pin',
        html: svg,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -38],
    });
}

// Small imperative helper — the parent tracks a `target` coord, and when it
// changes this component tells the Leaflet map to fly there. Needs to live
// inside <MapContainer> to access useMap().
function MapCenterer({ target }: { target: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 17, { duration: 0.75 });
        }
    }, [target, map]);
    return null;
}

// On first render: ask the browser for its location, then center strictly
// on that coord and zoom out just enough that every device pin fits.
// Fallbacks in order of preference:
//   1. browser coord + device pins → setView on browser, zoom-to-fit both
//   2. browser coord, no devices → setView on browser at street zoom
//   3. no browser coord, have devices → fit bounds around devices (legacy)
//   4. no browser coord, no devices → leave HOME center from MapContainer
// Runs once — guarded so hiding a device or any later state change never
// yanks the viewport away from wherever the user has panned.
function InitialViewport({ latlngs }: { latlngs: [number, number][] }) {
    const map = useMap();
    const hasFit = useRef(false);
    // Keep the latest ping array reachable from the (mount-only) effect
    // without re-running it — a re-fit would fight sidebar center-on.
    const latestLatLngs = useRef(latlngs);
    latestLatLngs.current = latlngs;

    useEffect(() => {
        const fitDevicesOnly = () => {
            if (hasFit.current) return;
            const coords = latestLatLngs.current;
            if (coords.length === 0) return;
            hasFit.current = true;
            if (coords.length === 1) {
                map.setView(coords[0], 16);
                return;
            }
            map.fitBounds(coords, { padding: [40, 40] });
        };

        const centerOnBrowser = (lat: number, lon: number) => {
            if (hasFit.current) return;
            hasFit.current = true;
            const browser: [number, number] = [lat, lon];
            const coords = latestLatLngs.current;
            if (coords.length === 0) {
                map.setView(browser, 15);
                return;
            }
            const bounds = L.latLngBounds([browser, ...coords]);
            // getBoundsZoom returns the max zoom at which bounds still fits.
            // inside=false so we err toward "everything visible" instead of
            // "bounds fully contained" (matters at edge cases).
            const fitZoom = map.getBoundsZoom(bounds, false, L.point(40, 40));
            map.setView(browser, fitZoom);
        };

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            fitDevicesOnly();
            return;
        }

        // Guard: if the browser sits on the permission prompt too long we
        // still want a useful viewport instead of "stuck on HOME".
        const timeoutId = window.setTimeout(fitDevicesOnly, 5000);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                window.clearTimeout(timeoutId);
                centerOnBrowser(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                window.clearTimeout(timeoutId);
                fitDevicesOnly();
            },
            { timeout: 5000, maximumAge: 60_000 },
        );

        return () => window.clearTimeout(timeoutId);
    }, [map]);
    return null;
}

export function BruhMap({ getLastKnownDeviceLocation }: BruhMapProps) {
    const HOME_LOCATION: [number, number] = [28.215702, -82.62009] as [number, number];
    const { user } = useSession();
    const canAddPlace = user?.isAdmin === true;
    const [layer, setLayer] = useState<'street' | 'satellite'>('street');
    const [hiddenDeviceIds, setHiddenDeviceIds] = useState<Set<string>>(new Set());
    // Bumping a counter alongside the target so tapping the same profile twice
    // still re-flies to it (React would otherwise consider the prop unchanged).
    const [centerRequest, setCenterRequest] = useState<{
        target: [number, number] | null;
        seq: number;
    }>({ target: null, seq: 0 });

    const toggleVisibility = (deviceId: string) => {
        setHiddenDeviceIds((prev) => {
            const next = new Set(prev);
            if (next.has(deviceId)) next.delete(deviceId);
            else next.add(deviceId);
            return next;
        });
    };

    const centerOn = (d: DeviceLocationRow) => {
        if (!d.location) return;
        setCenterRequest((prev) => ({
            target: [d.location!.latitude, d.location!.longitude],
            seq: prev.seq + 1,
        }));
    };

    const visibleDevices = useMemo(
        () => getLastKnownDeviceLocation.filter((d) => !hiddenDeviceIds.has(d.deviceId)),
        [getLastKnownDeviceLocation, hiddenDeviceIds],
    );

    // Coords used by the mount-only viewport fit. Uses all-known-devices
    // rather than visibleDevices because on mount nothing is hidden yet,
    // and this stays right even if we ever pre-hide devices from URL params.
    const deviceLatLngs = useMemo<[number, number][]>(
        () =>
            getLastKnownDeviceLocation
                .filter((d) => d.location)
                .map((d) => [d.location!.latitude, d.location!.longitude]),
        [getLastKnownDeviceLocation],
    );

    return (
        <Flex flexDirection="column" height="100%">
            <FlexItem>
                <Section id={'bruh-chores'} removeArticle={true}>
                    <h1>Bruh Map</h1>
                </Section>
            </FlexItem>
            <FlexItem flexGrow={1} minHeight="0">
                <div className={'bruh-map-shell'}>
                    <BruhMapSidebar
                        devices={getLastKnownDeviceLocation}
                        hiddenDeviceIds={hiddenDeviceIds}
                        onToggleVisibility={toggleVisibility}
                        onCenterOn={centerOn}
                    />
                    <div className={'bruh-map-stage'}>
                        <div
                            className="map-layer-toggle"
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 1000,
                                display: 'flex',
                                gap: 8,
                            }}>
                            <button
                                className={layer === 'street' ? 'active' : ''}
                                onClick={() => setLayer('street')}>
                                Street
                            </button>
                            <button
                                className={layer === 'satellite' ? 'active' : ''}
                                onClick={() => setLayer('satellite')}>
                                Satellite
                            </button>
                        </div>
                        <MapContainer
                            center={HOME_LOCATION}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}>
                            {layer === 'street' && (
                                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            )}
                            {layer === 'satellite' && (
                                <>
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                                </>
                            )}

                            <InitialViewport latlngs={deviceLatLngs} />
                            <MapCenterer target={centerRequest.target} key={centerRequest.seq} />

                            {visibleDevices.map((device) => {
                                if (!device.location) return null;
                                const color = resolveProfileColor(device.profileColor);
                                const initial =
                                    (device.profileName ?? '?').trim().charAt(0).toUpperCase() ||
                                    '?';
                                const icon = buildPinIcon(color, initial);
                                const known = isKnownBattery(device.battery);
                                return (
                                    <Marker
                                        key={device.deviceId}
                                        position={[
                                            device.location.latitude,
                                            device.location.longitude,
                                        ]}
                                        icon={icon}>
                                        <Popup>
                                            <div style={{ minWidth: 180 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1em',
                                                        color,
                                                        marginBottom: 4,
                                                    }}>
                                                    {device.profileName ?? 'Unknown'}
                                                </div>
                                                {device.placeName && (
                                                    <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginBottom: 2 }}>
                                                        📍 {device.placeName}
                                                    </div>
                                                )}
                                                {device.deviceName && (
                                                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                                                        {device.deviceName}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.85em', opacity: 0.7, marginTop: 6 }}>
                                                    {formatTimestamp(device.location.timestamp)}
                                                </div>
                                                <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {known ? (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                            }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: '50%',
                                                                    background: batteryColor(
                                                                        device.battery as number,
                                                                    ),
                                                                }}
                                                            />
                                                            {Math.round(device.battery as number)}%
                                                        </span>
                                                    ) : (
                                                        <span style={{ opacity: 0.6 }}>
                                                            battery unknown
                                                        </span>
                                                    )}
                                                    {device.charging && (
                                                        <span title={'Charging'} aria-label={'Charging'}>
                                                            ⚡
                                                        </span>
                                                    )}
                                                </div>
                                                {canAddPlace && !device.placeName && (
                                                    <div style={{ marginTop: 10 }}>
                                                        <Link
                                                            href={`/bruh/admin/places/add?lat=${device.location.latitude}&lon=${device.location.longitude}`}
                                                            className={'popup-add-place'}>
                                                            + Add known place
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>
            </FlexItem>
        </Flex>
    );
}
