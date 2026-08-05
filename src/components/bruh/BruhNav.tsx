import React from 'react';
import { useRouter } from 'next/router';
import { bruhAdminNavItems, bruhNavItems } from '@/config/NavConfig';
import { Nav } from '@/components/nav/Nav';
import { NavItemType } from '@/components/nav/NavItem';
import { useSession } from '@/hooks/useSession';

function isVisible(item: NavItemType, isSignedIn: boolean, isAdmin: boolean): boolean {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresAuth && !isSignedIn) return false;
    return true;
}

export function BruhNav() {
    const router = useRouter();
    const { user } = useSession();

    const onAdminRoute = router.pathname.includes('admin');
    const rawItems = onAdminRoute ? bruhAdminNavItems : bruhNavItems;
    const isSignedIn = user !== null;
    const isAdmin = user?.isAdmin === true;
    const navItems = rawItems.filter((item) => isVisible(item, isSignedIn, isAdmin));
    const title = onAdminRoute ? 'Bruh Admin' : 'Bruh';
    return <Nav navItems={navItems} title={title} />;
}
