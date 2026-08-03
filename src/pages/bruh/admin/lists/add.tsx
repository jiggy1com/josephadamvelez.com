import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Payload = { name: string; color: string; isPublic: boolean };

export default function BruhAdminListsAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#d4a017'); // default: gold (--color-secondary)
    const [isPublic, setIsPublic] = useState(true);

    const { submit, submitting, alert } = useFormSubmit<Payload>(
        '/api/bruh/admin/lists/add',
        {
            successMessage: () => `Added "${name}"`,
            onSuccess: () => {
                setName('');
                setColor('#d4a017');
                setIsPublic(true);
            },
            autoClearMs: 1500,
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ name, color, isPublic });
    };

    return (
        <>
            <Section id={'bruh-admin-lists-add'} className={'admin-section'}>
                <h1>Add List</h1>
            </Section>
            <Section id={'bruh-admin-lists-add-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            placeholder={'Name (e.g., Grocery, Honey-Do)'}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            margin: '10px 0 20px',
                        }}>
                        <label
                            htmlFor={'color'}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Color</span>
                            <input
                                id={'color'}
                                type={'color'}
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                }}
                            />
                        </label>
                        <Toggle
                            checked={isPublic}
                            onChange={setIsPublic}
                            label={'Public (kids can see)'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'button'}
                            className={'button'}
                            onClick={() => void router.push('/bruh/admin/lists/list')}>
                            Cancel
                        </button>
                        <button type={'submit'} className={'button'} disabled={submitting}>
                            Save
                        </button>
                    </div>
                </form>
            </Section>
        </>
    );
}
