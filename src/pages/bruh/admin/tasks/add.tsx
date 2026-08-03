import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { DaysOfWeekPicker } from '@/components/days-of-week-picker/DaysOfWeekPicker';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import type { DayOfWeek } from '@/utils/adminQueries';

type Payload = { name: string; daysOfWeek: DayOfWeek[] | null };

export default function BruhAdminTasksAdd() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);

    const { submit, submitting, alert } = useFormSubmit<Payload>(
        '/api/bruh/admin/tasks/add',
        {
            successMessage: () => `Added "${name}"`,
            onSuccess: () => {
                setName('');
                setDaysOfWeek([]);
            },
            autoClearMs: 1500,
        },
    );

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Empty array → null at the DB level (means "every day").
        await submit({ name, daysOfWeek: daysOfWeek.length === 0 ? null : daysOfWeek });
    };

    return (
        <>
            <Section id={'bruh-admin-tasks-add'} className={'admin-section'}>
                <h1>Add Task</h1>
            </Section>
            <Section id={'bruh-admin-tasks-add-form'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <form className={'admin-form'} onSubmit={(e) => void onSubmit(e)}>
                    <div>
                        <input
                            id={'name'}
                            type={'text'}
                            value={name}
                            placeholder={'Task Name'}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ margin: '10px 0 20px' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9em' }}>
                            Days of week{' '}
                            <span style={{ opacity: 0.6 }}>
                                (leave blank for every day)
                            </span>
                        </div>
                        <DaysOfWeekPicker value={daysOfWeek} onChange={setDaysOfWeek} />
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
