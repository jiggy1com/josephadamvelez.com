import { BruhNav } from '@/components/bruh/BruhNav';
import { BruhChores } from '@/components/bruh/BruhChores';
import { qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';
import { ChoresProvider } from '@/providers/BruhChoresContext';

export type BruhTasksProps = {
    data: {
        profilesWithTasks: Awaited<ReturnType<typeof qryGetProfilesTasksByProfileGrouped>>;
    };
};

export async function getServerSideProps() {
    const profilesWithTasks = await qryGetProfilesTasksByProfileGrouped();

    return {
        props: {
            title: 'Bruh Tasks',
            data: {
                profilesWithTasks,
            },
        },
    };
}

export default function Tasks({ data }: BruhTasksProps) {
    return (
        <div>
            <BruhNav />
            <ChoresProvider data={data}>
                <BruhChores />
            </ChoresProvider>
        </div>
    );
}
