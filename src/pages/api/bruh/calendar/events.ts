import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetIcsFeedList, qryGetMealPlansInRange } from '@/utils/adminQueries';
import { fetchAllIcsFeedEvents, type UnifiedEvent } from '@/utils/icsEvents';
import { handleServerError } from '@/utils/apiErrors';

// Public endpoint (not under admin middleware) — anyone hitting /bruh/calendar
// can pull events. Aggregates meal_plans + all active ICS feed events.
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
        const [mealPlans, feeds] = await Promise.all([
            qryGetMealPlansInRange(from, to),
            qryGetIcsFeedList(),
        ]);

        // Parse from/to as Date at midnight — ICS parser needs Date objects.
        const fromDate = new Date(`${from}T00:00:00`);
        // Use end-of-day for `to` so events on the last day still count.
        const toDate = new Date(`${to}T23:59:59.999`);

        const icsEvents = await fetchAllIcsFeedEvents(feeds, fromDate, toDate);

        const mealEvents: UnifiedEvent[] = mealPlans.map((mp) => ({
            id: `meal-plan-${mp.mealPlansId}`,
            title: mp.mealName,
            start: mp.date,
            allDay: true,
            classNames: ['fc-event-meal'],
            extendedProps: {
                source: 'meal-plan',
                mealPlansId: mp.mealPlansId,
                mealId: mp.mealId,
                slot: mp.slot,
            },
        }));

        // Never cache — feeds change, meal plans change.
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, data: [...mealEvents, ...icsEvents] });
    } catch (e) {
        handleServerError(res, 'calendar/events', e);
    }
}
