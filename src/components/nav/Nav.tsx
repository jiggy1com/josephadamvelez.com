import styles from './Nav.module.scss';
import { NavItem, NavItemType } from '@/components/nav/NavItem';
import useHash from '@/hooks/useHash';
import { useEffect, useState } from 'react';
import { getFirstVisibleElement } from '@/utils/getFirstVisibleElement';

const navItems = [
    {
        name: 'Joseph Adam Velez',
        target: '#top',
        active: true,
    },
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
    });
    const currentHash = useHash();

    useEffect(() => {
        updateActiveNavItem();
    }, [currentHash]);

    const updateActiveNavItem = () => {
        const updatedNavItems = state.navItems.map((navItem) => {
            navItem.active = navItem.target === currentHash;
            return navItem;
        });

        setState((prevState) => {
            return {
                ...prevState,
                navItems: [...updatedNavItems],
            };
        });
    };

    useEffect(() => {
        const handleScrollEnd = () => {
            const el = getFirstVisibleElement();
            console.log('el', el);
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

    return (
        <div className={styles.nav}>
            {state.navItems.map((navItem) => {
                return <NavItem navItem={navItem} key={navItem.name} />;
            })}
        </div>
    );
}
