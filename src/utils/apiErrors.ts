import type { NextApiResponse } from 'next';

// Translates known SQL/DB errors into user-friendly messages. Anything unrecognized
// gets a generic "An error occurred" so we don't leak schema details to the client.
// The raw error is always logged server-side (surfaced in Vercel logs) so we can
// still diagnose issues.
export function handleServerError(
    res: NextApiResponse,
    context: string,
    e: unknown,
    status = 500,
): void {
    console.error(`[${context}]`, e);

    const raw = e instanceof Error ? e.message : String(e);

    // Postgres unique constraint violations — surface a friendly reason when we
    // can identify the offending column from the index name.
    if (/duplicate key/i.test(raw) || /unique constraint/i.test(raw)) {
        if (raw.includes('profiles_username_lower_idx')) {
            res.status(409).json({ success: false, error: 'That username is already taken' });
            return;
        }
        // Other unique violations — generic conflict message.
        res.status(409).json({ success: false, error: 'That value is already in use' });
        return;
    }

    res.status(status).json({ success: false, error: 'An error occurred' });
}
