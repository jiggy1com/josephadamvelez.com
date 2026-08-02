import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddOrRemoveProfilesTasks } from '@/utils/adminQueries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const profilesId = Number(req.body?.profilesId);
    const tasksId = Number(req.body?.tasksId);
    const active = Boolean(req.body?.active);

    if (!profilesId || !tasksId) {
        return res
            .status(400)
            .json({ success: false, error: 'profilesId and tasksId are required' });
    }

    try {
        await qryAddOrRemoveProfilesTasks(profilesId, tasksId, active);
        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
