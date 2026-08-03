import styles from './Nav.module.scss';
import { NavItem, NavItemType } from '@/components/nav/NavItem';
import useHash from '@/hooks/useHash';
import { useEffect, useState } from 'react';
import { getFirstVisibleElement } from '@/utils/getFirstVisibleElement';

export type NavProps = {
    navItems: NavItemType[];
    title?: string;
};

function isLeafActive(
    item: NavItemType,
    currentHash: string,
    currentPath: string,
    activeSectionId: string | null,
): boolean {
    if (!item.target) return false;
    return (
        item.target === currentHash ||
        item.target === currentPath ||
        (activeSectionId !== null && item.target === `#${activeSectionId}`)
    );
}

// Recursively annotate `active`. A group is active when its own target matches OR any
// descendant is active — that's what lights up the parent header when you're on a subpage.
function annotateActive(
    items: NavItemType[],
    currentHash: string,
    currentPath: string,
    activeSectionId: string | null,
): NavItemType[] {
    return items.map((item) => {
        if (item.children && item.children.length > 0) {
            const children = annotateActive(
                item.children,
                currentHash,
                currentPath,
                activeSectionId,
            );
            const active =
                isLeafActive(item, currentHash, currentPath, activeSectionId) ||
                children.some((c) => c.active);
            return { ...item, active, children };
        }
        return {
            ...item,
            active: isLeafActive(item, currentHash, currentPath, activeSectionId),
        };
    });
}

export function Nav({ navItems, title }: NavProps) {
    const [menuOpen, setMenuOpen] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const currentHash = useHash();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const computedItems = annotateActive(navItems, currentHash, currentPath, activeSectionId);

    // Track which section is currently in view for active-state highlighting.
    // Deliberately does NOT touch menuOpen — scrollend fires during page navigation
    // on Android Chrome, which would spuriously close the menu and then the fresh
    // page mount would re-open it. Menu-close is user-driven (see toggleMenu + closeMenu).
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
                    if (navItem.children && navItem.children.length > 0) {
                        return (
                            <div
                                key={navItem.name}
                                className={`${styles.navGroup} ${navItem.active ? styles.active : ''}`}>
                                <span className={styles.navGroupHeader}>{navItem.name}</span>
                                <div className={styles.navGroupChildren}>
                                    {navItem.children.map((child) => (
                                        <NavItem
                                            navItem={child}
                                            key={child.name}
                                            onNavigate={closeMenu}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return (
                        <NavItem navItem={navItem} key={navItem.name} onNavigate={closeMenu} />
                    );
                })}
            </div>
        </div>
    );
}
