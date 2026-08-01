import React from 'react';
import { useRouter } from 'next/router';
import { bruhAdminNavItems, bruhNavItems } from '@/config/NavConfig';
import { Nav } from '@/components/nav/Nav';

export function BruhNav() {
    const router = useRouter();
    const isAdmin = router.pathname.includes('admin');
    const navItems = isAdmin ? bruhAdminNavItems : bruhNavItems;
    const title = isAdmin ? 'Bruh Admin' : 'Bruh';

    return <Nav navItems={navItems} title={title} />;
}
