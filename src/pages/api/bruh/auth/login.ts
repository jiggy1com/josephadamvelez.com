import type { NextApiRequest, NextApiResponse } from 'next';
import { qryGetProfileForAuth } from '@/utils/adminQueries';
import { verifyPassword } from '@/utils/password';
import { setSessionCookie, signSession } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, error: 'username and password are required' });
    }

    try {
        const profile = await qryGetProfileForAuth(username);
        // Same generic error whether the user doesn't exist OR the password is wrong.
        // Never leak which one — enumeration attacks otherwise.
        if (!profile || !profile.passwordHash || !profile.salt) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        if (!verifyPassword(password, profile.salt, profile.passwordHash)) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const role: 'child' | 'parent' | 'household' = profile.isHousehold
            ? 'household'
            : profile.isParent
              ? 'parent'
              : 'child';
        const token = await signSession({
            profilesId: profile.profilesId,
            username: profile.username ?? '',
            name: profile.name,
            role,
            isAdmin: profile.isAdmin,
        });
        setSessionCookie(res, token);
        return res.status(200).json({
            success: true,
            user: {
                profilesId: profile.profilesId,
                username: profile.username,
                name: profile.name,
                role,
                isAdmin: profile.isAdmin,
            },
        });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
