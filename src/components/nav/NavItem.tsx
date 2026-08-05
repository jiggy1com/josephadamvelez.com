import styles from './Nav.module.scss';
import React from 'react';
import { useRouter } from 'next/router';

export type NavItemType = {
    name: string;
    // Optional so group headers (items with children but no destination of their own)
    // can exist. Leaf items always set this.
    target?: string;
    active: boolean;
    // Only render this item when the viewer is authenticated. Default: item always renders.
    // On a group, the flag cascades — children get hidden with the parent.
    requiresAuth?: boolean;
    // Only render this item for admin users. Implies requiresAuth. Non-admin viewers
    // (including household / child / parent) never see it.
    requiresAdmin?: boolean;
    // If present, this item renders as a group header with a submenu of these children.
    // Desktop: hover shows the dropdown. Mobile: children are always shown inline.
    children?: NavItemType[];
};

type NavItemProps = {
    navItem: NavItemType;
    // Called before navigation so the parent Nav can close the mobile menu.
    onNavigate?: () => void;
};

export function NavItem({ navItem, onNavigate }: NavItemProps) {
    const router = useRouter();
    const activeClass = navItem.active ? styles.active : '';

    // Invariant: Nav.tsx only renders NavItem for leaves (items without children).
    // Leaves always set `target`, but the shared NavItemType marks it optional
    // for group-header items — bail here so the compiler + runtime both stay honest.
    if (!navItem.target) return null;
    const target = navItem.target;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        // Nav now persists across navigations (lives in _app.tsx), so closing the
        // menu on any tap is safe — no more unmount/remount flicker.
        onNavigate?.();

        const isHash = (event.target as HTMLAnchorElement).href.includes('#');
        if (!isHash) {
            router.push(target);
            return;
        }

        const targetElement = document.querySelector(target);
        if (targetElement) {
            document.location.hash = target;
            window.scrollTo({
                behavior: 'smooth',
                top: targetElement.getBoundingClientRect().top + window.scrollY - 48,
            });
        }
    };

    return (
        <a href={target} className={activeClass} onClick={handleClick}>
            {navItem.name}
        </a>
    );
}
