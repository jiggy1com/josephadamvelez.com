import { useBruhAdminChoresContext } from '@/providers/BruhAdminChoresContext';

type KidListItemProps = {
    kidCollection: {
        kidid: number;
        name: string;
        chores: {
            choreid: number;
        }[];
    };
    choreList: {
        choreid: number;
        name: string;
    }[];
};

export function KidListItem({ kidCollection, choreList }: KidListItemProps) {
    const { addOrRemoveKidChore } = useBruhAdminChoresContext();

    const kidChores = kidCollection.chores;

    const hasChore = (choreId: number): boolean => {
        if (!kidChores) {
            return false;
        }
        return kidChores.some((kidChore) => kidChore.choreid === choreId);
    };

    return (
        <div>
            <h2>{kidCollection.name}</h2>
            {choreList.map((chore) => {
                const checked = hasChore(chore.choreid);

                return (
                    <div
                        key={chore.choreid}
                        style={{
                            paddingTop: '10px',
                        }}>
                        <input
                            checked={checked}
                            type="checkbox"
                            id={`choreId-${kidCollection.kidid}-${chore.choreid}`}
                            name={'choreId'}
                            value={chore.choreid}
                            onChange={(e) => {
                                console.log('e.target.value', e.target.value, 'hasChore');
                                addOrRemoveKidChore(kidCollection.kidid, chore.choreid, !checked);
                                // wait
                            }}
                        />
                        <label htmlFor={`choreId-${kidCollection.kidid}-${chore.choreid}`}>
                            {/*{chore.choreid}*/}
                            {chore.name}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}
