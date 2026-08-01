import { KidList } from '@/components/bruh/admin/kidList';
import { qryGetChoreList, qryGetKidChoreListByKidIdGrouped } from '@/utils/adminQueries';
import { BruhNav } from '@/components/bruh/BruhNav';
import { BruhAdminChoresProvider } from '@/providers/BruhAdminChoresContext';

export async function getServerSideProps() {
    const choreList = await qryGetChoreList();
    const kidChoreListByKidIdGrouped = await qryGetKidChoreListByKidIdGrouped();

    return {
        props: {
            data: {
                choreList,
                kidChoreListByKidIdGrouped,
            },
        },
    };
}

export default function BruhAdminChoresAssignment({
    data,
}: {
    data: Awaited<ReturnType<typeof getServerSideProps>>['props']['data'];
}) {
    return (
        <div>
            <BruhNav />
            <BruhAdminChoresProvider
                data={{
                    choreList: data.choreList,
                    kidChoreListByKidIdGrouped: data.kidChoreListByKidIdGrouped,
                }}>
                <KidList />
            </BruhAdminChoresProvider>
        </div>
    );
}
