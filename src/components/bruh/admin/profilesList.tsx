import { ProfilesListItem } from '@/components/bruh/admin/profilesListItem';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { Section } from '@/components/section/Section';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';
import { useBruhAdminTasksAssignmentContext } from '@/providers/BruhAdminTasksAssignmentContext';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 1,
    tablet: 2,
    tabletLandscape: 2,
    desktop: 3,
    desktopWide: 4,
};

export function ProfilesList() {
    const context = useBruhAdminTasksAssignmentContext();
    const { taskList, profilesWithTasks } = context.state;
    const { removeAllProfilesTasks } = context;
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];

    return (
        <>
            <Section id={'profiles-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Assign Tasks</h1>
                    </FlexItem>
                    <FlexItem>
                        <button className={'button'} onClick={removeAllProfilesTasks}>
                            Clear All
                        </button>
                    </FlexItem>
                </Flex>
            </Section>
            <Section id={'profiles-list'} className={'admin-section'} removeArticle={true}>
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {profilesWithTasks.map((profileCollection) => {
                        return (
                            <GridItem key={profileCollection.profilesId}>
                                <ProfilesListItem
                                    profileCollection={profileCollection}
                                    taskList={taskList as { tasksId: number; name: string }[]}
                                />
                            </GridItem>
                        );
                    })}
                </Grid>
            </Section>
        </>
    );
}
