import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { Task } from '@/utils/adminQueries';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Flex } from '@/components/flexbox/Flex';
import { GridItem } from '@/components/grid/GridItem';
import { Grid } from '@/components/grid/Grid';
import { Card } from '@/components/card/Card';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 1,
    tablet: 2,
    tabletLandscape: 3,
    desktop: 4,
    desktopWide: 6,
};

export default function BruhAdminTasksList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadTasks = async () => {
        const res = await fetch('/api/bruh/admin/tasks/list');
        const json = await res.json();
        if (json.success) {
            setTasks(json.data);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load tasks' });
        }
    };

    useEffect(() => {
        void loadTasks();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/tasks/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasksId: target.tasksId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadTasks();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete task' });
        }
    };

    return (
        <>
            <Section id={'bruh-admin-tasks-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Tasks</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/tasks/add'} className={'button full-width'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section
                id={'bruh-admin-tasks-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {tasks.map((task) => (
                        <GridItem key={task.tasksId}>
                            <Card header={task.name} trimHeader>
                                <Grid columnGap={'10px'} gridTemplateColumns={'repeat(2, 1fr)'}>
                                    <GridItem>
                                        <Link
                                            href={`/bruh/admin/tasks/edit/${task.tasksId}`}
                                            className={'button full-width'}>
                                            Edit
                                        </Link>
                                    </GridItem>
                                    <GridItem>
                                        <button
                                            className={'button button-danger full-width'}
                                            onClick={() => setPendingDelete(task)}>
                                            Delete
                                        </button>
                                    </GridItem>
                                </Grid>
                            </Card>
                        </GridItem>
                    ))}
                </Grid>
            </Section>
            {pendingDelete && (
                <ConfirmModal
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setPendingDelete(null)}
                    confirmLabel={'Confirm'}>
                    <Flex>
                        <FlexItem>
                            <p>Delete task &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
