import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetDeviceHistory } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// GET /api/bruh/devices/history?deviceId=<uuid>&date=YYYY-MM-DD
// Returns the device+profile meta and all pings on that local date.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const deviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId.trim() : '';
    const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';

    if (!deviceId) {
        return res.status(400).json({ success: false, error: 'deviceId is required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res
            .status(400)
            .json({ success: false, error: 'date must be YYYY-MM-DD' });
    }

    try {
        const data = await qryGetDeviceHistory(deviceId, date);
        if (!data) {
            return res.status(404).json({ success: false, error: 'Device not found' });
        }
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'devices/history', e);
    }
}
