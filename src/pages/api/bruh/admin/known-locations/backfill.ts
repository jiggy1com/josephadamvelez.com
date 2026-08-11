import type { NextApiRequest, NextApiResponse } from 'next';
import { qryBackfillLocationEventsForPlace } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Manual "Backfill events" trigger for a known location. Wipes existing events
// for this place and re-derives from history — intended for the case where a
// place's radius or pin was corrected and the user wants the past feed to reflect
// the new geometry. Not run automatically on update; the semantic ambiguity of
// updates (e.g. Grandma's House moved) makes silent re-derivation unsafe.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const knownLocationsId = Number(req.body?.knownLocationsId);
    if (!knownLocationsId) {
        return res
            .status(400)
            .json({ success: false, error: 'knownLocationsId is required' });
    }
    try {
        const backfill = await qryBackfillLocationEventsForPlace(knownLocationsId, {
            replaceExisting: true,
        });
        return res.status(200).json({ success: true, backfill });
    } catch (e) {
        handleServerError(res, 'known-locations/backfill', e);
    }
}
