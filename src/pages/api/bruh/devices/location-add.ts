import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddDeviceLocation, qryUpsertDevice } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body ?? {};
    const deviceId = typeof body.device_id === 'string' ? body.device_id.trim() : '';
    if (!deviceId) {
        return res.status(400).json({ success: false, error: 'device_id is required' });
    }

    try {
        // Register (or refresh metadata for) the device before recording its location.
        // Mobile app is a passive beacon — it never calls a separate "register" endpoint.
        await qryUpsertDevice(
            deviceId,
            typeof body.device_name === 'string' ? body.device_name : null,
            typeof body.platform === 'string' ? body.platform : null,
        );
        await qryAddDeviceLocation(body);
        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error, body });
    }
}
