import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';

import styles from './Contact.module.scss';
import { ContactForm } from '@/components/contact/ContactForm';

export function Contact() {
    return (
        <Section id={'contact'}>
            <article>
                <H1>Contact</H1>
                <div className={styles.contactBox}>
                    <div>
                        <img src={'/images/joseph-adam-velez.png'} />

                        <div className={styles.callTextEmail}>
                            <a href={'tel:+17148140109'} className={'button'}>
                                Call
                            </a>
                            <a href={'sms:+17148140109'} className={'button'}>
                                Text
                            </a>
                            <a href={'mailto:josephadamvelez@gmail.com'} className={'button'}>
                                Email
                            </a>
                        </div>
                    </div>
                    <div>
                        <ContactForm />
                    </div>
                </div>
            </article>
        </Section>
    );
}
