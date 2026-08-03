import { BruhChores } from '@/components/bruh/BruhChores';
import { qryGetProfilesTasksByProfileGrouped } from '@/utils/adminQueries';
import { ChoresProvider } from '@/providers/BruhChoresContext';

export type BruhTasksProps = {
    data: {
        profilesWithTasks: Awaited<ReturnType<typeof qryGetProfilesTasksByProfileGrouped>>;
    };
};

export async function getServerSideProps() {
    // Kids-facing: only show tasks whose days_of_week includes today.
    const profilesWithTasks = await qryGetProfilesTasksByProfileGrouped(true);

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
            <ChoresProvider data={data}>
                <BruhChores />
            </ChoresProvider>
        </div>
    );
}
