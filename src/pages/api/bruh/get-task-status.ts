import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Kids-facing: only show tasks whose days_of_week includes today.
        const data = await qryGetProfilesTasksByProfileGrouped(true);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
