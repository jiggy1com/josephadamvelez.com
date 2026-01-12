import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';
import styles from './Skills.module.scss';

export function Skills() {
    const skillsList = [
        'HTML',
        'CSS / SCSS',
        'JavaScript',
        'TypeScript',

        'NextJS',
        'React',
        'Vue',
        'Angular',

        'Jest',
        'Cypress',
        'React Testing Library',
        'PHPUnit',

        'NGINX',
        'Apache',
        'PHP',
        'ColdFusion',

        'MongoDB',
        'MySQL',
        'Redis',
        'Git',

        'DNS',
        'Jira',
        'Confluence',
        'Agile Methodologies',
    ];

    const restAndJsApis = [
        'AirBNB',
        'VRBO',
        'PriceLabs',
        'BranchIO',

        'Main-in-a-Box (DNS, Email)',
        'Google Maps',
        'Google Analytics',
        'TMDB (The Movie Database)',
    ];

    const paymentGatewayApis = [
        'AuthorizeNet',
        'Recurly',
        'PayPal',
        'SquareUp',

        'WorldPay',
        'eProcessingNetwork',
        'OnlineDataCorp BluePay',
        'GoEMerchant',

        'Innovative',
        'eSelect Plus',
        'First Data',
        'Sage Payments',

        'and more!',
        '',
        '',
        '',
    ];

    return (
        <Section id={'skills'}>
            <article>
                <H1>Skills</H1>
                <div className={styles.skillsList}>
                    {skillsList.map((skill, idx) => {
                        return (
                            <div key={idx} className="skill-item">
                                {skill}
                            </div>
                        );
                    })}
                </div>

                <h3 className={styles.heading}>RESTful & Javascript APIs</h3>

                <div className={styles.skillsList}>
                    {restAndJsApis.map((skill, idx) => {
                        return (
                            <div key={idx} className="skill-item">
                                {skill}
                            </div>
                        );
                    })}
                </div>

                <h3 className={styles.heading}>Payment Gateway APIs</h3>

                <div className={styles.skillsList}>
                    {paymentGatewayApis.map((skill, idx) => {
                        return (
                            <div key={idx} className="skill-item">
                                {skill}
                            </div>
                        );
                    })}
                </div>
            </article>
        </Section>
    );
}
