import type { KnownLocationInput } from '@/utils/adminQueries';

// Shared body validator for the known_locations add/update endpoints.
// Underscore prefix signals to the Next.js router that this isn't itself a
// route — it lives alongside the endpoints as a helper.

export type ParseResult =
    | { valid: true; input: KnownLocationInput }
    | { valid: false; error: string };

export function parseKnownLocationBody(body: unknown): ParseResult {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Invalid body' };
    }
    const b = body as Record<string, unknown>;

    const name = typeof b.name === 'string' ? b.name.trim() : '';
    if (!name) return { valid: false, error: 'name is required' };
    if (name.length > 100) return { valid: false, error: 'name too long (max 100)' };

    const latitude = Number(b.latitude);
    const longitude = Number(b.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        return { valid: false, error: 'latitude must be a number in [-90, 90]' };
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return { valid: false, error: 'longitude must be a number in [-180, 180]' };
    }

    const radiusM = Math.round(Number(b.radiusM));
    // Upper bound is a soft sanity check — 10km is bigger than any household
    // "place" ought to be. Keeps a fat-fingered slider from setting a radius
    // that swallows the neighborhood.
    if (!Number.isInteger(radiusM) || radiusM < 1 || radiusM > 10000) {
        return { valid: false, error: 'radiusM must be an integer in [1, 10000]' };
    }

    const address =
        typeof b.address === 'string' && b.address.trim() !== '' ? b.address.trim() : null;

    return {
        valid: true,
        input: { name, latitude, longitude, radiusM, address },
    };
}
