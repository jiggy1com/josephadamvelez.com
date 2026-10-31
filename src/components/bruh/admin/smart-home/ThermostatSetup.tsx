import { useState } from 'react';
import {
    type HaConfig,
    listClimateEntities,
    normalizeHaUrl,
    saveHaConfig,
} from '@/utils/haClient';

type Props = {
    initial?: HaConfig | null;
    onConnected: (config: HaConfig) => void;
    onCancel?: () => void;
};

export function ThermostatSetup({ initial, onConnected, onCancel }: Props) {
    const [url, setUrl] = useState(initial?.url ?? 'http://localhost');
    const [token, setToken] = useState(initial?.token ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const connect = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const baseUrl = normalizeHaUrl(url);
            const cleanToken = token.trim();
            const climates = await listClimateEntities(baseUrl, cleanToken);
            if (climates.length === 0) {
                throw new Error(
                    'Connected, but Home Assistant has no thermostat yet. Add the Resideo integration first.',
                );
            }
            // Only one thermostat is expected; keep the previous choice if still present.
            const chosen =
                climates.find((c) => c.entity_id === initial?.entityId) ?? climates[0];
            const config = { url: baseUrl, token: cleanToken, entityId: chosen.entity_id };
            saveHaConfig(config);
            onConnected(config);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form className={'admin-form'} onSubmit={connect}>
            <p>Connect to Home Assistant to control the thermostat.</p>
            <label htmlFor={'ha-url'}>Home Assistant URL</label>
            <input
                id={'ha-url'}
                type={'text'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={'http://localhost'}
                required
            />
            <label htmlFor={'ha-token'}>Long-lived access token</label>
            <input
                id={'ha-token'}
                type={'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete={'off'}
                required
            />
            {error && <p role={'alert'} style={{ color: 'var(--color-error)' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type={'submit'} disabled={busy}>
                    {busy ? 'Connecting…' : 'Connect'}
                </button>
                {onCancel && (
                    <button type={'button'} className={'button-secondary'} onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
