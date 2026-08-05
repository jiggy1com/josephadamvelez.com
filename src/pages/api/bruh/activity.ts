import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetLocationEventsFeed } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// GET /api/bruh/activity?profilesId=&knownLocationsId=&since=&until=&limit=
// All filters optional. Returns most recent events first.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const profilesId = req.query.profilesId ? Number(req.query.profilesId) : undefined;
    const knownLocationsId = req.query.knownLocationsId
        ? Number(req.query.knownLocationsId)
        : undefined;
    const since = typeof req.query.since === 'string' ? req.query.since : undefined;
    const until = typeof req.query.until === 'string' ? req.query.until : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    // Sanity-check filter formats when present. Silently drop malformed ones
    // rather than 400 — a bad filter shouldn't kill the whole feed.
    const filter = {
        profilesId: profilesId && Number.isInteger(profilesId) ? profilesId : undefined,
        knownLocationsId:
            knownLocationsId && Number.isInteger(knownLocationsId) ? knownLocationsId : undefined,
        since: since && /^\d{4}-\d{2}-\d{2}$/.test(since) ? since : undefined,
        until: until && /^\d{4}-\d{2}-\d{2}$/.test(until) ? until : undefined,
        limit: limit && Number.isInteger(limit) ? limit : undefined,
    };

    try {
        const data = await qryGetLocationEventsFeed(filter);
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'activity', e);
    }
}
