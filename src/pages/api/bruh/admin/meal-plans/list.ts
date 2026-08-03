import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetMealPlansInRange } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Matches YYYY-MM-DD — strict enough to reject anything the DB will choke on
// and clear enough that the client can produce it via toISOString().slice(0, 10).
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const from = typeof req.query.from === 'string' ? req.query.from : '';
    const to = typeof req.query.to === 'string' ? req.query.to : '';

    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        return res
            .status(400)
            .json({ success: false, error: 'from and to must be YYYY-MM-DD dates' });
    }

    try {
        const data = await qryGetMealPlansInRange(from, to);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'meal-plans/list', e);
    }
}
