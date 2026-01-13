import React, { useEffect, useState } from 'react';
import styles from './Modal.module.scss';

type ModalProps = {
    children: React.ReactNode;

    onClose: () => void;
};

export function Modal({ children, onClose }: ModalProps) {
    const [state, setState] = useState({
        isOpen: true,
    });

    const toggleModal = () => {
        onClose();
        setState((prevState) => {
            return {
                ...prevState,
                isOpen: !prevState.isOpen,
            };
        });
    };

    if (!state.isOpen) {
        return null;
    }

    return (
        <div className={styles.modal}>
            <div className={styles.modalBackdrop} onClick={toggleModal} />
            <div className={styles.modalContent}>
                <div className={styles.modalContentChildren}>{children}</div>
                <div className={styles.modalClose}>
                    <button className="button" onClick={toggleModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
