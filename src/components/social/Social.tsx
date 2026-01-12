import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';
import styles from './Social.module.scss';
import Image from 'next/image';

export function Social() {
    return (
        <Section id={'social'}>
            <article>
                <H1>Social</H1>
                <div className={styles.socialItems}>
                    <a href={'https://www.linkedin.com/in/josephadamvelez/'} target={'_blank'}>
                        <Image
                            src={'/images/linkedin.svg'}
                            alt={'LinkedIn Icon'}
                            width={100}
                            height={100}
                        />
                        LinkedIn
                    </a>
                    <a href={'https://github.com/jiggy1com'} target={'_blank'}>
                        <Image
                            src={'/images/github.svg'}
                            alt={'GitHub Icon'}
                            width={100}
                            height={100}
                        />
                        GitHub
                    </a>
                    <a href={'https://twitter.com/jiggy1com'} target={'_blank'}>
                        <Image
                            src={'/images/twitter.svg'}
                            alt={'Twitter Icon'}
                            width={100}
                            height={100}
                        />
                        Twitter
                    </a>
                </div>
            </article>
        </Section>
    );
}
