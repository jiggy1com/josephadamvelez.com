import Image from 'next/image';
import { useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { PortfolioModal } from '@/components/portfolio/PortfolioModal';
import styles from './Portfolio.module.scss';

export type PortfolioItem = {
    folder: string;
    siteName: string;
    description: string;
    technology: string[];
    images: number;
};

export function PortfolioItem({ portfolioItem }: { portfolioItem: PortfolioItem }) {
    const [state, setState] = useState({
        isModalOpen: false,
    });

    const toggleModal = () => {
        setState((prevState) => {
            return {
                ...prevState,
                isModalOpen: !prevState.isModalOpen,
            };
        });
    };

    return (
        <>
            {state.isModalOpen && (
                <Modal onClose={toggleModal}>
                    <PortfolioModal portfolioItem={portfolioItem} />
                </Modal>
            )}
            <div className={styles.portfolioItem} onClick={toggleModal}>
                <Image
                    className={'test'}
                    src={`/images/portfolio/${portfolioItem.folder}/285_1.png`}
                    alt={portfolioItem.siteName}
                    width={'285'}
                    height={'153'}
                />
                <p>{portfolioItem.siteName}</p>
            </div>
        </>
    );
}
