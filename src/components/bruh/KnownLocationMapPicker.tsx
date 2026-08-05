'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Coord = { latitude: number; longitude: number };

type Props = {
    // Current picked coord — controlled from the parent form. Null = nothing picked yet.
    value: Coord | null;
    onChange: (coord: Coord) => void;
    // Circle overlay radius, matches the radius the parent form is about to save.
    // Purely visual — the picker doesn't own this state.
    radiusM: number;
    // Where to center the map on first render if no `value` is set yet. Defaults
    // to the app's home coord so admins don't start staring at (0, 0).
    initialCenter?: [number, number];
};

// Bare-teardrop icon so users see a real pin (not the default Leaflet blue
// marker sprite, which needs bundler config to load correctly).
const PICKER_ICON = L.divIcon({
    className: 'known-location-picker-pin',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
        <path d="M16 0 C7.16 0 0 7.16 0 16 C0 27.5 16 42 16 42 C16 42 32 27.5 32 16 C32 7.16 24.84 0 16 0 Z"
              fill="#d4a017" stroke="#111" stroke-width="1.5" />
        <circle cx="16" cy="16" r="6" fill="#fff" />
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
});

// Turns every map click into a coord update. Sits inside MapContainer so it
// can use useMapEvents — that hook has to render under a MapContainer child.
function ClickCapture({ onPick }: { onPick: (c: Coord) => void }) {
    useMapEvents({
        click(e) {
            onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });
    return null;
}

// When the picked coord changes from OUTSIDE the map (e.g. the parent form
// prefilled a value), pan the map to keep it in view.
function PanToPick({ value }: { value: Coord | null }) {
    const map = useMap();
    useEffect(() => {
        if (value) map.panTo([value.latitude, value.longitude]);
    }, [value, map]);
    return null;
}

export function KnownLocationMapPicker({
    value,
    onChange,
    radiusM,
    initialCenter = [28.215702, -82.62009],
}: Props) {
    const markerCoord: [number, number] | null = value
        ? [value.latitude, value.longitude]
        : null;

    return (
        <div className={'known-location-picker'}>
            <MapContainer
                center={markerCoord ?? initialCenter}
                zoom={17}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickCapture onPick={onChange} />
                <PanToPick value={value} />

                {markerCoord && (
                    <>
                        <Marker
                            position={markerCoord}
                            icon={PICKER_ICON}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    // e.target is the actual Leaflet Marker instance
                                    const ll = (e.target as L.Marker).getLatLng();
                                    onChange({ latitude: ll.lat, longitude: ll.lng });
                                },
                            }}
                        />
                        <Circle
                            center={markerCoord}
                            radius={radiusM}
                            pathOptions={{
                                color: '#d4a017',
                                fillColor: '#d4a017',
                                fillOpacity: 0.15,
                                weight: 2,
                            }}
                        />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
