import type { NextApiRequest, NextApiResponse } from 'next';
import {
    qryGetProfileById,
    qryUpdateHouseholdProfile,
    qryUpdateProfile,
} from '@/utils/adminQueries';
import { generateSalt, hashPassword, validatePassword, validateUsername } from '@/utils/password';
import { handleServerError } from '@/utils/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const profilesId = Number(req.body?.profilesId);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!profilesId || !name) {
        return res
            .status(400)
            .json({ success: false, error: 'profilesId and name are required' });
    }
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

    // Password only changes when the admin provides a new one. Empty means "leave alone."
    let passwordHash: string | undefined;
    let salt: string | undefined;
    if (password) {
        const { valid, errors } = validatePassword(password);
        if (!valid) {
            return res
                .status(400)
                .json({ success: false, error: `Password requirements: ${errors.join('; ')}` });
        }
        salt = generateSalt();
        passwordHash = hashPassword(password, salt);
    }

    try {
        // Household profiles have a restricted update surface — role toggles,
        // isAdmin, and color are all frozen. Silently drop those fields even
        // if the caller sends them.
        const existing = await qryGetProfileById(profilesId);
        if (existing?.isHousehold) {
            const data = await qryUpdateHouseholdProfile(
                profilesId,
                { name, email, username },
                passwordHash,
                salt,
            );
            return res.status(200).json({ success: true, data });
        }

        // Regular profile — enforce role + color validation the standard way.
        const isChild = Boolean(req.body?.isChild);
        const isParent = Boolean(req.body?.isParent);
        const isAdmin = Boolean(req.body?.isAdmin);
        const rawColor = typeof req.body?.color === 'string' ? req.body.color.trim() : '';
        const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : null;
        if (isChild === isParent) {
            return res
                .status(400)
                .json({ success: false, error: 'Must be exactly one of child or parent' });
        }

        const data = await qryUpdateProfile(
            profilesId,
            {
                name,
                email,
                username,
                isChild,
                isParent,
                isAdmin,
                color,
            },
            passwordHash,
            salt,
        );
        return res.status(200).json({ success: true, data });
    } catch (e) {
        handleServerError(res, 'profiles/update', e);
    }
}
