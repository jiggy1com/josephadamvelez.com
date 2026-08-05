import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddKnownLocation, type KnownLocationInput } from '@/utils/adminQueries';
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
        const data = await qryAddKnownLocation(input);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'known-locations/add', e);
    }
}
