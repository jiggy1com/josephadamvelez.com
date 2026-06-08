import { createContext, ReactNode, useContext, useState } from 'react';
import { qryGetChoreList, qryGetKidChoreListByKidIdGrouped } from '@/utils/adminQueries';

type stateType = {
    choreList: Awaited<ReturnType<typeof qryGetChoreList>>;
    kidChoreListByKidIdGrouped: Awaited<ReturnType<typeof qryGetKidChoreListByKidIdGrouped>>;
};

export type BruhAdminChoresContextType = {
    state: stateType;
    removeAllKidChores: () => void;
    addOrRemoveKidChore: (kidid: number, choreid: number, active: boolean) => void;
};

const BruhAdminChoresContext = createContext<BruhAdminChoresContextType>({
    state: {
        choreList: [],
        kidChoreListByKidIdGrouped: [],
    },
    removeAllKidChores: () => {},
    addOrRemoveKidChore: (kidid: number, choreid: number, active: boolean) => {},
});

type BruhAdminChoresProviderProps = {
    children: ReactNode;
    data: stateType;
};

export function BruhAdminChoresProvider({
    children,
    data,
}: React.PropsWithChildren<BruhAdminChoresProviderProps>) {
    const [state, setState] = useState<stateType>({
        choreList: data.choreList,
        kidChoreListByKidIdGrouped: data.kidChoreListByKidIdGrouped,
    });

    const removeAllKidChores = () => {
        fetch('/api/bruh/admin/remove-all-kid-chores', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            await fetchKidChoreListByKidIdGrouped();
        });
    };

    const addOrRemoveKidChore = (kidid: number, choreid: number, active: boolean) => {
        fetch('/api/bruh/admin/add-or-remove-kid-chore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kidid,
                choreid,
                active,
            }),
        }).then(async (res) => {
            await fetchKidChoreListByKidIdGrouped();
        });
    };

    const fetchKidChoreListByKidIdGrouped = async () => {
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
        <BruhAdminChoresContext.Provider value={{ state, removeAllKidChores, addOrRemoveKidChore }}>
            {children}
        </BruhAdminChoresContext.Provider>
    );
}

export function useBruhAdminChoresContext() {
    const context = useContext(BruhAdminChoresContext);
    if (context === null) {
        throw new Error('useBruhAdminChoresContext must be used within a BruhAdminChoresProvider');
    }
    return context;
}
