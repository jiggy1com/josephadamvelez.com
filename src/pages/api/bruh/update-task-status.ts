import type { NextApiRequest, NextApiResponse } from 'next';
import { updateTaskStatus } from '@/utils/userQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const profilesTasksId = Number(req.body?.profilesTasksId);
    const completed = Boolean(req.body?.completed);

    if (!profilesTasksId) {
        return res
            .status(400)
            .json({ success: false, error: 'profilesTasksId is required' });
    }

    try {
        await updateTaskStatus(profilesTasksId, completed);
        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
