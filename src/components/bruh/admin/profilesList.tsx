import { ProfilesListItem } from '@/components/bruh/admin/profilesListItem';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Section } from '@/components/section/Section';
import { useFlexDirection } from '@/hooks/useFlexDirection';
import { useBruhAdminTasksAssignmentContext } from '@/providers/BruhAdminTasksAssignmentContext';

export function ProfilesList() {
    const context = useBruhAdminTasksAssignmentContext();
    const { taskList, profilesWithTasks } = context.state;
    const { removeAllProfilesTasks } = context;
    const flexDirection = useFlexDirection();

    return (
        <>
            <Section id={'profiles-list'}>
                <article>
                    <h1>Bruh Admin Tasks Assignment</h1>
                    <button className={'btn'} onClick={removeAllProfilesTasks}>
                        Clear All Assignments
                    </button>
                </article>
            </Section>
            <Section id={'tasks'}>
                <article>
                    <Flex flexDirection={flexDirection} rowGap={'20px'} gap={'20px'}>
                        {profilesWithTasks.map((profileCollection) => {
                            return (
                                <FlexItem key={profileCollection.profilesId} flexGrow={1}>
                                    <ProfilesListItem
                                        profileCollection={profileCollection}
                                        taskList={taskList as { tasksId: number; name: string }[]}
                                    />
                                </FlexItem>
                            );
                        })}
                    </Flex>
                </article>
            </Section>
        </>
    );
}
