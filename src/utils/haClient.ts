// Browser-side Home Assistant client. Bruh talks to HA directly over the LAN
// (or localhost), so the long-lived token lives only in this browser's
// localStorage and never touches the Bruh server.

const STORAGE_KEY = 'bruh.homeAssistant';

export type HaConfig = {
    url: string;      // e.g. http://localhost
    token: string;    // long-lived access token
    entityId: string; // the single climate.* entity
};

export type HaClimateState = {
    entity_id: string;
    state: string; // hvac mode: off | heat | cool | heat_cool | auto | ...
    attributes: {
        friendly_name?: string;
        current_temperature?: number;
        temperature?: number | null;
        target_temp_step?: number;
        min_temp?: number;
        max_temp?: number;
        hvac_modes?: string[];
        hvac_action?: string;
        temperature_unit?: string;
    };
};

export function loadHaConfig(): HaConfig | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<HaConfig>;
        if (!parsed.url || !parsed.token || !parsed.entityId) return null;
        return parsed as HaConfig;
    } catch {
        return null;
    }
}

export function saveHaConfig(config: HaConfig): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearHaConfig(): void {
    window.localStorage.removeItem(STORAGE_KEY);
}

export function normalizeHaUrl(url: string): string {
    const trimmed = url.trim().replace(/\/+$/, '');
    return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

async function haFetch<T>(
    url: string,
    token: string,
    path: string,
    init?: RequestInit,
): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`${url}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        });
    } catch {
        throw new Error(
            `Can't reach Home Assistant at ${url}. Check it's running and that this site's origin is in cors_allowed_origins.`,
        );
    }
    if (res.status === 401) throw new Error('Home Assistant rejected the access token.');
    if (!res.ok) throw new Error(`Home Assistant returned ${res.status}.`);
    return (await res.json()) as T;
}

export async function listClimateEntities(url: string, token: string): Promise<HaClimateState[]> {
    const states = await haFetch<HaClimateState[]>(url, token, '/api/states');
    return states.filter((s) => s.entity_id.startsWith('climate.'));
}

export function getClimateState(config: HaConfig): Promise<HaClimateState> {
    return haFetch<HaClimateState>(config.url, config.token, `/api/states/${config.entityId}`);
}

function callClimateService(config: HaConfig, service: string, data: Record<string, unknown>) {
    return haFetch<unknown>(config.url, config.token, `/api/services/climate/${service}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: config.entityId, ...data }),
    });
}

export function setHvacMode(config: HaConfig, hvacMode: string) {
    return callClimateService(config, 'set_hvac_mode', { hvac_mode: hvacMode });
}

export function setTargetTemperature(config: HaConfig, temperature: number) {
    return callClimateService(config, 'set_temperature', { temperature });
}

export type HaCoverState = {
    entity_id: string;
    // open | opening | closed | closing | unavailable | unknown
    state: string;
    attributes: { friendly_name?: string; device_class?: string };
};

// Finds the garage door among HA's cover entities (there's only one expected).
export async function findGarageCover(config: HaConfig): Promise<HaCoverState | null> {
    const states = await haFetch<HaCoverState[]>(config.url, config.token, '/api/states');
    const covers = states.filter((s) => s.entity_id.startsWith('cover.'));
    return covers.find((c) => c.attributes.device_class === 'garage') ?? covers[0] ?? null;
}

export function getCoverState(config: HaConfig, entityId: string): Promise<HaCoverState> {
    return haFetch<HaCoverState>(config.url, config.token, `/api/states/${entityId}`);
}

export function callCoverService(
    config: HaConfig,
    service: 'open_cover' | 'close_cover',
    entityId: string,
) {
    return haFetch<unknown>(config.url, config.token, `/api/services/cover/${service}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
    });
}
