import {IncomingMessage} from "node:http";

const nodemailer = require('nodemailer');
import {MailObject} from "@/services/ApiService";
import type {NextApiRequest, NextApiResponse} from "next";

type Envelope = {
    from: string,
    to: string[],
}

type SendMailResponse = {
    envelope: Envelope,
    messageId: string,
    response: string,
}

export default function Contact(req: NextApiRequest, res: NextApiResponse) {

    const body = req.body;
    const bodyKeys = body ? Object.keys(body) : [] as string[]
    const mailObject = new MailObject();

    let text = '';
    let html = '';

    bodyKeys.forEach((key: string) => {
        text = `${text} ${key}: ${(body as Record<string, any>)[key]}` + "\n\n";
        html = `${html}<p>${key}: ${(body as Record<string, any>)[key]}</p>`;
    });


    const mailOptions = {
        from: mailObject.smtpUser,
        to: mailObject.smtpTo,
        // cc: mailObject.smtpCC,
        subject: 'Contact Form from ' + (body?.email ?? 'unknown'),
        text: text,
        html: html,
    };

    const transporter = nodemailer.createTransport({
        host: mailObject.smtpHost,
        port: mailObject.smtpPort,
        secure: false, // secure:true for port 465, secure:false for port 587
        auth: {
            user: mailObject.smtpUser,
            pass: mailObject.smtpPass
        }
    });

    transporter.sendMail(mailOptions, function (err: Error, info: SendMailResponse) {
        if (err) {
            // reject(err);
            res.status(200).json({
                success: false,
                message: 'An error occurred.',
                err: err,
                form: req.body,
            })
        } else {
            const returnThis = {
                messageId: info.messageId,
                response: info.response
            };
            // resolve(returnThis);
            res.status(200).json({
                success: true,
                message: 'Message sent!',
                form: req.body,
                info: returnThis,
            })
        }
    });

}