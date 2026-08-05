import type { NextApiRequest, NextApiResponse } from 'next';
import {
    qryAddHouseholdProfile,
    qryGetProfileForAuth,
    qryHasHouseholdProfile,
} from '@/utils/adminQueries';
import { generateSalt, hashPassword, validatePassword, validateUsername } from '@/utils/password';
import { signSession, setSessionCookie } from '@/utils/auth';
import { handleServerError } from '@/utils/apiErrors';

// First-time setup: creates the single "household" viewer profile that the wall
// kiosk (and any other family member who wants to sign in as the shared viewer)
// uses. Only reachable while no household profile exists — subsequent hits get
// rejected. On success, immediately signs the caller in.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email) {
        return res.status(400).json({ success: false, error: 'email is required' });
    }
    if (!username) {
        return res.status(400).json({ success: false, error: 'username is required' });
    }
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.valid) {
        return res
            .status(400)
            .json({ success: false, error: `Username: ${usernameCheck.errors.join('; ')}` });
    }
    if (!password) {
        return res.status(400).json({ success: false, error: 'password is required' });
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        return res
            .status(400)
            .json({ success: false, error: `Password: ${passwordCheck.errors.join('; ')}` });
    }

    try {
        // Enforce the single-household invariant. The DB partial unique index enforces
        // it too, but a friendly error is nicer than a 500 from the constraint violation.
        if (await qryHasHouseholdProfile()) {
            return res
                .status(409)
                .json({ success: false, error: 'Household is already set up' });
        }

        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        await qryAddHouseholdProfile(
            {
                // Onboarding form doesn't collect a display name; default to "Household".
                // Editable later via the admin edit form (limited-scope household variant).
                name: 'Household',
                email,
                username,
            },
            passwordHash,
            salt,
        );

        // Sign the caller straight in so they don't have to re-type the credentials.
        const profile = await qryGetProfileForAuth(username);
        if (!profile) {
            return res.status(500).json({ success: false, error: 'Profile lookup failed' });
        }
        const token = await signSession({
            profilesId: profile.profilesId,
            username: profile.username ?? '',
            name: profile.name,
            role: 'household',
            isAdmin: false,
        });
        setSessionCookie(res, token);

        return res.status(200).json({
            success: true,
            user: {
                profilesId: profile.profilesId,
                username: profile.username,
                name: profile.name,
                role: 'household',
                isAdmin: false,
            },
        });
    } catch (e) {
        handleServerError(res, 'auth/onboarding', e);
    }
}
