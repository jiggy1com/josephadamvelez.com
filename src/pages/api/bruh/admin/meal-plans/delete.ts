import type { NextApiRequest, NextApiResponse } from 'next';
import { qryDeleteMealPlan } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const mealPlansId = Number(req.body?.mealPlansId);
    if (!mealPlansId) {
        return res.status(400).json({ success: false, error: 'mealPlansId is required' });
    }

    try {
        await qryDeleteMealPlan(mealPlansId);
        return res.status(200).json({ success: true });
    } catch (e) {
        handleServerError(res, 'meal-plans/delete', e);
    }
}
