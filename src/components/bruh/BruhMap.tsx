'use client';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { DeviceLocationRow } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

type BruhMapProps = {
    getLastKnownDeviceLocation: DeviceLocationRow[];
};

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

                        {getLastKnownDeviceLocation.map((device) => (
                            <Marker
                                key={device.deviceId}
                                position={[device.location.latitude, device.location.longitude]}>
                                <Popup>
                                    {device.deviceId}
                                    {device.location.latitude} {device.location.longitude}
                                    {device.name}
                                    <br />
                                    Battery: {device.battery}%
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </FlexItem>
        </Flex>
    );
}
