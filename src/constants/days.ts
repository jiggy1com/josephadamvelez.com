// Shared day-of-week constants. Lives outside adminQueries.ts specifically so client
// components can pull them without triggering the top-level `neon(process.env.DATABASE_URL)`
// call, which would blow up in the browser bundle where DATABASE_URL is undefined.

export const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
