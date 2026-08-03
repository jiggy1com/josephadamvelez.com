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
        name: 'Tasks',
        target: '/bruh/tasks',
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
        target: '/bruh/admin/profiles/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Tasks',
        target: '/bruh/admin/tasks/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Assign Tasks',
        target: '/bruh/admin/tasks/assign',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Meals',
        target: '/bruh/admin/meals/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Calendar',
        target: '/bruh/admin/calendar',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Calendars',
        target: '/bruh/admin/ics-feeds/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Rewards',
        target: '/bruh/admin/rewards',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Logout',
        target: '/bruh/admin/logout',
        active: false,
        requiresAuth: true,
    },
] as NavItemType[];
