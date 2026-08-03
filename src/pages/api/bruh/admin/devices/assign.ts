import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAssignDeviceToProfile } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const devicesId = typeof req.body?.devicesId === 'string' ? req.body.devicesId.trim() : '';
    if (!devicesId) {
        return res.status(400).json({ success: false, error: 'devicesId is required' });
    }

    // profilesId may be null (unassign) or a positive integer.
    const raw = req.body?.profilesId;
    let profilesId: number | null;
    if (raw === null || raw === undefined || raw === '') {
        profilesId = null;
    } else {
        const n = Number(raw);
        if (!Number.isInteger(n) || n <= 0) {
            return res
                .status(400)
                .json({ success: false, error: 'profilesId must be a positive integer or null' });
        }
        profilesId = n;
    }

    try {
        await qryAssignDeviceToProfile(devicesId, profilesId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'devices/assign', e);
    }
}
