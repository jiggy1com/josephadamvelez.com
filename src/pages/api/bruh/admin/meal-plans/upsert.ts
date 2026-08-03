import type { NextApiRequest, NextApiResponse } from 'next';
import { qryUpsertMealPlan, type MealSlot } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

function isValidSlot(v: unknown): v is MealSlot {
    return typeof v === 'string' && (VALID_SLOTS as string[]).includes(v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const mealId = Number(req.body?.mealId);
    const date = typeof req.body?.date === 'string' ? req.body.date : '';
    const slot = req.body?.slot;

    if (!mealId) {
        return res.status(400).json({ success: false, error: 'mealId is required' });
    }
    if (!DATE_RE.test(date)) {
        return res
            .status(400)
            .json({ success: false, error: 'date must be a YYYY-MM-DD date' });
    }
    if (!isValidSlot(slot)) {
        return res
            .status(400)
            .json({ success: false, error: `slot must be one of ${VALID_SLOTS.join(', ')}` });
    }

    try {
        const data = await qryUpsertMealPlan(mealId, date, slot);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'meal-plans/upsert', e);
    }
}
