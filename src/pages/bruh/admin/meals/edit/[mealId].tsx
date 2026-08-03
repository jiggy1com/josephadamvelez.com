import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { qryGetMealById } from '@/utils/adminQueries';
import type { Meal } from '@/utils/adminQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Props = { meal: Meal };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const mealId = Number(ctx.params?.mealId);
    if (!mealId) return { notFound: true };
    const meal = await qryGetMealById(mealId);
    if (!meal) return { notFound: true };
    return { props: { meal } };
};

export default function BruhAdminMealsEdit({ meal }: Props) {
    const router = useRouter();
    const [name, setName] = useState(meal.name);
    const { submit, submitting, alert } = useFormSubmit<{ mealId: number; name: string }>(
        '/api/bruh/admin/meals/update',
        {
            successMessage: 'Meal updated',
            onSuccess: () => {
                setTimeout(() => {
                    void router.push('/bruh/admin/meals/list');
                }, 1000);
            },
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ mealId: meal.mealId, name });
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-meals-edit'} className={'admin-section'}>
                <h1>Edit Meal</h1>
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
