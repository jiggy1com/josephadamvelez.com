import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import reactPlugin from 'eslint-plugin-react';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
    {
        plugins: {
            files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
            plugins: {
                react: reactPlugin,
            },
            rules: {
                // Enable the rule with specific options
                'react/jsx-max-props-per-line': [
                    'error',
                    {
                        maximum: 2, // Allows a maximum of 2 props on a single line
                        when: 'single', // Applies this maximum when the JSX tag is on a single line
                    },
                ],
                // Example of setting different limits for single vs multi-line elements
                // 'react/jsx-max-props-per-line': ['error', {
                //   maximum: { single: 3, multi: 1 },
                // }],
                // ... other rules
            },
            settings: {
                react: {
                    version: 'detect', // Automatically detects the React version
                },
            },
        },
    },
]);

export default eslintConfig;
