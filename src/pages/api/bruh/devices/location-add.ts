import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddDeviceLocation } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        let data;
        try {
            data = await qryAddDeviceLocation(req.body);
        } catch (e) {
            return res
                .status(500)
                .json({ success: false, error: 'Failed to save location', e, body: req.body });
        }
        return res.status(200).json({ success: true, data });
    }

    if (req.method === 'GET') {
        return res.status(405).json({ message: 'not allowed' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
