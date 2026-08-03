// ChoresContext (user-facing label stays "chores"; internals renamed to tasks/profiles).

import { createContext, useContext, ReactNode, useState } from 'react';
import { ProfileWithTasks } from '@/utils/adminQueries';

type ChoresData = {
    profilesWithTasks: ProfileWithTasks[];
};

type ChoresContextType = {
    data: ChoresData;
    toggleChoreStatus: (profilesTasksId: number, completed: boolean) => void;
    fetchChoreStatus?: () => Promise<void>;
};

const ChoresContext = createContext<ChoresContextType | null>(null);

type ChoresProviderProps = {
    data: ChoresData;
    children: ReactNode;
};

export function ChoresProvider({ data, children }: ChoresProviderProps) {
    const [state, setState] = useState<ChoresData>(data);

    const toggleChoreStatus = (profilesTasksId: number, completed: boolean) => {
        fetch('/api/bruh/update-task-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilesTasksId, completed }),
        }).then(async () => {
            await fetchChoreStatus();
        });
    };

    const fetchChoreStatus = async () => {
        try {
            const response = await fetch('/api/bruh/get-task-status').then((res) => res.json());
            setState((prev) => ({ ...prev, profilesWithTasks: response.data }));
        } catch (e) {}
    };

    return (
        <ChoresContext.Provider value={{ data: state, toggleChoreStatus, fetchChoreStatus }}>
            {children}
        </ChoresContext.Provider>
    );
}

export function useChores() {
    const context = useContext(ChoresContext);
    if (!context) {
        throw new Error('useChores must be used within ChoresProvider');
    }
    return context;
}
