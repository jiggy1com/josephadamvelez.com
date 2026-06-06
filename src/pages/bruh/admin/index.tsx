import { KidList } from '@/components/bruh/admin/kidList';
import { qryGetChoreList, qryGetKidChoreListByKidIdGrouped } from '@/utils/adminQueries';
import { BruhNav } from '@/components/bruh/BruhNav';

export type BruhAdminIndexProps = {
    data: {
        choreList: Awaited<ReturnType<typeof qryGetChoreList>>;
        kidChoreListByKidIdGrouped: Awaited<ReturnType<typeof qryGetKidChoreListByKidIdGrouped>>;
    };
};

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

export default function BruhAdminIndex({ data }: BruhAdminIndexProps) {
    return (
        <div>
            <BruhNav />
            <KidList data={data} />;
        </div>
    );
    // return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
