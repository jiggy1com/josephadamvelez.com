import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Section } from '@/components/section/Section';
import { Alert } from '@/components/alert/Alert';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import type { KnownLocation } from '@/utils/adminQueries';

// Leaflet + react-leaflet touch `window` — must be client-only.
const KnownLocationMapPicker = dynamic(
    () =>
        import('@/components/bruh/KnownLocationMapPicker').then(
            (m) => m.KnownLocationMapPicker,
        ),
    { ssr: false },
);

type Coord = { latitude: number; longitude: number };

type PlacePayload = {
    knownLocationsId?: number;
    name: string;
    latitude: number;
    longitude: number;
    radiusM: number;
    address: string | null;
};

type Props = {
    // Undefined = add mode. Present = edit mode.
    initial?: KnownLocation;
    // Optional prefilled coord — used when saving a place from a marker popup
    // via router query params (e.g. add?lat=...&lon=...).
    prefillCoord?: Coord;
    endpoint: string;
    heading: string;
    successMessage: string;
};

// Shared form for add and edit. Splits the map into its own component so the
// page shell can lay out the sidebar/form/map to fit the breakpoint.
export function BruhAdminPlaceForm({
    initial,
    prefillCoord,
    endpoint,
    heading,
    successMessage,
}: Props) {
    const router = useRouter();
    const [name, setName] = useState(initial?.name ?? '');
    const [address, setAddress] = useState(initial?.address ?? '');
    const [radiusM, setRadiusM] = useState<number>(initial?.radiusM ?? 50);
    const [coord, setCoord] = useState<Coord | null>(
        initial
            ? { latitude: initial.latitude, longitude: initial.longitude }
            : prefillCoord ?? null,
    );

    const canSubmit = name.trim().length > 0 && coord !== null && radiusM > 0;

    const { submit, submitting, alert } = useFormSubmit<PlacePayload>(endpoint, {
        successMessage,
        onSuccess: () => {
            setTimeout(() => {
                void router.push('/bruh/admin/places/list');
            }, 800);
        },
    });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit || !coord) return;
        await submit({
            knownLocationsId: initial?.knownLocationsId,
            name: name.trim(),
            latitude: coord.latitude,
            longitude: coord.longitude,
            radiusM,
            address: address.trim() || null,
        });
    };

    return (
        <>
            <Section id={'bruh-admin-place-form-header'} className={'admin-section'}>
                <h1>{heading}</h1>
            </Section>
            <Section id={'bruh-admin-place-form'} className={'admin-section'} removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />

                <div className={'place-form-shell'}>
                    <form className={'admin-form place-form-fields'} onSubmit={(e) => void onSubmit(e)}>
                        <div>
                            <input
                                id={'name'}
                                type={'text'}
                                value={name}
                                placeholder={"Name (e.g. Bob's House)"}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                id={'address'}
                                type={'text'}
                                value={address}
                                placeholder={'Address (optional, not geocoded)'}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor={'radius'}
                                style={{ fontSize: '0.9em', marginBottom: 6, display: 'block' }}>
                                Radius: {radiusM}m
                            </label>
                            <input
                                id={'radius'}
                                type={'range'}
                                min={10}
                                max={500}
                                step={5}
                                value={radiusM}
                                onChange={(e) => setRadiusM(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ fontSize: '0.85em', opacity: 0.7 }}>
                            {coord ? (
                                <>
                                    Coordinates: {coord.latitude.toFixed(6)},{' '}
                                    {coord.longitude.toFixed(6)}
                                </>
                            ) : (
                                <>Click on the map to place the pin.</>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button
                                type={'button'}
                                className={'button'}
                                onClick={() => void router.push('/bruh/admin/places/list')}>
                                Cancel
                            </button>
                            <button
                                type={'submit'}
                                className={'button'}
                                disabled={submitting || !canSubmit}>
                                Save
                            </button>
                        </div>
                        {!canSubmit && !submitting && (
                            <p style={{ color: 'salmon', fontSize: '0.9em', marginTop: '10px' }}>
                                {!name.trim()
                                    ? 'Enter a name to continue.'
                                    : !coord
                                      ? 'Click on the map to place the pin.'
                                      : 'Radius must be positive.'}
                            </p>
                        )}
                    </form>
                    <div className={'place-form-map'}>
                        <KnownLocationMapPicker
                            value={coord}
                            onChange={setCoord}
                            radiusM={radiusM}
                        />
                    </div>
                </div>
            </Section>
        </>
    );
}
