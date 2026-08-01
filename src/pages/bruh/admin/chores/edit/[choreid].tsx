import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { qryGetChoreById } from '@/utils/adminQueries';
import type { Chore } from '@/utils/adminQueries';

type Props = { chore: Chore };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const choreid = Number(ctx.params?.choreid);
    if (!choreid) return { notFound: true };
    const chore = await qryGetChoreById(choreid);
    if (!chore) return { notFound: true };
    return { props: { chore } };
};

export default function BruhAdminChoresEdit({ chore }: Props) {
    const router = useRouter();
    const [name, setName] = useState(chore.name);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const res = await fetch('/api/bruh/admin/chores/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choreid: chore.choreid, name }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: 'Chore updated' });
            setTimeout(() => {
                void router.push('/bruh/admin/chores/list');
            }, 1000);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to update chore' });
            setSubmitting(false);
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-chores-edit'} className={'admin-section'}>
                <h1>Edit Chore</h1>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <label htmlFor={'name'}>Name</label>
                    </div>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'button'}
                            className={'button'}
                            onClick={() => void router.push('/bruh/admin/chores/list')}>
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
