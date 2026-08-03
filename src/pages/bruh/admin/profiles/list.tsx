import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { Profile } from '@/utils/adminQueries';
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

export default function BruhAdminProfilesList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [pendingDelete, setPendingDelete] = useState<Profile | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadProfiles = async () => {
        const res = await fetch('/api/bruh/admin/profiles/list');
        const json = await res.json();
        if (json.success) {
            setProfiles(json.data);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load profiles' });
        }
    };

    useEffect(() => {
        void loadProfiles();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/profiles/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilesId: target.profilesId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadProfiles();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete profile' });
        }
    };

    return (
        <>
            <Section
                id={'bruh-admin-profiles-list-header'}
                className={'admin-section'}
                removeArticle={true}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Profiles</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/profiles/add'} className={'button'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section
                id={'bruh-admin-profiles-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {profiles.map((profile) => (
                        <GridItem key={profile.profilesId}>
                            <Card header={profile.name} trimHeader>
                                <Grid columnGap={'10px'} gridTemplateColumns={'repeat(2, 1fr)'}>
                                    <GridItem>
                                        <Link
                                            href={`/bruh/admin/profiles/edit/${profile.profilesId}`}
                                            className={'button full-width'}>
                                            Edit
                                        </Link>
                                    </GridItem>
                                    <GridItem>
                                        <button
                                            className={'button button-danger full-width'}
                                            onClick={() => setPendingDelete(profile)}>
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
                            <p>Delete profile &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
