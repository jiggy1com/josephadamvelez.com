import styles from './Nav.module.scss';
import { NavItem, NavItemType } from '@/components/nav/NavItem';
import useHash from '@/hooks/useHash';
import { useEffect, useState } from 'react';
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

    // Derive `active` on each render from the current prop.
    const computedItems = navItems.map((item) => ({
        ...item,
        active:
            item.target === currentHash ||
            item.target === currentPath ||
            (activeSectionId !== null && item.target === `#${activeSectionId}`),
    }));

    // Track which section is currently in view for active-state highlighting.
    // Deliberately does NOT touch menuOpen — scrollend fires during page navigation
    // on Android Chrome, which would spuriously close the menu and then the fresh
    // page mount would re-open it. Menu-close is user-driven now (see toggleMenu +
    // closeMenu below).
    useEffect(() => {
        const handleScrollEnd = () => {
            const el = getFirstVisibleElement();
            if (el) setActiveSectionId(el.id);
        };
        window.addEventListener('scrollend', handleScrollEnd);
        return () => window.removeEventListener('scrollend', handleScrollEnd);
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const closeMenu = () => setMenuOpen(false);

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
            <a href={'#top'} className={styles.jav} onClick={closeMenu}>
                {title ?? 'Joseph Adam Velez'}
            </a>
            <div className={`${styles.navList} ${menuOpen ? styles.open : styles.closed}`}>
                {computedItems.map((navItem) => {
                    return <NavItem navItem={navItem} key={navItem.name} onNavigate={closeMenu} />;
                })}
            </div>
        </div>
    );
}
