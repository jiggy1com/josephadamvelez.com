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
        if (!profileTasks) {
            return false;
        }
        return profileTasks.some((pt) => pt.tasksId === tasksId);
    };

    return (
        <div>
            <h2>{profileCollection.name}</h2>
            {taskList.map((task) => {
                const checked = hasTask(task.tasksId);

                return (
                    <div
                        key={task.tasksId}
                        style={{
                            paddingTop: '10px',
                        }}>
                        <input
                            checked={checked}
                            type="checkbox"
                            id={`taskId-${profileCollection.profilesId}-${task.tasksId}`}
                            name={'taskId'}
                            value={task.tasksId}
                            onChange={() => {
                                addOrRemoveProfilesTasks(
                                    profileCollection.profilesId,
                                    task.tasksId,
                                    !checked,
                                );
                            }}
                        />
                        <label
                            htmlFor={`taskId-${profileCollection.profilesId}-${task.tasksId}`}>
                            {task.name}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}
