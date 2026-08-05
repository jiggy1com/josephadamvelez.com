import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateKnownLocation } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';
import { parseKnownLocationBody } from '@/utils/knownLocationsValidation';

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

    const parsed = parseKnownLocationBody(req.body);
    if (!parsed.valid) {
        return res.status(400).json({ success: false, error: parsed.error });
    }

    try {
        const data = await qryUpdateKnownLocation(knownLocationsId, parsed.input);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'known-locations/update', e);
    }
}
