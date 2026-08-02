// Simple [placeholder] substitution — replaces every `[key]` token in the string with the
// value from vars. Missing keys are left as-is so we can spot typos in dev.
export function renderTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\[(\w+)\]/g, (match, key: string) => {
        return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match;
    });
}

export const forgotPasswordEmailText = `Hi [name],

We received a request to reset the password on your Bruh Admin account.

Click the link below to set a new password:
[link]

If you didn't request this, you can ignore this email.
`;

export const forgotPasswordEmailHtml = `
<p>Hi [name],</p>
<p>We received a request to reset the password on your Bruh Admin account.</p>
<p>Click the link below to set a new password:</p>
<p><a href="[link]">[link]</a></p>
<p>If you didn't request this, you can ignore this email.</p>
`;

export const forgotPasswordEmailSubject = 'Reset your Bruh Admin password';
