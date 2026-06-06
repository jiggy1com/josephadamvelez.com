import { useChores } from '@/providers/BruhChoresContext';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { KidChoreWithStatus } from '@/utils/adminQueries';
import { Section } from '@/components/section/Section';
import { Breakpoints } from '@/utils/breakpoints';
import { useEffect, useLayoutEffect, useState } from 'react';

type Direction = 'column' | 'row' | 'row-reverse' | 'column-reverse';

function useFlexDirection(): Direction {
    const [dir, setDir] = useState<Direction>('row');

    useEffect(() => {
        const bp = new Breakpoints();

        const compute = () => (bp.isMobile() || bp.isTablet() ? 'column' : 'row');

        const update = () => setDir(compute());

        update();

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return dir;
}

export function BruhChores() {
    const chores = useChores();
    const kidChoreListByKidIdGrouped = chores.data.kidChoreListByKidIdGrouped;
    const toggleChoreStatus = chores.toggleChoreStatus;

    const flexDirection = useFlexDirection();

    return (
        <Section id={'bruh-chores'}>
            <article>
                <h1>Bruh Chores</h1>
                <Flex flexDirection={flexDirection} rowGap={'20px'} gap={'20px'}>
                    {kidChoreListByKidIdGrouped.map((kidChoreList) => (
                        <FlexItem key={kidChoreList.kidid} flexGrow={1}>
                            <div>
                                <h2>{kidChoreList.name}</h2>
                                {kidChoreList.chores.map((chore: KidChoreWithStatus) => {
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
                            </div>
                        </FlexItem>
                    ))}
                </Flex>
                {/*<pre>{JSON.stringify(chores, null, 2)}</pre>*/}
            </article>
        </Section>
    );
}
