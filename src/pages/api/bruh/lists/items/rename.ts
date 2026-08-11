import type { NextApiRequest, NextApiResponse } from 'next';
import { qryRenameListItem } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const listItemsId = Number(req.body?.listItemsId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!listItemsId) {
        return res.status(400).json({ success: false, error: 'listItemsId is required' });
    }
    if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
    }
    try {
        const data = await qryRenameListItem(listItemsId, name);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'lists/items/rename', e);
    }
}
