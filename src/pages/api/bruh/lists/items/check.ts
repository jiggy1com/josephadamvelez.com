import type { NextApiRequest, NextApiResponse } from 'next';
import { qryToggleListItemChecked } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const listItemsId = Number(req.body?.listItemsId);
    const checked = Boolean(req.body?.checked);
    if (!listItemsId) {
        return res.status(400).json({ success: false, error: 'listItemsId is required' });
    }
    try {
        const data = await qryToggleListItemChecked(listItemsId, checked);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'lists/items/check', e);
    }
}
