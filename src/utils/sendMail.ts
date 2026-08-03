// @ts-expect-error nodemailer types not always resolved by the IDE
import nodemailer from 'nodemailer';
import { MailObject } from '@/services/ApiService';

type SendMailInput = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

export async function sendMail({ to, subject, text, html }: SendMailInput): Promise<void> {
    const mailObject = new MailObject();

    const transporter = nodemailer.createTransport({
        host: mailObject.smtpHost,
        port: mailObject.smtpPort,
        secure: false,
        auth: {
            user: mailObject.smtpUser,
            pass: mailObject.smtpPass,
        },
    });

    await transporter.sendMail({
        from: mailObject.smtpUser,
        to,
        subject,
        text,
        html,
    });
}
