import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { SegmentedControl } from '@/components/segmented-control/SegmentedControl';
import { ColorPicker } from '@/components/color-picker/ColorPicker';
import { qryGetProfileById } from '@/utils/adminQueries';
import type { Profile } from '@/utils/adminQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { validatePassword } from '@/utils/password';

type Role = 'child' | 'parent';

type Props = { profile: Profile };

type UpdateProfilePayload = {
    profilesId: number;
    name: string;
    email: string;
    username: string;
    password: string;
    isChild: boolean;
    isParent: boolean;
    isAdmin: boolean;
    color: string | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const profilesId = Number(ctx.params?.profilesId);
    if (!profilesId) return { notFound: true };
    const profile = await qryGetProfileById(profilesId);
    if (!profile) return { notFound: true };
    return { props: { profile } };
};

export default function BruhAdminProfilesEdit({ profile }: Props) {
    const router = useRouter();
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email ?? '');
    const [username, setUsername] = useState(profile.username ?? '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role | null>(
        profile.isChild ? 'child' : profile.isParent ? 'parent' : null,
    );
    const [isAdmin, setIsAdmin] = useState(profile.isAdmin);
    const [color, setColor] = useState<string | null>(profile.color);

    const passwordCheck = validatePassword(password);
    // Password is optional on edit — only validate if the admin actually typed something.
    const passwordOk = password.length === 0 || passwordCheck.valid;
    const canSubmit = passwordOk && role !== null;

    const { submit, submitting, alert } = useFormSubmit<UpdateProfilePayload>(
        '/api/bruh/admin/profiles/update',
        {
            successMessage: 'Profile updated',
            onSuccess: () => {
                setTimeout(() => {
                    void router.push('/bruh/admin/profiles/list');
                }, 1000);
            },
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        await submit({
            profilesId: profile.profilesId,
            name,
            email,
            username,
            password,
            isChild: role === 'child',
            isParent: role === 'parent',
            isAdmin,
            color,
        });
    };

    return (
        <>
            <Section id={'bruh-admin-profiles-edit'} className={'admin-section'}>
                <h1>Edit Profile</h1>
            </Section>
            <Section id={'bruh-admin-profiles-edit-form'} className={'admin-section'}>
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
                            placeholder={'Leave blank to keep current password'}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={'new-password'}
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
                        <SegmentedControl<Role>
                            ariaLabel={'Role'}
                            value={role}
                            onChange={setRole}
                            options={[
                                { value: 'child', label: 'Child' },
                                { value: 'parent', label: 'Parent' },
                            ]}
                        />
                        <Toggle checked={isAdmin} onChange={setIsAdmin} label={'Admin'} />
                    </div>
                    <div style={{ margin: '10px 0 20px' }}>
                        <div style={{ marginBottom: '5px', fontSize: '0.9em' }}>Color</div>
                        <ColorPicker value={color} onChange={setColor} />
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
                </form>
            </Section>
        </>
    );
}
