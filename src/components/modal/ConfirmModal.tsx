import React from 'react';
import { Modal } from './Modal';

type ConfirmModalProps = {
    children: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
};

export function ConfirmModal({
    children,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
}: ConfirmModalProps) {
    return (
        <Modal onClose={onCancel}>
            <div style={{ color: 'black' }}>{children}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className={'button'} onClick={onCancel}>
                    {cancelLabel}
                </button>
                <button className={'button'} onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
