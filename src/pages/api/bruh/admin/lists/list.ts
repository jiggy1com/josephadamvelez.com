import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetListList } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const data = await qryGetListList();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'admin/lists/list', e);
    }
}
