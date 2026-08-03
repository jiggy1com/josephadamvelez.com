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

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        // Nav now persists across navigations (lives in _app.tsx), so closing the
        // menu on any tap is safe — no more unmount/remount flicker.
        onNavigate?.();

        const isHash = (event.target as HTMLAnchorElement).href.includes('#');
        if (!isHash) {
            router.push(navItem.target);
            return;
        }

        const targetElement = document.querySelector(navItem.target);
        if (targetElement) {
            document.location.hash = navItem.target;
            window.scrollTo({
                behavior: 'smooth',
                top: targetElement.getBoundingClientRect().top + window.scrollY - 48,
            });
        }
    };

    return (
        <a href={navItem.target} className={activeClass} onClick={handleClick}>
            {navItem.name}
        </a>
    );
}
