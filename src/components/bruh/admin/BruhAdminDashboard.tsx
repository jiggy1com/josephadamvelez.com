import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { bruhAdminNavItems } from '@/config/NavConfig';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 2,
    tablet: 2,
    tabletLandscape: 4,
    desktop: 4,
    desktopWide: 4,
};

export function BruhAdminDashboard() {
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];
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
                    {bruhAdminNavItems.map((navItem) => {
                        return (
                            <GridItem key={navItem.target}>
                                <button
                                    className={'full-width'}
                                    onClick={() => {
                                        void router.push(navItem.target);
                                    }}>
                                    {navItem.name}
                                </button>
                            </GridItem>
                        );
                    })}
                </Grid>
            </Section>
        </>
    );
}
