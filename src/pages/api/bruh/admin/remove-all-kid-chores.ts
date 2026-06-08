import type { NextApiRequest, NextApiResponse } from 'next';
import { qryRemoveAllKidChores } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        return res.status(405).json({ message: 'not allowed' });
    }

    if (req.method === 'GET') {
        let data;
        try {
            data = await qryRemoveAllKidChores();
        } catch (e) {
            return res
                .status(500)
                .json({
                    success: false,
                    error: 'Failed to remove all admin kid chore status',
                    debug: e,
                });
        }
        return res.status(200).json({
            success: true,
            data,
            debug: req.body,
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
