import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';

export default function BruhAdminForgotPassword() {
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/bruh/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const json = await res.json();
            // Server always returns the same generic message either way (anti-enumeration).
            setAlert({ success: true, message: json.message ?? 'Request received.' });
            setUsername('');
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            setAlert({ success: false, message: error });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Section id={'bruh-admin-forgot-password'} className={'admin-section'}>
                <h1>Forgot Password</h1>
            </Section>
            <Section id={'bruh-admin-forgot-password-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'username'}
                            type={'text'}
                            value={username}
                            placeholder={'Username'}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            autoComplete={'username'}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <Link href={'/bruh/admin'} className={'button'}>
                            Cancel
                        </Link>
                        <button type={'submit'} className={'button'} disabled={submitting}>
                            Send reset email
                        </button>
                    </div>
                </form>
            </Section>
        </>
    );
}
