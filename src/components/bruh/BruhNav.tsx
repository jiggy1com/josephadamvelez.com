import React from 'react';
import { bruhNavItems } from '@/config/NavConfig';
import { Nav } from '@/components/nav/Nav';

export function BruhNav() {
    return <Nav navItems={bruhNavItems} title={'Bruh'} />;
}
