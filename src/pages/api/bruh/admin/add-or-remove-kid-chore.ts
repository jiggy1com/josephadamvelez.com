import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddOrRemoveKidChore } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(405).json({ message: 'not allowed' });
    }

    if (req.method === 'POST') {
        let data;
        try {
            data = await qryAddOrRemoveKidChore(req.body.kidid, req.body.choreid, req.body.active);
        } catch (e) {
            return res
                .status(500)
                .json({ success: false, error: 'Failed to update admin kid chore status' });
        }
        return res.status(200).json({
            success: true,
            data,
            debug: req.body,
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
