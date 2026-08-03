import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { qrySetForgotPasswordToken } from '@/utils/adminQueries';
import { sendMail } from '@/utils/sendMail';
import {
    forgotPasswordEmailHtml,
    forgotPasswordEmailSubject,
    forgotPasswordEmailText,
    renderTemplate,
} from '@/utils/emailTemplates';

// Generic success payload — returned whether or not the username exists. Anti-enumeration.
const GENERIC_RESPONSE = {
    success: true,
    message: 'If we have that account on file, a password reset email has been sent.',
};

function getBaseUrl(req: NextApiRequest): string {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto =
        (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
        (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = req.headers.host;
    return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    if (!username) {
        return res.status(400).json({ success: false, error: 'username is required' });
    }

    try {
        const token = randomBytes(32).toString('hex');
        const profile = await qrySetForgotPasswordToken(username, token);

        // If no profile matched, we return the generic response anyway (no enumeration leak).
        // Same if the profile exists but has no email — we can't send anywhere.
        if (!profile || !profile.email) {
            return res.status(200).json(GENERIC_RESPONSE);
        }

        const link = `${getBaseUrl(req)}/bruh/admin/reset-password/${token}`;
        const vars = { name: profile.name, link };

        await sendMail({
            to: profile.email,
            subject: forgotPasswordEmailSubject,
            text: renderTemplate(forgotPasswordEmailText, vars),
            html: renderTemplate(forgotPasswordEmailHtml, vars),
        });

        return res.status(200).json(GENERIC_RESPONSE);
    } catch (e) {
        // Even on error, return the generic response — don't leak DB/email failures either.
        // (In dev you can inspect server logs for the real cause.)
        console.error('forgot-password error:', e);
        return res.status(200).json(GENERIC_RESPONSE);
    }
}
