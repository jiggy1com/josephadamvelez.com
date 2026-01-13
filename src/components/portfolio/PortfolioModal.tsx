import { PortfolioItem } from '@/components/portfolio/PortfolioItem';
import styles from './PortfolioModal.module.scss';
import { useState } from 'react';

export function PortfolioModal({ portfolioItem }: { portfolioItem: PortfolioItem }) {
    const [state, setState] = useState({
        currentImage: 1,
    });

    return (
        <div className={styles.portfolioModal}>
            <div>
                <h2>{portfolioItem.siteName}</h2>
            </div>
            <div>
                <h3>Project Description</h3>
                <p>{portfolioItem.description}</p>
            </div>
            <div>
                <h3>Technologies Used:</h3>
                <p>{portfolioItem.technology.join(', ')}</p>

                <a
                    href={`https://${portfolioItem.folder}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'white',
                    }}
                    className={`button`}>
                    Visit Site
                </a>

                {/*<ul>*/}
                {/*    {portfolioItem.technology.map((tech, index) => (*/}
                {/*        <li key={index}>{tech}</li>*/}
                {/*    ))}*/}
                {/*</ul>*/}
            </div>

            <img
                src={`/images/portfolio/${portfolioItem.folder}/${state.currentImage}.png`}
                alt={`${portfolioItem.siteName} `}
            />

            <div>
                <h3>Additional Screen Shots</h3>
                <div className={styles.additionalImages}>
                    {Array.from({ length: portfolioItem.images }, (_, i) => i + 1).map((num) => (
                        <img
                            key={num}
                            src={`/images/portfolio/${portfolioItem.folder}/${num}.png`}
                            alt={`${portfolioItem.siteName} Image ${num}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setState((prevState) => {
                                    return {
                                        ...prevState,
                                        currentImage: num,
                                    };
                                });
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
