import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetActiveProfilesTasksLinks } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Returns the flat set of active (profilesId, tasksId) links. Used by the matrix
// view to build a lookup Set on the client without pulling joined task metadata.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const data = await qryGetActiveProfilesTasksLinks();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'admin/profiles-tasks/list', e);
    }
}
