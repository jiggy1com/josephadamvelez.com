import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteListItem } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const listItemsId = Number(req.body?.listItemsId);
    if (!listItemsId) {
        return res.status(400).json({ success: false, error: 'listItemsId is required' });
    }
    try {
        await qryDeleteListItem(listItemsId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'lists/items/delete', e);
    }
}
