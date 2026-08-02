import type { NextApiRequest, NextApiResponse } from 'next';
import { qryAddProfile } from '@/utils/adminQueries';
import { generateSalt, hashPassword, validatePassword, validateUsername } from '@/utils/password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const isChild = Boolean(req.body?.isChild);
    const isParent = Boolean(req.body?.isParent);
    const isAdmin = Boolean(req.body?.isAdmin);

    if (!name) {
        return res.status(400).json({ success: false, error: 'name is required' });
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
    if (isChild === isParent) {
        return res
            .status(400)
            .json({ success: false, error: 'Must be exactly one of child or parent' });
    }
    if (!password) {
        return res.status(400).json({ success: false, error: 'password is required' });
    }

    const { valid, errors } = validatePassword(password);
    if (!valid) {
        return res
            .status(400)
            .json({ success: false, error: `Password requirements: ${errors.join('; ')}` });
    }

    try {
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const data = await qryAddProfile(
            {
                name,
                email,
                username,
                isChild,
                isParent,
                isAdmin,
            },
            passwordHash,
            salt,
        );
        return res.status(200).json({ success: true, data });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
