import type { NextApiRequest, NextApiResponse } from 'next';
import {
    qryGetProfileByForgotPasswordToken,
    qryResetPasswordByToken,
} from '@/utils/adminQueries';
import { generateSalt, hashPassword, validatePassword } from '@/utils/password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!token) {
        return res.status(400).json({ success: false, error: 'token is required' });
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
        const profile = await qryGetProfileByForgotPasswordToken(token);
        if (!profile) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }

        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        await qryResetPasswordByToken(token, passwordHash, salt);

        return res.status(200).json({ success: true });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ success: false, error });
    }
}
