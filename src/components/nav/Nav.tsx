import styles from './Nav.module.scss';
import { NavItem, NavItemType } from '@/components/nav/NavItem';
import useHash from '@/hooks/useHash';
import { useEffect, useState } from 'react';
import { getFirstVisibleElement } from '@/utils/getFirstVisibleElement';
import { Breakpoints } from '@/utils/breakpoints';

const navItems = [
    // {
    //     name: 'Joseph Adam Velez',
    //     target: '#top',
    //     active: true,
    // },
    {
        name: 'About',
        target: '#about',
        active: false,
    },
    {
        name: 'Skills',
        target: '#skills',
        active: false,
    },

    {
        name: 'Portfolio',
        target: '#portfolio',
        active: false,
    },
    {
        name: 'Side Projects',
        target: '#side-projects',
        active: false,
    },
    {
        name: 'Resume',
        target: '#resume',
        active: false,
    },
    {
        name: 'Social',
        target: '#social',
        active: false,
    },
    {
        name: 'Contact',
        target: '#contact',
        active: false,
    },
] as NavItemType[];

export function Nav() {
    const [state, setState] = useState({
        navItems,
        menuOpen: true,
    });
    const currentHash = useHash();

    const updateActiveNavItem = () => {
        const updatedNavItems = state.navItems.map((navItem) => {
            navItem.active = navItem.target === currentHash;
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
        const handleScrollEnd = () => {
            const el = getFirstVisibleElement();

            if (el) {
                const id = `#${el.id}`;
                setState((prevState) => {
                    const updatedNavItems = prevState.navItems.map((navItem) => {
                        navItem.active = navItem.target === id;
                        return navItem;
                    });
                    return {
                        ...prevState,
                        navItems: [...updatedNavItems],
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
                Joseph Adam Velez
            </a>
            <div className={`${styles.navList} ${state.menuOpen ? styles.open : styles.closed}`}>
                {state.navItems.map((navItem) => {
                    return <NavItem navItem={navItem} key={navItem.name} />;
                })}
            </div>
        </div>
    );
}
