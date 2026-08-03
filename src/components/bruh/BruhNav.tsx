import React from 'react';
import { useRouter } from 'next/router';
import { bruhAdminNavItems, bruhNavItems } from '@/config/NavConfig';
import { Nav } from '@/components/nav/Nav';
import { useSession } from '@/hooks/useSession';

export function BruhNav() {
    const router = useRouter();
    const { user } = useSession();

    const isAdmin = router.pathname.includes('admin');
    const rawItems = isAdmin ? bruhAdminNavItems : bruhNavItems;
    const navItems = rawItems.filter((item) => !item.requiresAuth || user !== null);
    const title = isAdmin ? 'Bruh Admin' : 'Bruh';
    console.log('#debug user', {
        user,
        isAdmin,
        rawItems,
        navItems,
        title,
    });
    return <Nav navItems={navItems} title={title} />;
}
