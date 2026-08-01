import { NavItemType } from '@/components/nav/NavItem';

export const navItems = [
    {
        // name: 'Joseph Adam Velez',
        name: '',
        target: '#top',
        active: false,
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

export const bruhNavItems = [
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
    {
        name: 'Map',
        target: '/bruh/map',
        active: false,
    },
    // skylight calendar
    // {
    //     name: 'Rewards',
    //     target: '/bruh/rewards',
    //     active: false,
    // },
    // {
    //     name: 'Meals',
    //     target: '/bruh/meals',
    //     active: false,
    // },
    // {
    //     name: 'Lists',
    //     target: '/bruh/lists',
    //     active: false,
    // },
] as NavItemType[];

export const bruhAdminNavItems = [
    {
        name: 'Bruh',
        target: '/bruh',
        active: false,
    },
    {
        name: 'Bruh Admin',
        target: '/bruh/admin',
        active: false,
    },
    {
        name: 'Profiles',
        target: '/bruh/admin/profiles',
        active: false,
    },
    {
        name: 'Chores',
        target: '/bruh/admin/chores/list',
        active: false,
    },
    {
        name: 'Chores Assignment',
        target: '/bruh/admin/chores-assignment',
        active: false,
    },
    {
        name: 'Rewards',
        target: '/bruh/admin/rewards',
        active: false,
    },
] as NavItemType[];
