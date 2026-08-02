import { useChores } from '@/providers/BruhChoresContext';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { ProfilesTasksWithStatus } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { useFlexDirection } from '@/hooks/useFlexDirection';

export function BruhChores() {
    const chores = useChores();
    const profilesWithTasks = chores.data.profilesWithTasks;
    const toggleChoreStatus = chores.toggleChoreStatus;

    const flexDirection = useFlexDirection();

    const garbageSpacer = [];
    for (let i = 1; i <= 10; i++) {
        garbageSpacer.push(<p key={i}>&nbsp;</p>);
    }

    return (
        <>
            <Section id={'bruh-chores'}>
                <article>
                    <h1>Bruh Chores</h1>
                </article>
            </Section>
            <Section id={'chores'}>
                <article>
                    <Flex flexDirection={flexDirection} rowGap={'20px'} gap={'20px'}>
                        {profilesWithTasks.map((profile) => (
                            <FlexItem key={profile.profilesId} flexGrow={1}>
                                <h2 style={{ marginBottom: '10px' }}>{profile.name}</h2>
                                {!Array.isArray(profile.tasks) && (
                                    <p>No chores assigned. Enjoy your day off.</p>
                                )}
                                {Array.isArray(profile.tasks) &&
                                    profile.tasks.map((task: ProfilesTasksWithStatus) => {
                                        const id = `taskId-${profile.profilesId}-${task.tasksId}`;
                                        return (
                                            <div key={task.tasksId} style={{ paddingTop: '10px' }}>
                                                <input
                                                    checked={task.completed}
                                                    type="checkbox"
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
                                            </div>
                                        );
                                    })}
                            </FlexItem>
                        ))}
                    </Flex>
                    {garbageSpacer}
                </article>
            </Section>
        </>
    );
}
