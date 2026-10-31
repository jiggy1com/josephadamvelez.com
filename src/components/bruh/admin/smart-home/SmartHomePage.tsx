import dynamic from 'next/dynamic';
import { Section } from '@/components/section/Section';

// Reads the HA connection from localStorage, so it can't render on the server.
const SmartHomePanels = dynamic(() => import('./SmartHomePanels').then((m) => m.SmartHomePanels), {
    ssr: false,
});

// Shared by /bruh/smart-home (any signed-in user) and /bruh/admin/smart-home.
// Everything talks to Home Assistant straight from the browser (see bruh/docker
// and src/utils/haClient.ts); no Bruh API routes are involved.
export function SmartHomePage() {
    return (
        <>
            <Section id={'bruh-smart-home-header'} className={'admin-section'}>
                <h1>Smart Home</h1>
            </Section>
            <SmartHomePanels />
        </>
    );
}
