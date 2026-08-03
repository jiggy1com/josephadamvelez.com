import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateTask, DAYS_OF_WEEK, type DayOfWeek } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

function sanitizeDays(input: unknown): DayOfWeek[] | null {
    if (!Array.isArray(input)) return null;
    const valid = input.filter(
        (d): d is DayOfWeek =>
            typeof d === 'string' && (DAYS_OF_WEEK as readonly string[]).includes(d),
    );
    return valid.length === 0 ? null : valid;
}

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
    const daysOfWeek = sanitizeDays(req.body?.daysOfWeek);

    try {
        const data = await qryUpdateTask(tasksId, name, daysOfWeek);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'tasks/update', e);
    }
}
