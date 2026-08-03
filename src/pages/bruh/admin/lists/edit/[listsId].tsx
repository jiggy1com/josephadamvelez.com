import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { Toggle } from '@/components/toggle/Toggle';
import { qryGetListById } from '@/utils/adminQueries';
import type { ListRow } from '@/utils/adminQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Props = { list: ListRow };

type Payload = {
    listsId: number;
    name: string;
    color: string;
    isPublic: boolean;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const listsId = Number(ctx.params?.listsId);
    if (!listsId) return { notFound: true };
    const list = await qryGetListById(listsId);
    if (!list) return { notFound: true };
    return { props: { list } };
};

export default function BruhAdminListsEdit({ list }: Props) {
    const router = useRouter();
    const [name, setName] = useState(list.name);
    const [color, setColor] = useState(list.color ?? '#d4a017');
    const [isPublic, setIsPublic] = useState(list.isPublic);

    const { submit, submitting, alert } = useFormSubmit<Payload>(
        '/api/bruh/admin/lists/update',
        {
            successMessage: 'List updated',
            onSuccess: () => {
                setTimeout(() => {
                    void router.push('/bruh/admin/lists/list');
                }, 1000);
            },
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ listsId: list.listsId, name, color, isPublic });
    };

    return (
        <>
            <Section id={'bruh-admin-lists-edit'} className={'admin-section'}>
                <h1>Edit List</h1>
            </Section>
            <Section id={'bruh-admin-lists-edit-form'} className={'admin-section'}>
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
