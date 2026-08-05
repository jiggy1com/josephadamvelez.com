import type { NextApiRequest, NextApiResponse } from 'next';
import { qryHasHouseholdProfile } from '@/utils/adminQueries';
import { handleServerError } from '@/utils/apiErrors';

// Public — /bruh's landing page hits this to decide onboarding vs. login.
// Just a boolean; leaks no PII.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const householdExists = await qryHasHouseholdProfile();
        return res.status(200).json({ success: true, householdExists });
    } catch (e) {
        handleServerError(res, 'auth/onboarding-status', e);
    }
}
