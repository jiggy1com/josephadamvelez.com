import styles from './About.module.scss';

import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';

export function About() {
    return (
        <Section id={'about'}>
            <article>
                <H1>About Joe Velez</H1>
                <div className={styles.about}>
                    <div className={'test'}>
                        <p>
                            Joe Velez currently works as a Senior Software Engineer at Paramount. An
                            accomplished full-stack web developer with decades of experience
                            creating interactive & responsive web applications.
                        </p>

                        <p>
                            Efficiently completes projects to meet team, stakeholder, and individual
                            goals.
                        </p>

                        <p>
                            Proficient in PHP, NextJS/React, Vue, Vanilla JS, MongoDB, Webpack,
                            Github and more.
                        </p>

                        <p>
                            My IDE of choice is{' '}
                            <a href={'https://www.jetbrains.com/phpstorm/'} target={'_blank'}>
                                PhpStorm
                            </a>
                        </p>
                    </div>
                    <div className={'test'}>
                        <div>
                            <strong>Born</strong>
                            Anaheim Hills, CA
                        </div>
                        <div>
                            <strong>Current Location</strong>
                            Tampa, FL
                        </div>
                        <div>
                            <strong>Employment Status</strong>
                            US Citizen
                        </div>
                    </div>
                </div>
            </article>
        </Section>
    );
}
