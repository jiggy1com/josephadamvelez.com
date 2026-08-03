import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteMeal } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const mealId = Number(req.body?.mealId);
    if (!mealId) {
        return res.status(400).json({ success: false, error: 'mealId is required' });
    }

    try {
        await qryDeleteMeal(mealId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'meals/delete', e);
    }
}
