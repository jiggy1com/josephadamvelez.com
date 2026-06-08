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
    const [state, setState] = useState({
        navItems,
        menuOpen: true,
    });
    const currentHash = useHash();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const updateActiveNavItem = () => {
        const updatedNavItems = state.navItems.map((navItem) => {
            navItem.active = navItem.target === currentHash || navItem.target === currentPath;
            return navItem;
        });

        setState((prevState) => {
            return {
                ...prevState,
                menuOpen: false,
                navItems: [...updatedNavItems],
            };
        });
    };

    useEffect(() => {
        state.navItems.filter((item) => {
            if (item.active) {
                if (item.target !== currentHash) {
                    updateActiveNavItem();
                }
            }
        });
    }, [currentHash]);

    useEffect(() => {
        console.log('useEffect scroll');
        const handleScrollEnd = () => {
            const el = getFirstVisibleElement();
            if (el) {
                const id = `#${el.id}`;
                setState((prevState) => {
                    const updatedNavItems = prevState.navItems.map((navItem) => {
                        navItem.active = navItem.target === id || navItem.target === currentPath;
                        return navItem;
                    });
                    return {
                        ...prevState,
                        navItems: [...updatedNavItems],
                        menuOpen: false,
                    };
                });
            }
        };
        window.addEventListener('scrollend', handleScrollEnd);

        return () => {
            window.removeEventListener('scrollend', handleScrollEnd);
        };
    });

    const toggleMenu = () => {
        setState((prevState) => {
            return {
                ...prevState,
                menuOpen: !prevState.menuOpen,
            };
        });
    };

    return (
        <div className={styles.nav}>
            <div className={styles.hamburger} onClick={toggleMenu}>
                <span
                    className={`material-symbols-outlined ${state.menuOpen ? styles.goOff : styles.goOn}`}>
                    menu
                </span>
                <span
                    className={`material-symbols-outlined ${state.menuOpen ? styles.goOn : styles.goOff}`}>
                    menu_open
                </span>
            </div>
            <a href={'#top'} className={styles.jav}>
                {title ?? 'Joseph Adam Velez'}
            </a>
            <div className={`${styles.navList} ${state.menuOpen ? styles.open : styles.closed}`}>
                {state.navItems.map((navItem) => {
                    return <NavItem navItem={navItem} key={navItem.name} />;
                })}
            </div>
        </div>
    );
}
