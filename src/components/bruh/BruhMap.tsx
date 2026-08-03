'use client';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { DeviceLocationRow } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveProfileColor } from '@/constants/profileColors';

type BruhMapProps = {
    getLastKnownDeviceLocation: DeviceLocationRow[];
};

// iOS/Android send -1 when battery reporting is unavailable (sim, disabled monitoring).
function isKnownBattery(v: number | null | undefined): v is number {
    return typeof v === 'number' && v >= 0;
}

// Map battery level to a semantic color. Kept local to the map since these are
// battery thresholds, not profile colors — different concern.
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

// Build a colored pin as a divIcon so we can tint per-profile without shipping
// a custom PNG for each color. The teardrop shape matches user expectation of
// "a map pin" while the pointer tip anchors to the actual coordinate.
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

export function BruhMap({ getLastKnownDeviceLocation }: BruhMapProps) {
    const HOME_LOCATION: [number, number] = [28.215702, -82.62009] as [number, number];
    const [layer, setLayer] = useState<'street' | 'satellite'>('street');

    return (
        <Flex flexDirection="column" height="100%">
            <FlexItem>
                <Section id={'bruh-chores'} removeArticle={true}>
                    <h1>Bruh Map</h1>
                </Section>
            </FlexItem>
            <FlexItem flexGrow={1} minHeight="0">
                <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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

                        {getLastKnownDeviceLocation.map((device) => {
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
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </FlexItem>
        </Flex>
    );
}
