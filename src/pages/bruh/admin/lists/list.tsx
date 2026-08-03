import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { ListRow } from '@/utils/adminQueries';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { Card } from '@/components/card/Card';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 1,
    tablet: 2,
    tabletLandscape: 2,
    desktop: 3,
    desktopWide: 4,
};

export default function BruhAdminListsList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [lists, setLists] = useState<ListRow[]>([]);
    const [pendingDelete, setPendingDelete] = useState<ListRow | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadLists = async () => {
        const res = await fetch('/api/bruh/admin/lists/list');
        const json = await res.json();
        if (json.success) setLists(json.data);
        else setAlert({ success: false, message: json.error ?? 'Failed to load lists' });
    };

    useEffect(() => {
        void loadLists();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/lists/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listsId: target.listsId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadLists();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete list' });
        }
    };

    return (
        <>
            <Section id={'bruh-admin-lists-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Lists</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/lists/add'} className={'button full-width'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section id={'bruh-admin-lists-list'} className={'admin-section'} removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {lists.map((list) => {
                        const header = (
                            <Flex alignItems={'center'} gap={'10px'}>
                                {list.color && (
                                    <span
                                        aria-hidden={true}
                                        style={{
                                            display: 'inline-block',
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '3px',
                                            backgroundColor: list.color,
                                            flexShrink: 0,
                                            marginRight: '5px',
                                        }}
                                    />
                                )}
                                <span>
                                    {list.name}
                                    {!list.isPublic && ' (private)'}
                                </span>
                            </Flex>
                        );
                        return (
                            <GridItem key={list.listsId}>
                                <Card header={header}>
                                    <Grid columnGap={'10px'} gridTemplateColumns={'repeat(2, 1fr)'}>
                                        <GridItem>
                                            <Link
                                                href={`/bruh/admin/lists/edit/${list.listsId}`}
                                                className={'button full-width'}>
                                                Edit
                                            </Link>
                                        </GridItem>
                                        <GridItem>
                                            <button
                                                className={'button button-danger full-width'}
                                                onClick={() => setPendingDelete(list)}>
                                                Delete
                                            </button>
                                        </GridItem>
                                    </Grid>
                                </Card>
                            </GridItem>
                        );
                    })}
                </Grid>
            </Section>
            {pendingDelete && (
                <ConfirmModal
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setPendingDelete(null)}
                    confirmLabel={'Confirm'}>
                    <Flex>
                        <FlexItem>
                            <p>Delete list &quot;{pendingDelete.name}&quot; and all its items?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
