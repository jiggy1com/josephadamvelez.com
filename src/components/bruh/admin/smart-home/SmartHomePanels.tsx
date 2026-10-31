import { useState } from 'react';
import { Section } from '@/components/section/Section';
import { type HaConfig, loadHaConfig } from '@/utils/haClient';
import { GarageDoorCard } from './GarageDoorCard';
import { ThermostatCard } from './ThermostatCard';
import { ThermostatSetup } from './ThermostatSetup';

// One Home Assistant connection shared by every device section on the page.
export function SmartHomePanels() {
    // Rendered client-only (see smart-home page), so localStorage is available here.
    const [config, setConfig] = useState<HaConfig | null>(() => loadHaConfig());
    const [editing, setEditing] = useState(false);

    if (!config || editing) {
        return (
            <Section id={'bruh-admin-smart-home-connection'} className={'admin-section'}>
                <h2>Home Assistant</h2>
                <ThermostatSetup
                    initial={config}
                    onConnected={(c) => {
                        setConfig(c);
                        setEditing(false);
                    }}
                    onCancel={config ? () => setEditing(false) : undefined}
                />
            </Section>
        );
    }

    return (
        <>
            <Section id={'bruh-admin-smart-home-thermostat'} className={'admin-section'}>
                <h2>Thermostat</h2>
                <ThermostatCard config={config} onEditConnection={() => setEditing(true)} />
            </Section>
            <Section id={'bruh-admin-smart-home-garage'} className={'admin-section'}>
                <h2>Garage Door</h2>
                <GarageDoorCard config={config} />
            </Section>
        </>
    );
}
