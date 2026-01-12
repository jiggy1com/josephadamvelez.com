import styles from './Nav.module.scss';
import { Breakpoints } from '@/utils/breakpoints';

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

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
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
