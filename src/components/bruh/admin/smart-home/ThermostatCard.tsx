import { useCallback, useEffect, useRef, useState } from 'react';
import {
    type HaClimateState,
    type HaConfig,
    getClimateState,
    setHvacMode,
    setTargetTemperature,
} from '@/utils/haClient';
import styles from './ThermostatCard.module.scss';

const POLL_MS = 10_000;
const SEND_DEBOUNCE_MS = 800;
const MODES = ['off', 'heat', 'cool'] as const;

type Props = {
    config: HaConfig;
    onEditConnection: () => void;
};

export function ThermostatCard({ config, onEditConnection }: Props) {
    const [state, setState] = useState<HaClimateState | null>(null);
    const [error, setError] = useState('');
    // Target shown while the user is tapping; null means "show what HA reports".
    const [pendingTarget, setPendingTarget] = useState<number | null>(null);
    const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const refresh = useCallback(async () => {
        try {
            setState(await getClimateState(config));
            setError('');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [config]);

    useEffect(() => {
        void refresh();
        const id = setInterval(() => void refresh(), POLL_MS);
        return () => {
            clearInterval(id);
            if (sendTimer.current) clearTimeout(sendTimer.current);
        };
    }, [refresh]);

    if (!state) {
        return error ? (
            <>
                <p role={'alert'} style={{ color: 'var(--color-error)' }}>{error}</p>
                <button type={'button'} className={'button-secondary'} onClick={onEditConnection}>
                    Edit connection
                </button>
            </>
        ) : (
            <p>Loading thermostat…</p>
        );
    }

    const attrs = state.attributes;
    const unit = attrs.temperature_unit ?? '°F';
    const step = attrs.target_temp_step ?? 1;
    const available = MODES.filter((m) => (attrs.hvac_modes ?? MODES).includes(m));
    const reportedTarget = attrs.temperature ?? null;
    const shownTarget = pendingTarget ?? reportedTarget;
    const isOff = state.state === 'off';
    // heat_cool/auto use a low/high range, which this card doesn't edit.
    const canAdjust = !isOff && reportedTarget !== null;

    const changeMode = async (mode: string) => {
        setPendingTarget(null);
        try {
            await setHvacMode(config, mode);
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    const nudge = (direction: 1 | -1) => {
        const base = shownTarget ?? reportedTarget;
        if (base === null) return;
        const min = attrs.min_temp ?? -Infinity;
        const max = attrs.max_temp ?? Infinity;
        const next = Math.min(max, Math.max(min, base + direction * step));
        setPendingTarget(next);
        if (sendTimer.current) clearTimeout(sendTimer.current);
        sendTimer.current = setTimeout(async () => {
            try {
                await setTargetTemperature(config, next);
                await refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setPendingTarget(null);
            }
        }, SEND_DEBOUNCE_MS);
    };

    return (
        <div className={styles.card}>
            <div className={styles.current}>
                <span className={styles.currentTemp}>
                    {attrs.current_temperature ?? '--'}
                    {unit}
                </span>
                <span className={styles.caption}>
                    Inside now{attrs.hvac_action && attrs.hvac_action !== 'off' ? ` · ${attrs.hvac_action}` : ''}
                </span>
            </div>

            <div className={styles.setpoint}>
                <button
                    type={'button'}
                    className={styles.round}
                    onClick={() => nudge(-1)}
                    disabled={!canAdjust}
                    aria-label={'Lower temperature'}
                >
                    −
                </button>
                <div className={styles.target}>
                    <span className={styles.targetTemp}>
                        {isOff || shownTarget === null ? '--' : shownTarget}
                    </span>
                    <span className={styles.caption}>{isOff ? 'Off' : `Set to (${unit})`}</span>
                </div>
                <button
                    type={'button'}
                    className={styles.round}
                    onClick={() => nudge(1)}
                    disabled={!canAdjust}
                    aria-label={'Raise temperature'}
                >
                    +
                </button>
            </div>

            <div className={styles.modes} role={'group'} aria-label={'Mode'}>
                {available.map((m) => (
                    <button
                        key={m}
                        type={'button'}
                        className={m === state.state ? '' : 'button-secondary'}
                        onClick={() => void changeMode(m)}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {error && <p role={'alert'} style={{ color: 'var(--color-error)' }}>{error}</p>}
            <button type={'button'} className={`button-secondary ${styles.edit}`} onClick={onEditConnection}>
                Edit connection
            </button>
        </div>
    );
}
