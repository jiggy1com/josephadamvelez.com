import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteProfile, qryGetProfileById } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const profilesId = Number(req.body?.profilesId);
    if (!profilesId) {
        return res.status(400).json({ success: false, error: 'profilesId is required' });
    }

    try {
        // The household profile is load-bearing — the wall kiosk signs in as it,
        // and re-onboarding requires zero household rows. Deleting would strand
        // the kiosk. Block explicitly rather than relying on UI-only hiding.
        const existing = await qryGetProfileById(profilesId);
        if (existing?.isHousehold) {
            return res.status(400).json({
                success: false,
                error: 'The household profile cannot be deleted',
            });
        }
        await qryDeleteProfile(profilesId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'profiles/delete', e);
    }
}
