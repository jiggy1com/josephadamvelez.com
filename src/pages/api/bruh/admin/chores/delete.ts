import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteChore } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const choreid = Number(req.body?.choreid);
    if (!choreid) {
        return res.status(400).json({ success: false, error: 'choreid is required' });
    }

    try {
        await qryDeleteChore(choreid);
        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ success: false, error: 'Failed to delete chore' });
    }
}
