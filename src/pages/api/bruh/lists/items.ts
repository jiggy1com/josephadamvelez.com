import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetListById, qryGetListItems } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Public — returns items for a single list. Rejects private lists so a kids-facing
// caller can't sneak items out of admin-only lists by guessing the listsId.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const listsId = Number(req.query.listsId);
    if (!listsId) {
        return res.status(400).json({ success: false, error: 'listsId is required' });
    }
    try {
        const list = await qryGetListById(listsId);
        if (!list || !list.isPublic) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }
        const items = await qryGetListItems(listsId);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, list, items });
    } catch (e) {
        handleServerError(res, 'lists/items', e);
    }
}
