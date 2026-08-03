import { ProfilesList } from '@/components/bruh/admin/profilesList';
import { qryGetTaskList, qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';
import { BruhAdminTasksAssignmentProvider } from '@/providers/BruhAdminTasksAssignmentContext';

export async function getServerSideProps() {
    const taskList = await qryGetTaskList();
    const profilesWithTasks = await qryGetProfilesTasksByProfileGrouped();

    return {
        props: {
            data: {
                taskList,
                profilesWithTasks,
            },
        },
    };
}

export default function BruhAdminTasksAssignment({
    data,
}: {
    data: Awaited<ReturnType<typeof getServerSideProps>>['props']['data'];
}) {
    return (
        <div>
            <BruhAdminTasksAssignmentProvider
                data={{
                    taskList: data.taskList,
                    profilesWithTasks: data.profilesWithTasks,
                }}>
                <ProfilesList />
            </BruhAdminTasksAssignmentProvider>
        </div>
    );
}
