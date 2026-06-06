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
    const kidChores = kidCollection.chores;

    const hasChore = (choreId: number): boolean => {
        return kidChores.some((kidChore) => kidChore.choreid === choreId);
    };

    return (
        <div>
            <h2>{kidCollection.name}</h2>
            <ul>
                {choreList.map((chore) => {
                    const checked = hasChore(chore.choreid);

                    return (
                        <div key={chore.choreid}>
                            <input
                                checked={checked}
                                type="checkbox"
                                id={`choreId-${kidCollection.kidid}-${chore.choreid}`}
                                name={'choreId'}
                                value={chore.choreid}
                            />
                            <label htmlFor={`choreId-${kidCollection.kidid}-${chore.choreid}`}>
                                {chore.name}
                            </label>
                        </div>
                    );
                })}
            </ul>
        </div>
    );
}
