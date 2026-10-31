import type { NextApiRequest, NextApiResponse } from 'next';
import { qrySetDeviceHidden } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const devicesId = typeof req.body?.devicesId === 'string' ? req.body.devicesId.trim() : '';
    if (!devicesId) {
        return res.status(400).json({ success: false, error: 'devicesId is required' });
    }
    if (typeof req.body?.hidden !== 'boolean') {
        return res.status(400).json({ success: false, error: 'hidden must be a boolean' });
    }

    try {
        await qrySetDeviceHidden(devicesId, req.body.hidden);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'devices/hide', e);
    }
}
