import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { useSession } from '@/hooks/useSession';

type Props = {
    onSignedIn: () => void;
};

export function BruhAdminLogin({ onSignedIn }: Props) {
    const router = useRouter();
    const { signIn } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const result = await signIn(username.toLowerCase(), password);
        if (result.success) {
            const next =
                typeof router.query.next === 'string' && router.query.next.startsWith('/')
                    ? router.query.next
                    : '/bruh/admin';
            onSignedIn();
            void router.replace(next);
        } else {
            setAlert({ success: false, message: result.error });
            setSubmitting(false);
        }
    };

    return (
        <>
            <Section id={'bruh-admin-login'} className={'admin-section'}>
                <h1>Sign in</h1>
            </Section>
            <Section id={'bruh-admin-login-form'} className={'admin-section'}>
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
                    <div>
                        <input
                            id={'password'}
                            type={'password'}
                            value={password}
                            placeholder={'Password'}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={'current-password'}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
                        <button type={'submit'} className={'button'} disabled={submitting}>
                            Sign in
                        </button>
                        <Link href={'/bruh/admin/forgot-password'}>Forgot password?</Link>
                    </div>
                </form>
            </Section>
        </>
    );
}
