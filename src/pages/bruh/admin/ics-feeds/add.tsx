import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Payload = { name: string; url: string; color: string; active: boolean };

export default function BruhAdminIcsFeedsAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [color, setColor] = useState('#008080'); // default: teal (matches --color-primary)
    const [active, setActive] = useState(true);

    const { submit, submitting, alert } = useFormSubmit<Payload>(
        '/api/bruh/admin/ics-feeds/add',
        {
            successMessage: () => `Added "${name}"`,
            onSuccess: () => {
                setName('');
                setUrl('');
                setColor('#008080');
                setActive(true);
            },
            autoClearMs: 1500,
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ name, url, color, active });
    };

    return (
        <>
            <Section id={'bruh-admin-ics-feeds-add'} className={'admin-section'}>
                <h1>Add Calendar</h1>
            </Section>
            <Section id={'bruh-admin-ics-feeds-add-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            placeholder={'Name (e.g., Family Calendar)'}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            id={'url'}
                            type={'url'}
                            value={url}
                            placeholder={'ICS URL, ends in .ics (not the shareable HTML link)'}
                            onChange={(e) => setUrl(e.target.value)}
                            autoComplete={'off'}
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
                        <Toggle checked={active} onChange={setActive} label={'Active'} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'button'}
                            className={'button'}
                            onClick={() => void router.push('/bruh/admin/ics-feeds/list')}>
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
