import React from 'react';

type ToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    id?: string;
};

export function Toggle({ checked, onChange, label, disabled = false, id }: ToggleProps) {
    const inputId = id ?? React.useId();
    return (
        <label className={'toggle'} htmlFor={inputId}>
            <input
                id={inputId}
                type={'checkbox'}
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className={'toggle-track'} aria-hidden={true}>
                <span className={'toggle-thumb'} />
            </span>
            {label !== undefined && <span className={'toggle-label'}>{label}</span>}
        </label>
    );
}
