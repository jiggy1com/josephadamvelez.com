import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { SegmentedControl } from '@/components/segmented-control/SegmentedControl';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { validatePassword } from '@/utils/password';

type Role = 'child' | 'parent';

type AddProfilePayload = {
    name: string;
    email: string;
    username: string;
    password: string;
    isChild: boolean;
    isParent: boolean;
    isAdmin: boolean;
};

export default function BruhAdminProfilesAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const passwordCheck = validatePassword(password);
    const canSubmit = passwordCheck.valid && role !== null;

    const { submit, submitting, alert } = useFormSubmit<AddProfilePayload>(
        '/api/bruh/admin/profiles/add',
        {
            successMessage: () => `Added "${name}"`,
            onSuccess: () => {
                setName('');
                setEmail('');
                setUsername('');
                setPassword('');
                setRole(null);
                setIsAdmin(false);
            },
            autoClearMs: 1500,
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        await submit({
            name,
            email,
            username,
            password,
            isChild: role === 'child',
            isParent: role === 'parent',
            isAdmin,
        });
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-profiles-add'} className={'admin-section'}>
                <h1>Add Profile</h1>
            </Section>
            <Section id={'bruh-admin-profiles-add-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            placeholder={'Name'}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            id={'email'}
                            type={'email'}
                            value={email}
                            placeholder={'Email'}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            autoComplete={'off'}
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
                            autoComplete={'off'}
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
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', margin: '10px 0 20px' }}>
                        <div>
                            <div style={{ marginBottom: '5px', fontSize: '0.9em' }}>Role</div>
                            <SegmentedControl<Role>
                                ariaLabel={'Role'}
                                value={role}
                                onChange={setRole}
                                options={[
                                    { value: 'child', label: 'Child' },
                                    { value: 'parent', label: 'Parent' },
                                ]}
                            />
                        </div>
                        <Toggle checked={isAdmin} onChange={setIsAdmin} label={'Admin'} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'button'}
                            className={'button'}
                            onClick={() => void router.push('/bruh/admin/profiles/list')}>
                            Cancel
                        </button>
                        <button
                            type={'submit'}
                            className={'button'}
                            disabled={submitting || !canSubmit}>
                            Save
                        </button>
                    </div>
                    {!canSubmit && !submitting && (
                        <p style={{ color: 'salmon', fontSize: '0.9em', marginTop: '10px' }}>
                            {role === null
                                ? 'Select a role (Child or Parent) to continue.'
                                : password.length === 0
                                  ? 'Enter a password to continue.'
                                  : 'Password does not meet all requirements.'}
                        </p>
                    )}
                </form>
            </Section>
        </>
    );
}
