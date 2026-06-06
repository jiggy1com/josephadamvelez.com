import styles from '@/components/nav/Nav.module.scss';
import React from 'react';
import { useRouter } from 'next/router';

export function BruhNav() {
    const [state, setState] = React.useState({
        navItems: [
            {
                name: 'Calendar',
                target: '/bruh/calendar',
                active: false,
            },
            {
                name: 'Chores',
                target: '/bruh/chores',
                active: false,
            },
        ],
        menuOpen: false,
    });

    const router = useRouter();

    return (
        <div className={styles.nav}>
            <div
                className={styles.hamburger}
                onClick={() => {
                    // toggleMenu
                }}>
                {/*<span*/}
                {/*    className={`material-symbols-outlined ${state.menuOpen ? styles.goOff : styles.goOn}`}>*/}
                {/*    menu*/}
                {/*</span>*/}
                {/*<span*/}
                {/*    className={`material-symbols-outlined ${state.menuOpen ? styles.goOn : styles.goOff}`}>*/}
                {/*    menu_open*/}
                {/*</span>*/}
            </div>
            <a href={'#top'} className={styles.jav}>
                {/*Joseph Adam Velez*/}
            </a>
            <div className={`${styles.navList} ${state.menuOpen ? styles.open : styles.closed}`}>
                {state.navItems.map((navItem) => {
                    const activeClass = router.pathname.includes(navItem.target)
                        ? styles.active
                        : '';
                    return (
                        <a key={navItem.name} href={navItem.target} className={activeClass}>
                            {navItem.name}
                        </a>
                    );
                    // return <NavItem navItem={navItem} key={navItem.name} />;
                })}
            </div>
        </div>
    );
}
