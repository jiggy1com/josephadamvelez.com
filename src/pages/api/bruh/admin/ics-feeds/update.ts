import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateIcsFeed } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

function isValidUrl(value: string): boolean {
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'webcal:';
    } catch {
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const icsFeedId = Number(req.body?.icsFeedId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const color = typeof req.body?.color === 'string' && req.body.color.trim()
        ? req.body.color.trim()
        : null;
    const active = Boolean(req.body?.active);

    if (!icsFeedId) {
        return res.status(400).json({ success: false, error: 'icsFeedId is required' });
    }
    if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
    }
    if (!url) {
        return res.status(400).json({ success: false, error: 'url is required' });
    }
    if (!isValidUrl(url)) {
        return res
            .status(400)
            .json({ success: false, error: 'url must be a valid http, https, or webcal URL' });
    }

    try {
        const data = await qryUpdateIcsFeed(icsFeedId, name, url, color, active);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'ics-feeds/update', e);
    }
}
