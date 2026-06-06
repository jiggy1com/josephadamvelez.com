import { KidListItem } from '@/components/bruh/admin/kidListItem';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Section } from '@/components/section/Section';
import { BruhAdminIndexProps } from '@/pages/bruh/admin';

export function KidList({ data }: BruhAdminIndexProps) {
    return (
        <Section id={'kid-list'}>
            <article>
                <h1>Bruh Chores Admin</h1>
                <Flex gap={'30px'}>
                    {data.kidChoreListByKidIdGrouped.map((kidCollection) => {
                        return (
                            <FlexItem key={kidCollection.kidid} flexGrow={1}>
                                <KidListItem
                                    kidCollection={kidCollection}
                                    choreList={
                                        data.choreList as { choreid: number; name: string }[]
                                    }
                                />
                            </FlexItem>
                        );
                    })}
                </Flex>
            </article>
        </Section>
    );
}
