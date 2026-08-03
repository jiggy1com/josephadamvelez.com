import type { NextApiRequest, NextApiResponse } from 'next';
import { qryRemoveAllProfilesTasks } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await qryRemoveAllProfilesTasks();
        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
