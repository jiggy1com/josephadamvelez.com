import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { Meal } from '@/utils/adminQueries';
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

export default function BruhAdminMealsList() {
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const [meals, setMeals] = useState<Meal[]>([]);
    const [pendingDelete, setPendingDelete] = useState<Meal | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadMeals = async () => {
        const res = await fetch('/api/bruh/admin/meals/list');
        const json = await res.json();
        if (json.success) {
            setMeals(json.data);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load meals' });
        }
    };

    useEffect(() => {
        void loadMeals();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/meals/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealId: target.mealId }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadMeals();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete meal' });
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-meals-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Meals</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/meals/add'} className={'button full-width'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section
                id={'bruh-admin-meals-list'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {meals.map((meal) => (
                        <GridItem key={meal.mealId}>
                            <Card header={meal.name} trimHeader>
                                <Grid columnGap={'10px'} gridTemplateColumns={'repeat(2, 1fr)'}>
                                    <GridItem>
                                        <Link
                                            href={`/bruh/admin/meals/edit/${meal.mealId}`}
                                            className={'button full-width'}>
                                            Edit
                                        </Link>
                                    </GridItem>
                                    <GridItem>
                                        <button
                                            className={'button button-danger full-width'}
                                            onClick={() => setPendingDelete(meal)}>
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
                            <p>Delete meal &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
