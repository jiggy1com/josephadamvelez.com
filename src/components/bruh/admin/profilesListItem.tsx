import { Card } from '@/components/card/Card';
import { useBruhAdminTasksAssignmentContext } from '@/providers/BruhAdminTasksAssignmentContext';

type ProfilesListItemProps = {
    profileCollection: {
        profilesId: number;
        name: string;
        tasks: {
            tasksId: number;
        }[];
    };
    taskList: {
        tasksId: number;
        name: string;
    }[];
};

export function ProfilesListItem({ profileCollection, taskList }: ProfilesListItemProps) {
    const { addOrRemoveProfilesTasks } = useBruhAdminTasksAssignmentContext();

    const profileTasks = profileCollection.tasks;

    const hasTask = (tasksId: number): boolean => {
        if (!profileTasks) return false;
        return profileTasks.some((pt) => pt.tasksId === tasksId);
    };

    return (
        <Card header={profileCollection.name} trimHeader>
            {taskList.map((task) => {
                const checked = hasTask(task.tasksId);
                const id = `taskId-${profileCollection.profilesId}-${task.tasksId}`;
                return (
                    <div key={task.tasksId} style={{ paddingTop: '10px' }}>
                        <input
                            checked={checked}
                            type={'checkbox'}
                            id={id}
                            name={'taskId'}
                            value={task.tasksId}
                            onChange={() =>
                                addOrRemoveProfilesTasks(
                                    profileCollection.profilesId,
                                    task.tasksId,
                                    !checked,
                                )
                            }
                        />
                        <label htmlFor={id}>{task.name}</label>
                    </div>
                );
            })}
        </Card>
    );
}
