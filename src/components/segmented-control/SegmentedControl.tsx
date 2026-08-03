import React from 'react';

type Option<T extends string> = {
    value: T;
    label: React.ReactNode;
};

type SegmentedControlProps<T extends string> = {
    options: Option<T>[];
    value: T | null;
    onChange: (value: T) => void;
    disabled?: boolean;
    ariaLabel?: string;
};

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    disabled = false,
    ariaLabel,
}: SegmentedControlProps<T>) {
    return (
        <div className={'segmented-control'} role={'radiogroup'} aria-label={ariaLabel}>
            {options.map((opt) => {
                const selected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type={'button'}
                        role={'radio'}
                        aria-checked={selected}
                        className={`segment ${selected ? 'selected' : ''}`}
                        disabled={disabled}
                        onClick={() => onChange(opt.value)}>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
