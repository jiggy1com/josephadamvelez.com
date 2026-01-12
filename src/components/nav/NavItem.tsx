import styles from './Nav.module.scss';

export type NavItemType = {
    name: string;
    target: string;
    active: boolean;
};

type NavItemProps = {
    navItem: NavItemType;
};

export function NavItem({ navItem }: NavItemProps) {
    const activeClass = navItem.active ? styles.active : '';

    return (
        <a href={navItem.target} className={activeClass}>
            {navItem.name}
        </a>
    );
}
