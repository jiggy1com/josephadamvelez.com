import type { NextApiRequest, NextApiResponse } from 'next';
import {
    haversineMeters,
    qryAddDeviceLocation,
    qryGetKnownLocationsList,
    qryGetLastLocationForDevice,
    qryInsertLocationEvent,
    qryUpsertDevice,
} from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body ?? {};
    const deviceId = typeof body.device_id === 'string' ? body.device_id.trim() : '';
    if (!deviceId) {
        return res.status(400).json({ success: false, error: 'device_id is required' });
    }

    try {
        // Register (or refresh metadata for) the device before recording its location.
        // Mobile app is a passive beacon — it never calls a separate "register" endpoint.
        await qryUpsertDevice(
            deviceId,
            typeof body.device_name === 'string' ? body.device_name : null,
            typeof body.platform === 'string' ? body.platform : null,
        );

        // Snapshot the last-known coord BEFORE inserting the new ping — needed
        // for geofence transition detection. Fine that this fires for every ping;
        // it's a single indexed lookup.
        const lat = Number(body.latitude);
        const lon = Number(body.longitude);
        const hasCoord = Number.isFinite(lat) && Number.isFinite(lon);
        const previous = hasCoord ? await qryGetLastLocationForDevice(deviceId) : null;

        await qryAddDeviceLocation(body);

        // Compute geofence arrivals/departures. Only meaningful when we have
        // a real new coord — pings missing lat/lon (shouldn't happen in practice
        // but be defensive) skip event detection.
        if (hasCoord) {
            const places = await qryGetKnownLocationsList();
            for (const place of places) {
                const isInside =
                    haversineMeters(lat, lon, place.latitude, place.longitude) <= place.radiusM;
                const wasInside =
                    previous !== null &&
                    haversineMeters(
                        previous.latitude,
                        previous.longitude,
                        place.latitude,
                        place.longitude,
                    ) <= place.radiusM;

                // First-ever ping of a device: previous is null, so wasInside is
                // false. Any place we're currently inside generates an arrival.
                if (!wasInside && isInside) {
                    await qryInsertLocationEvent({
                        devicesId: deviceId,
                        knownLocationsId: place.knownLocationsId,
                        eventType: 'arrival',
                        latitude: lat,
                        longitude: lon,
                    });
                } else if (wasInside && !isInside) {
                    await qryInsertLocationEvent({
                        devicesId: deviceId,
                        knownLocationsId: place.knownLocationsId,
                        eventType: 'departure',
                        latitude: lat,
                        longitude: lon,
                    });
                }
            }
        }

        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error, body });
    }
}
