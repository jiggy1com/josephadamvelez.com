import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { useFormSubmit } from '@/hooks/useFormSubmit';

export default function BruhAdminMealsAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const { submit, submitting, alert } = useFormSubmit<{ name: string }>(
        '/api/bruh/admin/meals/add',
        {
            successMessage: () => `Added "${name}"`,
            onSuccess: () => setName(''),
            autoClearMs: 1500,
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ name });
    };

    return (
        <>
            <Section id={'bruh-admin-meals-add'} className={'admin-section'}>
                <h1>Add Meal</h1>
            </Section>
            <Section id={'bruh-admin-meals-add-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            placeholder={'Meal Name'}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type={'button'}
                            className={'button'}
                            onClick={() => void router.push('/bruh/admin/meals/list')}>
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
