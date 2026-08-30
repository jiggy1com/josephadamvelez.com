'use client';
import { Fragment, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    CircleMarker,
    MapContainer,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeviceHistoryPayload, VisitedPlace } from '@/utils/adminQueries';
import { resolveProfileColor } from '@/constants/profileColors';
import { useSession } from '@/hooks/useSession';
import {
    analyzeDay,
    colorForTrip,
    formatClock,
    formatDistance,
    formatDuration,
    tripDistanceMeters,
    type DwellSegment,
    type PlaceVisit,
    type TripSegment,
} from '@/utils/mapHistorySegments';

type Props = {
    data: DeviceHistoryPayload;
};

// Auto-fit the map to the bounding box of every ping + every visited place
// so both the dwell markers and the trip lines land in the initial view.
function FitToDay({ latlngs }: { latlngs: [number, number][] }) {
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

// Filter a ping list into leaflet-safe tuples. Bad coords upstream shouldn't
// crash the polyline / marker layers.
function toLatLngs(
    pings: { latitude: number; longitude: number }[],
): [number, number][] {
    return pings
        .filter(
            (p) =>
                typeof p.latitude === 'number' &&
                typeof p.longitude === 'number' &&
                !Number.isNaN(p.latitude) &&
                !Number.isNaN(p.longitude),
        )
        .map((p) => [p.latitude, p.longitude]);
}

function summarizeVisits(visits: PlaceVisit[]): {
    firstArrived: string;
    lastDeparted: string | null;
    totalMs: number;
    hasOngoing: boolean;
} {
    let firstArrived = visits[0].arrivedAt;
    let lastDeparted: string | null = null;
    let totalMs = 0;
    let hasOngoing = false;
    for (const v of visits) {
        if (new Date(v.arrivedAt).getTime() < new Date(firstArrived).getTime()) {
            firstArrived = v.arrivedAt;
        }
        if (v.departedAt === null) {
            hasOngoing = true;
        } else if (
            lastDeparted === null ||
            new Date(v.departedAt).getTime() > new Date(lastDeparted).getTime()
        ) {
            lastDeparted = v.departedAt;
        }
        if (v.durationMs !== null) totalMs += v.durationMs;
    }
    return { firstArrived, lastDeparted, totalMs, hasOngoing };
}

function DwellPopup({
    place,
    visits,
}: {
    place: VisitedPlace;
    visits: PlaceVisit[];
}) {
    const summary = summarizeVisits(visits);
    return (
        <div style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 'bold' }}>📍 {place.name}</div>
            {visits.length === 1 ? (
                <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                    <div>Arrived {formatClock(visits[0].arrivedAt)}</div>
                    <div>
                        {visits[0].departedAt
                            ? `Departed ${formatClock(visits[0].departedAt)}`
                            : 'Still here'}
                    </div>
                    {visits[0].durationMs !== null && (
                        <div style={{ opacity: 0.75 }}>
                            {formatDuration(visits[0].durationMs)}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                        <div>First arrived {formatClock(summary.firstArrived)}</div>
                        <div>
                            {summary.hasOngoing
                                ? 'Still here'
                                : `Last departed ${formatClock(summary.lastDeparted)}`}
                        </div>
                        <div style={{ opacity: 0.75 }}>
                            {visits.length} visits · {formatDuration(summary.totalMs)} total
                        </div>
                    </div>
                    <ol
                        style={{
                            fontSize: '0.8em',
                            opacity: 0.75,
                            paddingLeft: 18,
                            marginTop: 6,
                            marginBottom: 0,
                        }}>
                        {visits.map((v, i) => (
                            <li key={i}>
                                {formatClock(v.arrivedAt)} →{' '}
                                {v.departedAt ? formatClock(v.departedAt) : 'still here'}
                                {v.durationMs !== null && ` (${formatDuration(v.durationMs)})`}
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </div>
    );
}

function TripPopup({
    trip,
    tripCount,
}: {
    trip: TripSegment;
    tripCount: number;
}) {
    const durationMs =
        new Date(trip.endedAt).getTime() - new Date(trip.startedAt).getTime();
    const distanceM = tripDistanceMeters(trip.pings);
    return (
        <div style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 'bold', color: colorForTrip(trip.tripIndex) }}>
                Trip {trip.tripIndex + 1} of {tripCount}
            </div>
            <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                <div>
                    From <b>{trip.fromPlaceName ?? 'somewhere'}</b> at{' '}
                    {formatClock(trip.startedAt)}
                </div>
                <div>
                    To <b>{trip.toPlaceName ?? 'somewhere'}</b> at{' '}
                    {formatClock(trip.endedAt)}
                </div>
                <div style={{ opacity: 0.75, marginTop: 2 }}>
                    {formatDuration(durationMs)} · {formatDistance(distanceM)} ·{' '}
                    {trip.pings.length} ping{trip.pings.length === 1 ? '' : 's'}
                </div>
            </div>
        </div>
    );
}

function TripEndpointPopup({
    trip,
    tripCount,
    role,
    ping,
    canAddPlace,
}: {
    trip: TripSegment;
    tripCount: number;
    role: 'start' | 'end';
    ping: { latitude: number; longitude: number; deviceTimestamp: string | null; receivedAt: string };
    canAddPlace: boolean;
}) {
    const timeLabel = formatClock(ping.deviceTimestamp ?? ping.receivedAt);
    return (
        <div style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 'bold', color: colorForTrip(trip.tripIndex) }}>
                {role === 'start' ? 'Trip start' : 'Trip end'} · #{trip.tripIndex + 1} of{' '}
                {tripCount}
            </div>
            <div style={{ fontSize: '0.9em', marginTop: 4 }}>{timeLabel}</div>
            {canAddPlace && (
                <div style={{ marginTop: 8 }}>
                    <Link
                        href={`/bruh/admin/places/add?lat=${ping.latitude}&lon=${ping.longitude}`}
                        className={'popup-add-place'}>
                        + Add known place
                    </Link>
                </div>
            )}
        </div>
    );
}

export function BruhMapHistoryView({ data }: Props) {
    const { user } = useSession();
    const canAddPlace = user?.isAdmin === true;
    const profileColor = resolveProfileColor(data.device.profileColor);

    const { segments, visitsByPlaceId, tripCount } = useMemo(
        () => analyzeDay(data.pings),
        [data.pings],
    );

    // Bounding coords: every ping AND every visited place. Visited places
    // widen the view when the day has short in-and-out visits whose pings
    // hug the place center — otherwise fitBounds could crop the dwell pin.
    const boundsLatLngs = useMemo<[number, number][]>(() => {
        const pings = toLatLngs(data.pings);
        const places: [number, number][] = data.visitedPlaces.map((p) => [
            p.latitude,
            p.longitude,
        ]);
        return [...pings, ...places];
    }, [data.pings, data.visitedPlaces]);

    // Fallback center: home coord if we have nothing to plot. Leaflet needs
    // a valid center at mount time even when we plan to fitBounds later.
    const fallbackCenter: [number, number] = [28.215702, -82.62009];
    const initialCenter = boundsLatLngs[0] ?? fallbackCenter;

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                center={initialCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <FitToDay latlngs={boundsLatLngs} />

                {segments.map((seg, idx) => {
                    if (seg.type !== 'trip') return null;
                    const latlngs = toLatLngs(seg.pings);
                    if (latlngs.length < 2) return null;
                    const color = colorForTrip(seg.tripIndex);
                    return (
                        <Polyline
                            key={`trip-line-${idx}`}
                            positions={latlngs}
                            pathOptions={{ color, weight: 4, opacity: 0.85 }}>
                            <Popup>
                                <TripPopup trip={seg} tripCount={tripCount} />
                            </Popup>
                        </Polyline>
                    );
                })}

                {segments.map((seg, idx) => {
                    if (seg.type !== 'trip') return null;
                    const color = colorForTrip(seg.tripIndex);
                    const first = seg.pings[0];
                    const last = seg.pings[seg.pings.length - 1];
                    // Only render an endpoint marker where the trip does NOT
                    // abut a dwell — otherwise the dwell pin already anchors
                    // that end of the trip and a second marker is redundant.
                    return (
                        <Fragment key={`trip-endpoints-${idx}`}>
                            {seg.fromPlaceName === null && (
                                <CircleMarker
                                    center={[first.latitude, first.longitude]}
                                    radius={7}
                                    pathOptions={{
                                        color: '#111',
                                        weight: 1,
                                        fillColor: color,
                                        fillOpacity: 0.95,
                                    }}>
                                    <Popup>
                                        <TripEndpointPopup
                                            trip={seg}
                                            tripCount={tripCount}
                                            role={'start'}
                                            ping={first}
                                            canAddPlace={canAddPlace}
                                        />
                                    </Popup>
                                </CircleMarker>
                            )}
                            {seg.toPlaceName === null && (
                                <CircleMarker
                                    center={[last.latitude, last.longitude]}
                                    radius={7}
                                    pathOptions={{
                                        color: '#111',
                                        weight: 1,
                                        fillColor: color,
                                        fillOpacity: 0.95,
                                    }}>
                                    <Popup>
                                        <TripEndpointPopup
                                            trip={seg}
                                            tripCount={tripCount}
                                            role={'end'}
                                            ping={last}
                                            canAddPlace={canAddPlace}
                                        />
                                    </Popup>
                                </CircleMarker>
                            )}
                        </Fragment>
                    );
                })}

                {data.visitedPlaces.map((place) => {
                    const visits = visitsByPlaceId.get(place.placeId) ?? [];
                    if (visits.length === 0) return null;
                    return (
                        <CircleMarker
                            key={`dwell-${place.placeId}`}
                            center={[place.latitude, place.longitude]}
                            radius={11}
                            pathOptions={{
                                color: '#111',
                                weight: 2,
                                fillColor: profileColor,
                                fillOpacity: 0.85,
                            }}>
                            <Popup>
                                <DwellPopup place={place} visits={visits} />
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
