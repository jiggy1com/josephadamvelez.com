import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg, EventInput, EventSourceFuncArg } from '@fullcalendar/core';
import type { UnifiedEvent } from '@/utils/icsEvents';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Modal } from '@/components/modal/Modal';
import { VIEWPORT_HEIGHT_MINUS_NAV } from '@/constants/layout';

function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Human-readable date/time for the details modal.
function formatEventTime(start: Date | null, end: Date | null, allDay: boolean): string {
    if (!start) return '';
    if (allDay) {
        return start.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    const datePart = start.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const startTime = start.toLocaleTimeString(undefined, timeOpts);
    if (!end) return `${datePart} · ${startTime}`;
    // Same-day: only show the end time. Different day: show the whole end datetime.
    const sameDay =
        start.toDateString() === end.toDateString();
    const endStr = sameDay
        ? end.toLocaleTimeString(undefined, timeOpts)
        : end.toLocaleString(undefined, { ...timeOpts, month: 'short', day: 'numeric' });
    return `${datePart} · ${startTime} – ${endStr}`;
}

type EventDetails = {
    title: string;
    when: string;
    location: string | null;
    description: string | null;
    url: string | null;
    feedName: string | null;
};

async function fetchEvents(info: EventSourceFuncArg): Promise<EventInput[]> {
    const from = toISODate(info.start);
    const to = toISODate(info.end);
    const res = await fetch(`/api/bruh/calendar/events?from=${from}&to=${to}`, {
        cache: 'no-store',
    });
    const json = (await res.json()) as { success: boolean; data?: UnifiedEvent[] };
    return json.success && json.data ? (json.data as EventInput[]) : [];
}

export function BruhCalendar() {
    const [details, setDetails] = useState<EventDetails | null>(null);

    const onEventClick = (info: EventClickArg) => {
        const props = info.event.extendedProps as {
            source?: string;
            feedName?: string;
            location?: string | null;
            description?: string | null;
            url?: string | null;
        };
        // Only ICS events have details worth showing; meal-plan clicks are a no-op here.
        if (props.source !== 'ics') return;
        setDetails({
            title: info.event.title,
            when: formatEventTime(info.event.start, info.event.end, info.event.allDay),
            location: props.location ?? null,
            description: props.description ?? null,
            url: props.url ?? null,
            feedName: props.feedName ?? null,
        });
    };

    return (
        <Flex flexDirection={'column'} height={VIEWPORT_HEIGHT_MINUS_NAV}>
            <FlexItem flexGrow={1} minHeight={'0'}>
                <Flex height={'100%'}>
                    <FlexItem>
                        {/* Elfsight Weather */}
                        <script src={'https://elfsightcdn.com/platform.js'} async />
                        <div
                            className={'elfsight-app-92052c96-2b03-40c6-a35e-896ca0da256a'}
                            data-elfsight-app-lazy={''}
                        />
                    </FlexItem>
                    <FlexItem flexGrow={1}>
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView={'dayGridMonth'}
                            height={'100%'}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek',
                            }}
                            events={fetchEvents}
                            eventClick={onEventClick}
                            weekends={true}
                            dayMaxEvents={false}
                        />
                    </FlexItem>
                </Flex>
            </FlexItem>

            {details && (
                <Modal onClose={() => setDetails(null)}>
                    <div style={{ color: 'black' }}>
                        <h2 style={{ marginBottom: '5px' }}>{details.title}</h2>
                        {details.feedName && (
                            <p style={{ opacity: 0.6, fontStyle: 'italic', marginBottom: '15px' }}>
                                {details.feedName}
                            </p>
                        )}
                        <p style={{ marginBottom: '15px' }}>{details.when}</p>
                        {details.location && (
                            <p style={{ marginBottom: '15px' }}>
                                <strong>Location:</strong>{' '}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.location)}`}
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}>
                                    {details.location}
                                </a>
                            </p>
                        )}
                        {details.description && (
                            <p
                                style={{
                                    marginBottom: '15px',
                                    whiteSpace: 'pre-wrap',
                                }}>
                                <strong>Details:</strong> {details.description}
                            </p>
                        )}
                        {details.url && (
                            <p>
                                <a
                                    href={details.url}
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}>
                                    Open link
                                </a>
                            </p>
                        )}
                    </div>
                </Modal>
            )}
        </Flex>
    );
}
