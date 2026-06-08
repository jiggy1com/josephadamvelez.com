import { useChores } from '@/providers/BruhChoresContext';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { KidChoreWithStatus } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { useFlexDirection } from '@/hooks/useFlexDirection';

export function BruhChores() {
    const chores = useChores();
    const kidChoreListByKidIdGrouped = chores.data.kidChoreListByKidIdGrouped;
    const toggleChoreStatus = chores.toggleChoreStatus;

    const flexDirection = useFlexDirection();

    const garbageSpacer = [];
    for (let i = 1; i <= 10; i++) {
        garbageSpacer.push(<p key={i}>&nbsp;</p>);
    }
    return (
        <>
            <Section id={'bruh-chores'}>
                <article>
                    <h1>Bruh Chores</h1>
                </article>
            </Section>
            <Section id={'chores'}>
                <article>
                    <Flex flexDirection={flexDirection} rowGap={'20px'} gap={'20px'}>
                        {kidChoreListByKidIdGrouped.map((kidChoreList) => (
                            <FlexItem key={kidChoreList.kidid} flexGrow={1}>
                                <h2
                                    style={{
                                        marginBottom: '10px',
                                    }}>
                                    {kidChoreList.name}
                                </h2>
                                {!Array.isArray(kidChoreList.chores) && (
                                    <p>No chores assigned. Enjoy your day off.</p>
                                )}
                                {Array.isArray(kidChoreList.chores) &&
                                    kidChoreList.chores.map((chore: KidChoreWithStatus) => {
                                        const id = `choreId-${kidChoreList.kidid}-${chore.choreid}`;
                                        return (
                                            <div
                                                key={chore.choreid}
                                                style={{
                                                    paddingTop: '10px',
                                                }}>
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
                    {garbageSpacer}
                    {/*<pre>{JSON.stringify(chores, null, 2)}</pre>*/}
                </article>
            </Section>
        </>
    );
}
