import type { NextApiRequest, NextApiResponse } from 'next';
import { updateChoreStatus } from '@/utils/userQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return res.status(405).json({ message: 'not allowed' });
    }

    if (req.method === 'POST') {
        try {
            await updateChoreStatus(req.body.kidchoreid, req.body.completed);
        } catch (e) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update chore status',
                received: { ...req.body },
                sqlError: e instanceof Error ? e.message : 'Unknown error',
            });
        }
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
