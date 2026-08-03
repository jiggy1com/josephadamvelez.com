import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteTask } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const tasksId = Number(req.body?.tasksId);
    if (!tasksId) {
        return res.status(400).json({ success: false, error: 'tasksId is required' });
    }

    try {
        await qryDeleteTask(tasksId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'tasks/delete', e);
    }
}
