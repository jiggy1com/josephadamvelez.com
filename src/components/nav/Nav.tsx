import styles from './Nav.module.scss';
import { NavItem, NavItemType } from '@/components/nav/NavItem';
import useHash from '@/hooks/useHash';
import { useEffect, useRef, useState } from 'react';
import { getFirstVisibleElement } from '@/utils/getFirstVisibleElement';

export type NavProps = {
    navItems: NavItemType[];
    title?: string;
};

export function Nav({ navItems, title }: NavProps) {
    const [menuOpen, setMenuOpen] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const currentHash = useHash();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Derive `active` on each render from the current prop instead of mutating in state.
    // This is what fixes the "stale nav after login" bug — the prop is now the source of truth.
    const computedItems = navItems.map((item) => ({
        ...item,
        active:
            item.target === currentHash ||
            item.target === currentPath ||
            (activeSectionId !== null && item.target === `#${activeSectionId}`),
    }));

    // Close the menu whenever the hash changes (user tapped a hash link) — but not on mount.
    const hasMounted = useRef(false);
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        setMenuOpen(false);
    }, [currentHash]);

    // Track which section is currently in view (for section-based active state on scroll).
    useEffect(() => {
        const handleScrollEnd = () => {
            const el = getFirstVisibleElement();
            if (el) {
                setActiveSectionId(el.id);
                setMenuOpen(false);
            }
        };
        window.addEventListener('scrollend', handleScrollEnd);
        return () => window.removeEventListener('scrollend', handleScrollEnd);
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    return (
        <div className={styles.nav}>
            <div className={styles.hamburger} onClick={toggleMenu}>
                <span
                    className={`material-symbols-outlined ${menuOpen ? styles.goOff : styles.goOn}`}>
                    menu
                </span>
                <span
                    className={`material-symbols-outlined ${menuOpen ? styles.goOn : styles.goOff}`}>
                    menu_open
                </span>
            </div>
            <a href={'#top'} className={styles.jav}>
                {title ?? 'Joseph Adam Velez'}
            </a>
            <div className={`${styles.navList} ${menuOpen ? styles.open : styles.closed}`}>
                {computedItems.map((navItem) => {
                    return <NavItem navItem={navItem} key={navItem.name} />;
                })}
            </div>
        </div>
    );
}
