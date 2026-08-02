import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateTask } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const tasksId = Number(req.body?.tasksId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!tasksId || !name) {
        return res
            .status(400)
            .json({ success: false, error: 'tasksId and name are required' });
    }

    try {
        const data = await qryUpdateTask(tasksId, name);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
