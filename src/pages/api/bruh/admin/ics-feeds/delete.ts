import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteIcsFeed } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const icsFeedId = Number(req.body?.icsFeedId);
    if (!icsFeedId) {
        return res.status(400).json({ success: false, error: 'icsFeedId is required' });
    }

    try {
        await qryDeleteIcsFeed(icsFeedId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'ics-feeds/delete', e);
    }
}
