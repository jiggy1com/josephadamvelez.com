import { Section } from '@/components/section/Section';

// Placeholder page — brings the Smart Home surface into the app's mental model
// so it's visible in the nav as a "remember this exists" nudge. Actual device
// integrations (thermostat, lights, camera, doorbell, etc.) go here later,
// probably one card per system with per-integration wiring.
export default function BruhAdminSmartHome() {
    return (
        <>
            <Section id={'bruh-admin-smart-home-header'} className={'admin-section'}>
                <h1>Smart Home</h1>
            </Section>
            <Section id={'bruh-admin-smart-home'} className={'admin-section'}>
                <p style={{ marginBottom: '10px' }}>Coming soon.</p>
                <p style={{ opacity: 0.7 }}>
                    This is where thermostat, lighting, doorbell, and camera controls
                    will live once the house is settled.
                </p>
            </Section>
        </>
    );
}
