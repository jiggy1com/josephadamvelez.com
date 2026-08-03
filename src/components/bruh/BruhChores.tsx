import { useChores } from '@/providers/BruhChoresContext';
import { Flex } from '@/components/flexbox/Flex';
import { Grid } from '@/components/grid/Grid';
import { GridItem } from '@/components/grid/GridItem';
import { Card } from '@/components/card/Card';
import { ProfilesTasksWithStatus } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { BreakpointName, useBreakpoint } from '@/hooks/useBreakpoint';

const columnsByBreakpoint: Record<BreakpointName, number> = {
    mobile: 1,
    mobileLandscape: 1,
    tablet: 2,
    tabletLandscape: 2,
    desktop: 3,
    desktopWide: 4,
};

export function BruhChores() {
    const chores = useChores();
    const profilesWithTasks = chores.data.profilesWithTasks;
    const toggleChoreStatus = chores.toggleChoreStatus;
    const breakpoint = useBreakpoint();
    const columns = columnsByBreakpoint[breakpoint];

    return (
        <>
            <Section id={'bruh-chores'} removeArticle={true}>
                <h1>Bruh Tasks</h1>
            </Section>
            <Section id={'chores'} removeArticle={true}>
                <Grid
                    columnGap={'10px'}
                    rowGap={'20px'}
                    gridTemplateColumns={`repeat(${columns}, 1fr)`}>
                    {profilesWithTasks.map((profile) => (
                        <GridItem key={profile.profilesId}>
                            <Card header={profile.name} trimHeader>
                                {!Array.isArray(profile.tasks) && (
                                    <p>No tasks assigned. Enjoy your day off.</p>
                                )}
                                {Array.isArray(profile.tasks) && (
                                    <div className={'stack'}>
                                        {profile.tasks.map((task: ProfilesTasksWithStatus) => {
                                            const id = `taskId-${profile.profilesId}-${task.tasksId}`;
                                            return (
                                                <Flex key={task.tasksId} alignItems={'center'}>
                                                    <input
                                                        checked={task.completed}
                                                        type={'checkbox'}
                                                        id={id}
                                                        name={'taskId'}
                                                        value={task.tasksId}
                                                        onChange={() => {
                                                            toggleChoreStatus(
                                                                task.profilesTasksId,
                                                                !task.completed,
                                                            );
                                                        }}
                                                    />
                                                    <label htmlFor={id}>{task.name}</label>
                                                </Flex>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        </GridItem>
                    ))}
                </Grid>
            </Section>
        </>
    );
}
