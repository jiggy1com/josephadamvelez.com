import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpdateMeal } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const mealId = Number(req.body?.mealId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!mealId || !name) {
        return res.status(400).json({ success: false, error: 'mealId and name are required' });
    }

    try {
        const data = await qryUpdateMeal(mealId, name);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'meals/update', e);
    }
}
