// Palette of accent colors profiles can pick from. Curated (not free-form
// hex input) so admins can't paint a profile with a swatch that clashes with
// the dark UI or duplicates the app's primary. Hex values are also what gets
// persisted directly to profiles.color — no palette-name → hex indirection
// so future consumers just read the color off the profile and render.
export type ProfileColor = { name: string; value: string };

export const PROFILE_COLORS: ProfileColor[] = [
    { name: 'Coral', value: '#ff6b6b' },
    { name: 'Amber', value: '#f59f00' },
    { name: 'Lime', value: '#94d82d' },
    { name: 'Emerald', value: '#12b886' },
    { name: 'Sky', value: '#4dabf7' },
    { name: 'Indigo', value: '#5c7cfa' },
    { name: 'Violet', value: '#9775fa' },
    { name: 'Rose', value: '#e64980' },
];

// Fallback for profiles that haven't picked a color yet (or for legacy rows).
// Chosen to match --color-primary so the marker still reads as "app-native".
export const DEFAULT_PROFILE_COLOR = '#00b8a9';

export function resolveProfileColor(color: string | null | undefined): string {
    return color && color.trim() ? color : DEFAULT_PROFILE_COLOR;
}
