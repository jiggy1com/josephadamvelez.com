import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';

export default function BruhAdminChoresAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const res = await fetch('/api/bruh/admin/chores/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: 'Chore added' });
            setTimeout(() => {
                void router.push('/bruh/admin/chores/list');
            }, 1000);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to add chore' });
            setSubmitting(false);
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-chores-add'} className={'admin-section'}>
                <h1>Add Chore</h1>
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
