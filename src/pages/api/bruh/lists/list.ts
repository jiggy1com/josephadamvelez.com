import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetPublicListsWithCounts } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Public — only returns is_public = true lists, with item counts.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const data = await qryGetPublicListsWithCounts();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'lists/list', e);
    }
}
