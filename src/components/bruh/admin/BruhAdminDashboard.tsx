import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { bruhAdminNavItems } from '@/config/NavConfig';
import type { NavItemType } from '@/components/nav/NavItem';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 2,
    tablet: 2,
    tabletLandscape: 4,
    desktop: 4,
    desktopWide: 4,
};

type TileItem = NavItemType & { target: string };

// Flatten groups — the dashboard is a launcher, so grouped items (which have
// children but no target of their own) get replaced with their children. This
// also surfaces routes that would otherwise only be reachable via the nav
// dropdown (e.g. Tasks → Manage, Calendar → Meals List).
function flattenTiles(items: readonly NavItemType[]): TileItem[] {
    return items
        .flatMap((item) => (item.children && item.children.length > 0 ? item.children : [item]))
        .filter((item): item is TileItem => typeof item.target === 'string' && item.target.length > 0);
}

export function BruhAdminDashboard() {
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
    const tiles = flattenTiles(bruhAdminNavItems);
    return (
        <>
            <Section id={'bruh-admin'} className={'admin-section'}>
                <Flex>
                    <FlexItem>
                        <h1>Bruh Admin</h1>
                    </FlexItem>
                </Flex>
            </Section>
            <Section id={'test'} className={'admin-section'}>
                <Grid gap={'10px'} gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {tiles.map((navItem) => (
                        <GridItem key={navItem.target}>
                            <button
                                className={'full-width'}
                                onClick={() => {
                                    void router.push(navItem.target);
                                }}>
                                {navItem.name}
                            </button>
                        </GridItem>
                    ))}
                </Grid>
            </Section>
        </>
    );
}
