import styles from './Nav.module.scss';
import React from 'react';
import { useRouter } from 'next/router';

export type NavItemType = {
    name: string;
    target: string;
    active: boolean;
    // Only render this item when the viewer is authenticated. Default: item always renders.
    requiresAuth?: boolean;
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
