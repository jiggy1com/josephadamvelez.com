import styles from './Hero.module.scss';
import Image from 'next/image';
import heroBackground from '../../../public/images/home-background.jpg';
import { fontPoiretOne } from '@/utils/fonts';
import { Section } from '@/components/section/Section';

export function Hero() {
    const heroContent = `${styles.heroContent} ${fontPoiretOne.className}`;

    return (
        <Section id={'hero'} className={styles.hero}>
            <div className={styles.bgWrap}>
                <Image
                    alt="Mountains"
                    src={heroBackground}
                    placeholder="blur"
                    quality={100}
                    fill
                    sizes="100vw"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'top center',
                    }}
                />
            </div>
            <div className={heroContent}>
                <h1>Joseph Adam Velez</h1>
                <h2> Lead / Senior Front-end Engineer</h2>
                <h3> San Francisco, Remote (Tampa FL)</h3>
                <div className={styles.contentBackground}></div>
            </div>
        </Section>
    );
}
