import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetKidChoreListByKidIdGrouped } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        let data;
        try {
            data = await qryGetKidChoreListByKidIdGrouped();
        } catch (e) {
            return res.status(500).json({ success: false, error: 'Failed to get chore status' });
        }
        return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
        return res.status(405).json({ message: 'not allowed' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
