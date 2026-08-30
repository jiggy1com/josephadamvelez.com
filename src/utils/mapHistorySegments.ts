import type { DeviceHistoryPing } from '@/utils/adminQueries';

// A day's pings collapse into an alternating sequence of dwells and trips.
// Dwells are consecutive pings that all match the same known place; trips
// are everything in between. Splits also occur on large time gaps, so
// "app was asleep in Doze for 40 minutes" won't fake a straight line
// across the map when we resume.
export type DwellSegment = {
    type: 'dwell';
    placeId: number;
    placeName: string;
    pings: DeviceHistoryPing[];
    // First and last pings observed at the place — an under-report of the
    // true arrive/depart moments (real events happen in the gap between
    // last dwell ping and first trip ping) but honest to observed data.
    arrivedAt: string;
    departedAt: string;
};

export type TripSegment = {
    type: 'trip';
    // 0-based, over trip segments only. Drives the color palette lookup
    // and the "Trip N of M" label.
    tripIndex: number;
    pings: DeviceHistoryPing[];
    startedAt: string;
    endedAt: string;
    // Trip start / end place, when the trip abuts a dwell. Populated during
    // segmentation so the trip popup can say "Home → Willow" without the
    // renderer re-walking neighboring segments.
    fromPlaceName: string | null;
    toPlaceName: string | null;
};

export type Segment = DwellSegment | TripSegment;

export type PlaceVisit = {
    arrivedAt: string;
    departedAt: string | null; // null = "still here" (last segment of the day)
    pingCount: number;
    durationMs: number | null;
};

export type DaySegmentation = {
    segments: Segment[];
    // Per-place visit history, keyed by placeId. Feeds the dwell-marker
    // popup so the map shows a single pin per place with all-visits detail
    // rather than N overlapping pins.
    visitsByPlaceId: Map<number, PlaceVisit[]>;
    tripCount: number;
};

// A gap larger than this splits the day into separate segments, even if
// both sides share the same (or null) placeId. Keeps a Doze-suspended
// app from stitching a straight line across a break in coverage.
const GAP_MS = 10 * 60 * 1000;

function timestampMs(p: DeviceHistoryPing): number {
    const iso = p.deviceTimestamp ?? p.receivedAt;
    return new Date(iso).getTime();
}

function timestampIso(p: DeviceHistoryPing): string {
    return p.deviceTimestamp ?? p.receivedAt;
}

export function analyzeDay(pings: DeviceHistoryPing[]): DaySegmentation {
    if (pings.length === 0) {
        return { segments: [], visitsByPlaceId: new Map(), tripCount: 0 };
    }

    // Group into raw runs first (same placeId, no big gap), then classify.
    const runs: DeviceHistoryPing[][] = [];
    let current: DeviceHistoryPing[] = [pings[0]];
    for (let i = 1; i < pings.length; i++) {
        const prev = pings[i - 1];
        const p = pings[i];
        const gap = timestampMs(p) - timestampMs(prev);
        const placeChanged = p.placeId !== prev.placeId;
        if (gap > GAP_MS || placeChanged) {
            runs.push(current);
            current = [p];
        } else {
            current.push(p);
        }
    }
    runs.push(current);

    const segments: Segment[] = [];
    let tripIdx = 0;
    for (const run of runs) {
        const first = run[0];
        const last = run[run.length - 1];
        if (first.placeId !== null && first.placeName !== null) {
            segments.push({
                type: 'dwell',
                placeId: first.placeId,
                placeName: first.placeName,
                pings: run,
                arrivedAt: timestampIso(first),
                departedAt: timestampIso(last),
            });
        } else {
            segments.push({
                type: 'trip',
                tripIndex: tripIdx++,
                pings: run,
                startedAt: timestampIso(first),
                endedAt: timestampIso(last),
                fromPlaceName: null,
                toPlaceName: null,
            });
        }
    }

    // Second pass: fill trip.fromPlaceName / toPlaceName from adjacent dwells.
    for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (s.type !== 'trip') continue;
        const prev = i > 0 ? segments[i - 1] : null;
        const next = i < segments.length - 1 ? segments[i + 1] : null;
        if (prev && prev.type === 'dwell') s.fromPlaceName = prev.placeName;
        if (next && next.type === 'dwell') s.toPlaceName = next.placeName;
    }

    // Third pass: aggregate visits per place for the dwell-marker popup.
    // Last-segment dwells with no downstream trip are treated as "still
    // here" — departedAt is null in the visit record even though the
    // segment itself has an observed final ping.
    const visitsByPlaceId = new Map<number, PlaceVisit[]>();
    for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (s.type !== 'dwell') continue;
        const isLastSegment = i === segments.length - 1;
        const departedAt = isLastSegment ? null : s.departedAt;
        const durationMs =
            departedAt !== null
                ? new Date(departedAt).getTime() - new Date(s.arrivedAt).getTime()
                : null;
        const visit: PlaceVisit = {
            arrivedAt: s.arrivedAt,
            departedAt,
            pingCount: s.pings.length,
            durationMs,
        };
        const bucket = visitsByPlaceId.get(s.placeId);
        if (bucket) bucket.push(visit);
        else visitsByPlaceId.set(s.placeId, [visit]);
    }

    return { segments, visitsByPlaceId, tripCount: tripIdx };
}

// Qualitative palette for trip polylines. Chosen for legibility on
// OpenStreetMap tiles (avoids beige/tan clashes with roads and land).
// Cycles if a day has more trips than colors — rare at family scale.
const TRIP_PALETTE = [
    '#0074d9', // blue
    '#ff851b', // orange
    '#2ecc40', // green
    '#e91e63', // pink-red
    '#9c27b0', // purple
    '#00bcd4', // cyan
    '#ff5722', // deep orange
    '#3f51b5', // indigo
];

export function colorForTrip(tripIndex: number): string {
    return TRIP_PALETTE[tripIndex % TRIP_PALETTE.length];
}

// Formatting helpers used by the map view. Kept next to segmentation so
// the map component stays focused on rendering.

export function formatDuration(ms: number | null): string {
    if (ms === null || ms < 0) return '—';
    const totalMinutes = Math.round(ms / 60_000);
    if (totalMinutes < 1) return '<1 min';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function formatClock(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Great-circle distance in meters between two lat/lon pairs.
function haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const R = 6_371_000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

// Sum of pairwise Haversine distances along the trip. Overstates true
// path length under GPS jitter, but honest to observed pings and cheap
// enough to compute in the browser.
export function tripDistanceMeters(pings: DeviceHistoryPing[]): number {
    let total = 0;
    for (let i = 1; i < pings.length; i++) {
        const a = pings[i - 1];
        const b = pings[i];
        total += haversineMeters(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    return total;
}

export function formatDistance(meters: number): string {
    if (meters < 100) return `${Math.round(meters)} m`;
    const km = meters / 1000;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
}
