import { BruhNav } from '@/components/bruh/BruhNav';
import { BruhChores } from '@/components/bruh/BruhChores';
import { qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';
import { ChoresProvider } from '@/providers/BruhChoresContext';

export type BruhChoresProps = {
    data: {
        profilesWithTasks: Awaited<ReturnType<typeof qryGetProfilesTasksByProfileGrouped>>;
    };
};

export async function getServerSideProps() {
    const profilesWithTasks = await qryGetProfilesTasksByProfileGrouped();

    return {
        props: {
            title: 'Bruh Chores',
            data: {
                profilesWithTasks,
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
        </div>
    );
}
