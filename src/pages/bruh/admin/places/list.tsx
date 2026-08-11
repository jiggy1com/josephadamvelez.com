import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { Card } from '@/components/card/Card';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';
import type { KnownLocation } from '@/utils/adminQueries';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 1,
    tablet: 2,
    tabletLandscape: 3,
    desktop: 4,
    desktopWide: 6,
};

export default function BruhAdminPlacesList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [places, setPlaces] = useState<KnownLocation[]>([]);
    const [pendingDelete, setPendingDelete] = useState<KnownLocation | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const load = async () => {
        const res = await fetch('/api/bruh/admin/known-locations/list');
        const json = await res.json();
        if (json.success) setPlaces(json.data);
        else setAlert({ success: false, message: json.error ?? 'Failed to load' });
    };

    useEffect(() => {
        void load();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/known-locations/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ knownLocationsId: target.knownLocationsId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await load();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete' });
        }
    };

    return (
        <>
            <Section
                id={'bruh-admin-places-list-header'}
                className={'admin-section'}
                removeArticle={true}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Places</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/places/add'} className={'button'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section
                id={'bruh-admin-places-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                {places.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No known places yet. Add one to see friendly names in map popups.
                    </p>
                )}
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {places.map((p) => (
                        <GridItem key={p.knownLocationsId}>
                            <Card header={p.name} trimHeader>
                                <div style={{ fontSize: '0.85em', opacity: 0.7, marginBottom: 8 }}>
                                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)} · {p.radiusM}m
                                </div>
                                {p.address && (
                                    <div style={{ fontSize: '0.85em', opacity: 0.75, marginBottom: 10 }}>
                                        {p.address}
                                    </div>
                                )}
                                <Grid columnGap={'10px'} gridTemplateColumns={'repeat(2, 1fr)'}>
                                    <GridItem>
                                        <Link
                                            href={`/bruh/admin/places/edit/${p.knownLocationsId}`}
                                            className={'button full-width'}>
                                            Edit
                                        </Link>
                                    </GridItem>
                                    <GridItem>
                                        <button
                                            className={'button button-danger full-width'}
                                            onClick={() => setPendingDelete(p)}>
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
                    confirmLabel={'Delete'}>
                    <p>Delete place &quot;{pendingDelete.name}&quot;?</p>
                    <p style={{ fontSize: '0.9em', opacity: 0.8, marginTop: 10 }}>
                        Past arrivals and departures for this place will lose their name
                        in the activity feed and map history — the events remain, but
                        &quot;{pendingDelete.name}&quot; will no longer resolve.
                    </p>
                </ConfirmModal>
            )}
        </>
    );
}
