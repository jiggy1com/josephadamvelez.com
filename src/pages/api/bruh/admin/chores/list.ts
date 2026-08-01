import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetChoreList } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await qryGetChoreList();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, error: 'Failed to load chores' });
    }
}
