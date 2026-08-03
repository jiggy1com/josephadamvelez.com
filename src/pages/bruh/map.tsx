import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { VIEWPORT_HEIGHT_MINUS_NAV } from '@/constants/layout';
import { qryGetLastKnownDeviceLocation } from '@/utils/adminQueries';
// import { BruhMap } from '@/components/bruh/BruhMap';

import dynamic from 'next/dynamic';

const BruhMap = dynamic(() => import('@/components/bruh/BruhMap').then((mod) => mod.BruhMap), {
    ssr: false,
});

export type BruhMapProps = {
    data: Awaited<ReturnType<typeof qryGetLastKnownDeviceLocation>>;
};

export async function getServerSideProps() {
    const getLastKnownDeviceLocation = await qryGetLastKnownDeviceLocation();

    return {
        props: {
            title: 'Bruh Map',
            data: getLastKnownDeviceLocation,
        },
    };
}

export default function Map({ data }: BruhMapProps) {
    return (
        <Flex flexDirection="column" height={VIEWPORT_HEIGHT_MINUS_NAV}>
            <FlexItem>
            </FlexItem>
            <FlexItem flexGrow={1} minHeight="0">
                <BruhMap getLastKnownDeviceLocation={data} />
            </FlexItem>
        </Flex>
    );
}
