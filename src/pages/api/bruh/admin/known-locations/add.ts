import type { NextApiRequest, NextApiResponse } from 'next';
import {
    qryAddKnownLocation,
    qryBackfillLocationEventsForPlace,
    type KnownLocationInput,
} from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';
import { parseKnownLocationBody } from '@/utils/knownLocationsValidation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const parsed = parseKnownLocationBody(req.body);
    if (!parsed.valid) {
        return res.status(400).json({ success: false, error: parsed.error });
    }
    const input: KnownLocationInput = parsed.input;

    try {
        const data = (await qryAddKnownLocation(input)) as {
            knownLocationsId: number;
            name: string;
        }[];

        // Silent replay of historical pings so the new place gets a full activity
        // feed instead of only picking up future arrivals/departures.
        // replaceExisting: false — the id is brand new, no events exist yet.
        const backfill = data[0]
            ? await qryBackfillLocationEventsForPlace(data[0].knownLocationsId, {
                  replaceExisting: false,
              })
            : null;

        return res.status(200).json({ success: true, data, backfill });
    } catch (e) {
        handleServerError(res, 'known-locations/add', e);
    }
}
