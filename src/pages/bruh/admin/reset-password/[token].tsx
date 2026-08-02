import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { qryGetProfileByForgotPasswordToken } from '@/utils/adminQueries';
import { validatePassword } from '@/utils/password';

type Props = { valid: true; token: string; name: string } | { valid: false };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const token = typeof ctx.params?.token === 'string' ? ctx.params.token : '';
    if (!token) return { props: { valid: false } };

    const profile = await qryGetProfileByForgotPasswordToken(token);
    if (!profile) return { props: { valid: false } };

    return { props: { valid: true, token, name: profile.name } };
};

export default function BruhAdminResetPassword(props: Props) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    if (!props.valid) {
        return (
            <>
                <BruhNav />
                <Section id={'bruh-admin-reset-password-invalid'} className={'admin-section'}>
                    <h1>Access denied</h1>
                </Section>
                <Section id={'bruh-admin-reset-password-invalid-form'} className={'admin-section'}>
                    <p>This password reset link is invalid or has already been used.</p>
                    <p>
                        <Link href={'/bruh/admin/forgot-password'} className={'button'}>
                            Request a new link
                        </Link>
                    </p>
                </Section>
            </>
        );
    }

    const passwordCheck = validatePassword(password);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting || !passwordCheck.valid) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/bruh/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: props.token, password }),
            });
            const json = await res.json();
            if (json.success) {
                setAlert({ success: true, message: 'Password reset. Redirecting to sign in...' });
                setTimeout(() => void router.replace('/bruh/admin'), 1200);
            } else {
                setAlert({ success: false, message: json.error ?? 'Reset failed' });
                setSubmitting(false);
            }
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            setAlert({ success: false, message: error });
            setSubmitting(false);
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-reset-password'} className={'admin-section'}>
                <h1>Reset password for {props.name}</h1>
            </Section>
            <Section id={'bruh-admin-reset-password-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'password'}
                            type={'password'}
                            value={password}
                            placeholder={'New password'}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={'new-password'}
                            required
                        />
                        {password.length > 0 && !passwordCheck.valid && (
                            <ul style={{ marginBottom: '10px', paddingLeft: '20px' }}>
                                {passwordCheck.errors.map((err) => (
                                    <li key={err} style={{ color: 'salmon' }}>
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'submit'}
                            className={'button'}
                            disabled={submitting || !passwordCheck.valid}>
                            Set new password
                        </button>
                    </div>
                </form>
            </Section>
        </>
    );
}
