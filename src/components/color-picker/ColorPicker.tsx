import { PROFILE_COLORS } from '@/constants/profileColors';

type ColorPickerProps = {
    // null = "no color chosen" — profile falls back to app primary on render.
    value: string | null;
    onChange: (color: string | null) => void;
    disabled?: boolean;
};

export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
    const pick = (color: string) => {
        if (disabled) return;
        // Clicking the currently-selected swatch clears the color (back to default).
        onChange(value === color ? null : color);
    };

    return (
        <div className={'color-picker'}>
            {PROFILE_COLORS.map(({ name, value: v }) => {
                const selected = value === v;
                return (
                    <button
                        key={v}
                        type={'button'}
                        className={`color-swatch ${selected ? 'selected' : ''}`}
                        style={{ backgroundColor: v }}
                        aria-pressed={selected}
                        aria-label={name}
                        title={name}
                        disabled={disabled}
                        onClick={() => pick(v)}
                    />
                );
            })}
        </div>
    );
}
