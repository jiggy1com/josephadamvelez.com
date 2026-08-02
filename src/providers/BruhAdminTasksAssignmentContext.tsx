import { createContext, ReactNode, useContext, useState } from 'react';
import { qryGetTaskList, qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';

type stateType = {
    taskList: Awaited<ReturnType<typeof qryGetTaskList>>;
    profilesWithTasks: Awaited<ReturnType<typeof qryGetProfilesTasksByProfileGrouped>>;
};

export type BruhAdminTasksAssignmentContextType = {
    state: stateType;
    removeAllProfilesTasks: () => void;
    addOrRemoveProfilesTasks: (profilesId: number, tasksId: number, active: boolean) => void;
};

const BruhAdminTasksAssignmentContext = createContext<BruhAdminTasksAssignmentContextType>({
    state: {
        taskList: [],
        profilesWithTasks: [],
    },
    removeAllProfilesTasks: () => {},
    addOrRemoveProfilesTasks: () => {},
});

type ProviderProps = {
    children: ReactNode;
    data: stateType;
};

export function BruhAdminTasksAssignmentProvider({ children, data }: ProviderProps) {
    const [state, setState] = useState<stateType>({
        taskList: data.taskList,
        profilesWithTasks: data.profilesWithTasks,
    });

    const refreshProfilesWithTasks = async () => {
        try {
            const response = await fetch('/api/bruh/get-task-status').then((res) => res.json());
            setState((prev) => ({ ...prev, profilesWithTasks: response.data }));
        } catch (e) {}
    };

    const removeAllProfilesTasks = () => {
        fetch('/api/bruh/admin/remove-all-profiles-tasks', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }).then(async () => {
            await refreshProfilesWithTasks();
        });
    };

    const addOrRemoveProfilesTasks = (profilesId: number, tasksId: number, active: boolean) => {
        fetch('/api/bruh/admin/add-or-remove-profiles-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilesId, tasksId, active }),
        }).then(async () => {
            await refreshProfilesWithTasks();
        });
    };

    return (
        <BruhAdminTasksAssignmentContext.Provider
            value={{ state, removeAllProfilesTasks, addOrRemoveProfilesTasks }}>
            {children}
        </BruhAdminTasksAssignmentContext.Provider>
    );
}

export function useBruhAdminTasksAssignmentContext() {
    const context = useContext(BruhAdminTasksAssignmentContext);
    if (context === null) {
        throw new Error(
            'useBruhAdminTasksAssignmentContext must be used within a BruhAdminTasksAssignmentProvider',
        );
    }
    return context;
}
