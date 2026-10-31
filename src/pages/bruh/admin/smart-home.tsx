import dynamic from 'next/dynamic';
import { Section } from '@/components/section/Section';

// Reads the HA connection from localStorage, so it can't render on the server.
const SmartHomePanels = dynamic(
    () =>
        import('@/components/bruh/admin/smart-home/SmartHomePanels').then(
            (m) => m.SmartHomePanels,
        ),
    { ssr: false },
);

// Smart Home surface. One section per device; everything talks to Home Assistant
// straight from the browser (see bruh/docker and src/utils/haClient.ts).
export default function BruhAdminSmartHome() {
    return (
        <>
            <Section id={'bruh-admin-smart-home-header'} className={'admin-section'}>
                <h1>Smart Home</h1>
            </Section>
            <SmartHomePanels />
        </>
    );
}
