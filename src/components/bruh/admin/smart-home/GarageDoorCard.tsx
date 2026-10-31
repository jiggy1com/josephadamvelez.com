import { useCallback, useEffect, useRef, useState } from 'react';
import {
    type HaConfig,
    type HaCoverState,
    callCoverService,
    findGarageCover,
    getCoverState,
} from '@/utils/haClient';
import styles from './GarageDoorCard.module.scss';

const POLL_MS = 10_000;
const POLL_MOVING_MS = 2_000;
const CONFIRM_MS = 4_000;

const LABELS: Record<string, string> = {
    open: 'Open',
    closed: 'Closed',
    opening: 'Opening…',
    closing: 'Closing…',
};

export function GarageDoorCard({ config }: { config: HaConfig }) {
    const [cover, setCover] = useState<HaCoverState | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const entityId = useRef<string | null>(null);
    const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const refresh = useCallback(async () => {
        try {
            if (!entityId.current) {
                const found = await findGarageCover(config);
                entityId.current = found?.entity_id ?? null;
                setCover(found);
            } else {
                setCover(await getCoverState(config, entityId.current));
            }
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoaded(true);
        }
    }, [config]);

    const moving = cover?.state === 'opening' || cover?.state === 'closing';

    // Poll faster while the door is travelling so the status settles promptly.
    useEffect(() => {
        void refresh();
        const id = setInterval(() => void refresh(), moving ? POLL_MOVING_MS : POLL_MS);
        return () => clearInterval(id);
    }, [refresh, moving]);

    useEffect(() => {
        return () => {
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
        };
    }, []);

    const send = async (service: 'open_cover' | 'close_cover') => {
        if (!entityId.current) return;
        setBusy(true);
        try {
            await callCoverService(config, service, entityId.current);
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    const cancelConfirm = () => {
        if (confirmTimer.current) clearTimeout(confirmTimer.current);
        setConfirming(false);
    };

    // Opening is one tap. Closing needs a second tap, since from a remote
    // screen you can't see whether something is in the doorway.
    const onPress = () => {
        if (!cover) return;
        if (cover.state === 'closed') {
            void send('open_cover');
            return;
        }
        if (confirming) {
            cancelConfirm();
            void send('close_cover');
            return;
        }
        setConfirming(true);
        confirmTimer.current = setTimeout(() => setConfirming(false), CONFIRM_MS);
    };

    if (!loaded) return <p>Loading garage door…</p>;

    if (!cover) {
        return error ? (
            <p role={'alert'} style={{ color: 'var(--color-error)' }}>{error}</p>
        ) : (
            <p>No garage door found in Home Assistant. Add the Aladdin Connect integration first.</p>
        );
    }

    const unavailable = cover.state === 'unavailable' || cover.state === 'unknown';
    const label = unavailable ? 'Unavailable' : (LABELS[cover.state] ?? cover.state);
    const actionLabel = cover.state === 'closed' ? 'Open door' : confirming ? 'Tap again to close' : 'Close door';

    return (
        <div className={styles.card}>
            <div className={styles.status}>
                <span className={`${styles.state} ${cover.state === 'open' ? styles.stateOpen : ''}`}>
                    {label}
                </span>
                <span className={styles.caption}>{cover.attributes.friendly_name ?? 'Garage door'}</span>
            </div>
            <div className={styles.actions}>
                <button
                    type={'button'}
                    className={confirming ? 'button-danger' : ''}
                    onClick={onPress}
                    disabled={busy || unavailable || moving}
                >
                    {actionLabel}
                </button>
                {confirming && (
                    <button type={'button'} className={'button-secondary'} onClick={cancelConfirm}>
                        Cancel
                    </button>
                )}
            </div>
            {error && <p role={'alert'} style={{ color: 'var(--color-error)' }}>{error}</p>}
        </div>
    );
}
