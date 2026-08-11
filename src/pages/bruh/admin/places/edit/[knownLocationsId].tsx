import { GetServerSideProps } from 'next';
import { BruhAdminPlaceForm } from '@/components/bruh/admin/BruhAdminPlaceForm';
import { BruhAdminPlaceBackfill } from '@/components/bruh/admin/BruhAdminPlaceBackfill';
import { qryGetKnownLocationById } from '@/utils/adminQueries';
import type { KnownLocation } from '@/utils/adminQueries';

type Props = { initial: KnownLocation };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const knownLocationsId = Number(ctx.params?.knownLocationsId);
    if (!knownLocationsId) return { notFound: true };
    const initial = await qryGetKnownLocationById(knownLocationsId);
    if (!initial) return { notFound: true };
    return { props: { initial } };
};

export default function BruhAdminPlacesEdit({ initial }: Props) {
    return (
        <>
            <BruhAdminPlaceForm
                initial={initial}
                endpoint={'/api/bruh/admin/known-locations/update'}
                heading={'Edit place'}
                successMessage={'Place updated'}
            />
            <BruhAdminPlaceBackfill place={initial} />
        </>
    );
}
