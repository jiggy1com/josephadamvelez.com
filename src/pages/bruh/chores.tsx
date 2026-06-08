import { BruhNav } from '@/components/bruh/BruhNav';
import { BruhChores } from '@/components/bruh/BruhChores';
import { qryGetKidChoreListByKidIdGrouped } from '@/utils/adminQueries';
import { ChoresProvider } from '@/providers/BruhChoresContext';

export type BruhChoresProps = {
    data: {
        kidChoreListByKidIdGrouped: Awaited<ReturnType<typeof qryGetKidChoreListByKidIdGrouped>>;
    };
};

export async function getServerSideProps() {
    const kidChoreListByKidIdGrouped = await qryGetKidChoreListByKidIdGrouped();

    return {
        props: {
            title: 'Bruh Chores',
            data: {
                kidChoreListByKidIdGrouped,
            },
        },
    };
}

export default function Chores({ data }: BruhChoresProps) {
    return (
        <div>
            <BruhNav />
            <ChoresProvider data={data}>
                <BruhChores />
            </ChoresProvider>
            {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
        </div>
    );
}
