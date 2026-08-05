import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { useSession } from '@/hooks/useSession';
import { validatePassword } from '@/utils/password';

type Props = {
    // Called after successful onboarding so the parent page can refresh session state.
    onCompleted: () => void;
};

// First-time setup form. Shown at /bruh when no household profile exists yet.
// Creates the shared "household" viewer profile and signs the caller in.
// Only three fields — the display name defaults to "Household" and can be
// edited later via the profile admin.
export function BruhOnboarding({ onCompleted }: Props) {
    const router = useRouter();
    const { refresh } = useSession();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const passwordCheck = validatePassword(password);
    const canSubmit = passwordCheck.valid && email.length > 0 && username.length > 0;

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting || !canSubmit) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/bruh/auth/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });
            const json = await res.json();
            if (!json.success) {
                setAlert({ success: false, message: json.error ?? 'Onboarding failed' });
                setSubmitting(false);
                return;
            }
            // Session cookie was set by the endpoint — pull the new session state in.
            await refresh();
            onCompleted();
            void router.replace('/bruh');
        } catch (e2) {
            setAlert({
                success: false,
                message: e2 instanceof Error ? e2.message : String(e2),
            });
            setSubmitting(false);
        }
    };

    return (
        <>
            <Section id={'bruh-onboarding'} className={'admin-section'}>
                <h1>Set up household</h1>
                <p style={{ opacity: 0.75, marginTop: 8 }}>
                    This creates the shared account used on the wall/kiosk device. Anyone
                    who signs in with these credentials sees the family dashboard, but not
                    the admin area.
                </p>
            </Section>
            <Section id={'bruh-onboarding-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'email'}
                            type={'email'}
                            value={email}
                            placeholder={'Email'}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            autoComplete={'email'}
                            required
                        />
                    </div>
                    <div>
                        <input
                            id={'username'}
                            type={'text'}
                            value={username}
                            placeholder={'Username'}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            autoComplete={'username'}
                            maxLength={30}
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
                            disabled={submitting || !canSubmit}>
                            Create household
                        </button>
                    </div>
                </form>
            </Section>
        </>
    );
}
