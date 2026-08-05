import { useRouter } from 'next/router';
import { BruhAdminPlaceForm } from '@/components/bruh/admin/BruhAdminPlaceForm';

// Add mode. Optionally accepts ?lat=<n>&lon=<n> in the URL so the popup "+"
// button on /bruh/map can prefill the pin.
export default function BruhAdminPlacesAdd() {
    const router = useRouter();
    const lat = Number(router.query.lat);
    const lon = Number(router.query.lon);
    const prefillCoord =
        Number.isFinite(lat) && Number.isFinite(lon) && router.query.lat && router.query.lon
            ? { latitude: lat, longitude: lon }
            : undefined;

    return (
        <BruhAdminPlaceForm
            prefillCoord={prefillCoord}
            endpoint={'/api/bruh/admin/known-locations/add'}
            heading={'Add place'}
            successMessage={'Place added'}
        />
    );
}
