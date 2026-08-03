import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddListItem, qryGetListById } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';
import { getSessionFromReq } from '@/utils/auth';

// Public — anyone can add to a public list. If the caller is authenticated we
// attribute the addition to their profile.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const listsId = Number(req.body?.listsId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!listsId) {
        return res.status(400).json({ success: false, error: 'listsId is required' });
    }
    if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
    }
    try {
        const list = await qryGetListById(listsId);
        if (!list || !list.isPublic) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }
        const session = await getSessionFromReq(req);
        const addedBy = session?.profilesId ?? null;
        const data = await qryAddListItem(listsId, name, addedBy);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'lists/items/add', e);
    }
}
