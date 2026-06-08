import { KidListItem } from '@/components/bruh/admin/kidListItem';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Section } from '@/components/section/Section';
import { useFlexDirection } from '@/hooks/useFlexDirection';
import { useBruhAdminChoresContext } from '@/providers/BruhAdminChoresContext';

export function KidList() {
    const context = useBruhAdminChoresContext();
    const { choreList, kidChoreListByKidIdGrouped } = context.state;
    const { removeAllKidChores } = context;
    const flexDirection = useFlexDirection();

    return (
        <>
            <Section id={'kid-list'}>
                <article>
                    <h1>Bruh Chores Admin </h1>
                    <button className={'btn'} onClick={removeAllKidChores}>
                        Clear All Assignments
                    </button>
                </article>
            </Section>
            <Section id={'chores'}>
                <article>
                    <Flex flexDirection={flexDirection} rowGap={'20px'} gap={'20px'}>
                        {kidChoreListByKidIdGrouped.map((kidCollection) => {
                            return (
                                <FlexItem key={kidCollection.kidid} flexGrow={1}>
                                    <KidListItem
                                        kidCollection={kidCollection}
                                        choreList={choreList as { choreid: number; name: string }[]}
                                    />
                                </FlexItem>
                            );
                        })}
                    </Flex>
                </article>
            </Section>
        </>
    );
}
