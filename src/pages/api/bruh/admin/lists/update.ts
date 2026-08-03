import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateList } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const listsId = Number(req.body?.listsId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const color = typeof req.body?.color === 'string' && req.body.color.trim()
        ? req.body.color.trim()
        : null;
    const isPublic = Boolean(req.body?.isPublic);

    if (!listsId) {
        return res.status(400).json({ success: false, error: 'listsId is required' });
    }
    if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
    }

    try {
        const data = await qryUpdateList(listsId, name, color, isPublic);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'admin/lists/update', e);
    }
}
