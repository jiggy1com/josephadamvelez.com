// ChoresContext.tsx

import { createContext, useContext, ReactNode, useState } from 'react';
import { KidChoreList } from '@/utils/adminQueries';

type ChoresData = {
    kidChoreListByKidIdGrouped: KidChoreList[];
};

type ChoresContextType = {
    data: ChoresData;
    toggleChoreStatus: (kidchoreid: number, status: boolean) => void;
    fetchChoreStatus?: () => Promise<void>;
};

const ChoresContext = createContext<ChoresContextType | null>(null);

type ChoresProviderProps = {
    data: {
        kidChoreListByKidIdGrouped: KidChoreList[];
    };
    children: ReactNode;
};

export function ChoresProvider({ data, children }: ChoresProviderProps) {
    const [state, setState] = useState<ChoresData>(data);

    const toggleChoreStatus = (kidchoreid: number, completed: boolean) => {
        fetch('/api/bruh/update-chore-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kidchoreid,
                completed,
            }),
        }).then(async (res) => {
            // Handle response if needed
            await fetchChoreStatus();
        });
    };
    const fetchChoreStatus = async () => {
        try {
            const response = await fetch('/api/bruh/get-chore-status').then((res) => {
                return res.json();
            });

            setState((prevState) => {
                return {
                    ...prevState,
                    kidChoreListByKidIdGrouped: response.data,
                };
            });
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
