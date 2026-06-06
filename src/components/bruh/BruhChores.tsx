import { useChores } from '@/providers/BruhChoresContext';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { KidChoreWithStatus } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';

export function BruhChores() {
    const chores = useChores();
    const kidChoreListByKidIdGrouped = chores.data.kidChoreListByKidIdGrouped;
    const toggleChoreStatus = chores.toggleChoreStatus;

    return (
        <Section id={'bruh-chores'}>
            <article>
                <h1>Bruh Chores</h1>
                <Flex gap={'20px'}>
                    {kidChoreListByKidIdGrouped.map((kidChoreList) => (
                        <FlexItem key={kidChoreList.kidid} flexGrow={1}>
                            <h2>{kidChoreList.name}</h2>
                            {kidChoreList.chores.map((chore: KidChoreWithStatus) => {
                                const id = `choreId-${kidChoreList.kidid}-${chore.choreid}`;
                                return (
                                    <div key={chore.choreid}>
                                        <input
                                            checked={chore.completed}
                                            type="checkbox"
                                            id={id}
                                            name={'choreId'}
                                            value={chore.choreid}
                                            onChange={() => {
                                                toggleChoreStatus(
                                                    chore.kidchoreid,
                                                    !chore.completed,
                                                );
                                            }}
                                        />
                                        <label htmlFor={id}>{chore.name}</label>
                                    </div>
                                );
                            })}
                        </FlexItem>
                    ))}
                </Flex>
                {/*<pre>{JSON.stringify(chores, null, 2)}</pre>*/}
            </article>
        </Section>
    );
}
