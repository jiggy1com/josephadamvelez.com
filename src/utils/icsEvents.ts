import ical from 'node-ical';
import type { IcsFeed } from '@/utils/adminQueries';

// FullCalendar-compatible event shape our clients render directly.
export type UnifiedEvent = {
    id: string;
    title: string;
    start: string;       // ISO datetime string
    end?: string;
    allDay?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    classNames?: string[];
    extendedProps?: Record<string, unknown>;
};

type NodeIcalEvent = {
    type?: string;
    uid?: string;
    summary?: string;
    start?: Date;
    end?: Date;
    datetype?: string;   // 'date' means all-day, 'date-time' means timed
    location?: string;
    description?: string;
    url?: string;
    rrule?: {
        between: (from: Date, to: Date, inclusive?: boolean) => Date[];
        options?: { dtstart?: Date };
    };
};

// All-day dates from node-ical are local-midnight Dates. toISOString() would shift
// them to UTC and the browser would render them on the previous day, so emit a
// plain YYYY-MM-DD string using local getters instead.
function toLocalDateString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatEventDate(d: Date, allDay: boolean): string {
    return allDay ? toLocalDateString(d) : d.toISOString();
}

// Fetch and parse a single ICS feed, returning events that overlap [from, to].
// Recurring events (rrule) are expanded within the window; single events are filtered.
export async function fetchIcsFeedEvents(
    feed: IcsFeed,
    from: Date,
    to: Date,
): Promise<UnifiedEvent[]> {
    let raw: Record<string, NodeIcalEvent>;
    try {
        // node-ical accepts webcal:// too, but our fetch layer might not — normalize to https.
        const url = feed.url.replace(/^webcal:\/\//i, 'https://');
        raw = (await ical.async.fromURL(url)) as Record<string, NodeIcalEvent>;
    } catch (e) {
        console.error(`[icsEvents] failed to fetch ${feed.name} (${feed.url}):`, e);
        return [];
    }

    const results: UnifiedEvent[] = [];
    const color = feed.color ?? undefined;

    for (const key in raw) {
        const evt = raw[key];
        if (!evt || evt.type !== 'VEVENT' || !evt.start) continue;

        const isAllDay = evt.datetype === 'date';
        const title = evt.summary ?? '(no title)';
        const uid = evt.uid ?? key;

        if (evt.rrule) {
            // Recurring event — expand all occurrences within the window.
            const dates = evt.rrule.between(from, to, true);
            for (const occDate of dates) {
                const start = new Date(occDate);
                // Duration from the master event
                const duration =
                    evt.end && evt.start
                        ? evt.end.getTime() - evt.start.getTime()
                        : 0;
                let end: Date | undefined;
                if (duration && isAllDay) {
                    // Add whole days via setDate so DST shifts don't push the end off midnight.
                    end = new Date(start);
                    end.setDate(end.getDate() + Math.round(duration / 86400000));
                } else if (duration) {
                    end = new Date(start.getTime() + duration);
                }
                results.push({
                    id: `ics-${feed.icsFeedId}-${uid}-${start.toISOString()}`,
                    title,
                    start: formatEventDate(start, isAllDay),
                    end: end ? formatEventDate(end, isAllDay) : undefined,
                    allDay: isAllDay,
                    backgroundColor: color,
                    borderColor: color,
                    classNames: ['fc-event-ics'],
                    extendedProps: {
                        source: 'ics',
                        icsFeedId: feed.icsFeedId,
                        feedName: feed.name,
                        location: evt.location ?? null,
                        description: evt.description ?? null,
                        url: evt.url ?? null,
                    },
                });
            }
        } else {
            // Single (non-recurring) event
            const start = evt.start;
            if (start < from || start > to) continue;
            results.push({
                id: `ics-${feed.icsFeedId}-${uid}`,
                title,
                start: formatEventDate(start, isAllDay),
                end: evt.end ? formatEventDate(evt.end, isAllDay) : undefined,
                allDay: isAllDay,
                backgroundColor: color,
                borderColor: color,
                classNames: ['fc-event-ics'],
                extendedProps: {
                    source: 'ics',
                    icsFeedId: feed.icsFeedId,
                    feedName: feed.name,
                    location: evt.location ?? null,
                    description: evt.description ?? null,
                    url: evt.url ?? null,
                },
            });
        }
    }

    return results;
}

// Fetch all provided feeds in parallel and return the flat merged list.
// A failure in one feed doesn't sink the whole response — we swallow it in fetchIcsFeedEvents.
export async function fetchAllIcsFeedEvents(
    feeds: IcsFeed[],
    from: Date,
    to: Date,
): Promise<UnifiedEvent[]> {
    const active = feeds.filter((f) => f.active);
    const perFeed = await Promise.all(active.map((f) => fetchIcsFeedEvents(f, from, to)));
    return perFeed.flat();
}
