import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { Card } from '@/components/card/Card';
import { Flex } from '@/components/flexbox/Flex';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';
import type { ListWithCounts } from '@/utils/adminQueries';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 2,
    tablet: 2,
    tabletLandscape: 3,
    desktop: 4,
    desktopWide: 4,
};

export default function BruhListsIndex() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [lists, setLists] = useState<ListWithCounts[]>([]);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    useEffect(() => {
        void (async () => {
            const res = await fetch('/api/bruh/lists/list');
            const json = await res.json();
            if (json.success) setLists(json.data);
            else setAlert({ success: false, message: json.error ?? 'Failed to load lists' });
        })();
    }, []);

    return (
        <>
            <Section id={'bruh-lists-header'}>
                <h1>Lists</h1>
            </Section>
            <Section id={'bruh-lists'} removeArticle={true}>
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
                                <span>{list.name}</span>
                            </Flex>
                        );
                        return (
                            <GridItem key={list.listsId}>
                                <Link
                                    href={`/bruh/lists/${list.listsId}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Card header={header}>
                                        <p style={{ opacity: 0.7 }}>
                                            {list.uncheckedCount === 0
                                                ? 'All done'
                                                : `${list.uncheckedCount} to go`}
                                            {list.itemCount > 0 && ` · ${list.itemCount} total`}
                                        </p>
                                    </Card>
                                </Link>
                            </GridItem>
                        );
                    })}
                </Grid>
            </Section>
        </>
    );
}
