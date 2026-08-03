import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { qryGetIcsFeedById } from '@/utils/adminQueries';
import type { IcsFeed } from '@/utils/adminQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Props = { feed: IcsFeed };

type Payload = {
    icsFeedId: number;
    name: string;
    url: string;
    color: string;
    active: boolean;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const icsFeedId = Number(ctx.params?.icsFeedId);
    if (!icsFeedId) return { notFound: true };
    const feed = await qryGetIcsFeedById(icsFeedId);
    if (!feed) return { notFound: true };
    return { props: { feed } };
};

export default function BruhAdminIcsFeedsEdit({ feed }: Props) {
    const router = useRouter();
    const [name, setName] = useState(feed.name);
    const [url, setUrl] = useState(feed.url);
    const [color, setColor] = useState(feed.color ?? '#008080');
    const [active, setActive] = useState(feed.active);

    const { submit, submitting, alert } = useFormSubmit<Payload>(
        '/api/bruh/admin/ics-feeds/update',
        {
            successMessage: 'Calendar updated',
            onSuccess: () => {
                setTimeout(() => {
                    void router.push('/bruh/admin/ics-feeds/list');
                }, 1000);
            },
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ icsFeedId: feed.icsFeedId, name, url, color, active });
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-ics-feeds-edit'} className={'admin-section'}>
                <h1>Edit Calendar</h1>
            </Section>
            <Section id={'bruh-admin-ics-feeds-edit-form'} className={'admin-section'}>
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
