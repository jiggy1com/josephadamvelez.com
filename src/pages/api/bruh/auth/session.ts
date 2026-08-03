import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromReq } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getSessionFromReq(req);
    // Session must never be cached — a stale response can persist a logged-out user
    // reading logged-in nav (or the reverse) until the browser evicts it.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res.status(200).json({ success: true, user: session });
}
