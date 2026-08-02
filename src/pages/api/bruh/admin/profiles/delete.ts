import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteProfile } from '@/utils/adminQueries';
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
        await qryDeleteProfile(profilesId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'profiles/delete', e);
    }
}
