import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteList } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const listsId = Number(req.body?.listsId);
    if (!listsId) {
        return res.status(400).json({ success: false, error: 'listsId is required' });
    }

    try {
        await qryDeleteList(listsId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'admin/lists/delete', e);
    }
}
