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
        name: 'Lists',
        target: '/bruh/lists',
        active: false,
    },
    {
        name: 'Map',
        target: '/bruh/map',
        active: false,
    },
    {
        name: 'Activity',
        target: '/bruh/activity',
        active: false,
    },
    {
        // Admin-only shortcut — only rendered for isAdmin sessions. Lets admins
        // jump into the admin area from their phone without typing the URL.
        name: 'Admin',
        target: '/bruh/admin',
        active: false,
        requiresAdmin: true,
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
        // Back-to-family shortcut. Any authenticated user can visit /bruh, so no
        // requiresAdmin flag — an admin who ends up on /bruh/admin can hop back
        // to the household view without editing the URL.
        name: 'Bruh',
        target: '/bruh',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Profiles',
        target: '/bruh/admin/profiles/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Devices',
        active: false,
        requiresAuth: true,
        children: [
            {
                name: 'Manage',
                target: '/bruh/admin/devices/list',
                active: false,
            },
            {
                name: 'Insights',
                target: '/bruh/admin/devices/insights',
                active: false,
            },
        ],
    },
    {
        name: 'Tasks',
        active: false,
        requiresAuth: true,
        children: [
            {
                name: 'Manage',
                target: '/bruh/admin/tasks/list',
                active: false,
            },
            {
                name: 'Assign by Profile',
                target: '/bruh/admin/tasks/assign',
                active: false,
            },
            {
                name: 'Assign by Task',
                target: '/bruh/admin/tasks/matrix',
                active: false,
            },
        ],
    },
    {
        name: 'Calendar',
        active: false,
        requiresAuth: true,
        children: [
            {
                name: '.ics Calendar Feeds',
                target: '/bruh/admin/ics-feeds/list',
                active: false,
            },
            {
                name: 'Meals List',
                target: '/bruh/admin/meals/list',
                active: false,
            },
            {
                name: 'Add Meals to Calendar',
                target: '/bruh/admin/calendar',
                active: false,
            },
        ],
    },
    {
        name: 'Lists',
        target: '/bruh/admin/lists/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Places',
        target: '/bruh/admin/places/list',
        active: false,
        requiresAuth: true,
    },
    {
        name: 'Smart Home',
        target: '/bruh/admin/smart-home',
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
