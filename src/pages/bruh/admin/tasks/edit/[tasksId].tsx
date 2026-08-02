import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { qryGetTaskById } from '@/utils/adminQueries';
import type { Task } from '@/utils/adminQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';

type Props = { task: Task };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const tasksId = Number(ctx.params?.tasksId);
    if (!tasksId) return { notFound: true };
    const task = await qryGetTaskById(tasksId);
    if (!task) return { notFound: true };
    return { props: { task } };
};

export default function BruhAdminTasksEdit({ task }: Props) {
    const router = useRouter();
    const [name, setName] = useState(task.name);
    const { submit, submitting, alert } = useFormSubmit<{ tasksId: number; name: string }>(
        '/api/bruh/admin/tasks/update',
        {
            successMessage: 'Task updated',
            onSuccess: () => {
                setTimeout(() => {
                    void router.push('/bruh/admin/tasks/list');
                }, 1000);
            },
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submit({ tasksId: task.tasksId, name });
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-tasks-edit'} className={'admin-section'}>
                <h1>Edit Task</h1>
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
                            onClick={() => void router.push('/bruh/admin/tasks/list')}>
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
