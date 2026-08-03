import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { IcsFeed } from '@/utils/adminQueries';
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
    tabletLandscape: 2,
    desktop: 3,
    desktopWide: 4,
};

export default function BruhAdminIcsFeedsList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [feeds, setFeeds] = useState<IcsFeed[]>([]);
    const [pendingDelete, setPendingDelete] = useState<IcsFeed | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadFeeds = async () => {
        const res = await fetch('/api/bruh/admin/ics-feeds/list');
        const json = await res.json();
        if (json.success) {
            setFeeds(json.data);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load calendars' });
        }
    };

    useEffect(() => {
        void loadFeeds();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/ics-feeds/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ icsFeedId: target.icsFeedId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadFeeds();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete calendar' });
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-ics-feeds-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Calendars</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/ics-feeds/add'} className={'button full-width'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section
                id={'bruh-admin-ics-feeds-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {feeds.map((feed) => {
                        const header = (
                            <Flex alignItems={'center'} gap={'10px'}>
                                {feed.color && (
                                    <span
                                        aria-hidden={true}
                                        style={{
                                            display: 'inline-block',
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '3px',
                                            backgroundColor: feed.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                                <span>
                                    {feed.name}
                                    {!feed.active && ' (off)'}
                                </span>
                            </Flex>
                        );
                        return (
                            <GridItem key={feed.icsFeedId}>
                                <Card header={header}>
                                    <p
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.85em',
                                            opacity: 0.7,
                                            marginBottom: '10px',
                                        }}
                                        title={feed.url}>
                                        {feed.url}
                                    </p>
                                    <Grid
                                        columnGap={'10px'}
                                        gridTemplateColumns={'repeat(2, 1fr)'}>
                                        <GridItem>
                                            <Link
                                                href={`/bruh/admin/ics-feeds/edit/${feed.icsFeedId}`}
                                                className={'button full-width'}>
                                                Edit
                                            </Link>
                                        </GridItem>
                                        <GridItem>
                                            <button
                                                className={'button button-danger full-width'}
                                                onClick={() => setPendingDelete(feed)}>
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
                            <p>Delete calendar &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
