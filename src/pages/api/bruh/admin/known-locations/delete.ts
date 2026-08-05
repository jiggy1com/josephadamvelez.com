import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteKnownLocation } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

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
        await qryDeleteKnownLocation(knownLocationsId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'known-locations/delete', e);
    }
}
