import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import type {
    EventClickArg,
    EventDragStopArg,
    EventDropArg,
    EventInput,
    EventSourceFuncArg,
} from '@fullcalendar/core';
import type { DropArg } from '@fullcalendar/interaction';
import type { Meal, MealPlan, MealSlot } from '@/utils/adminQueries';
import { Modal } from '@/components/modal/Modal';

// Local-time date formatter — avoids the toISOString UTC skew.
function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

type PendingEdit = {
    mealPlansId: number;
    mealId: number;
    mealName: string;
    date: string;
    slot: MealSlot;
};

export function BruhAdminCalendar() {
    const calendarRef = useRef<FullCalendar | null>(null);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const trashRef = useRef<HTMLDivElement | null>(null);

    const [meals, setMeals] = useState<Meal[]>([]);
    const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);
    const [replaceMealId, setReplaceMealId] = useState<number | null>(null);

    // Load meals for sidebar + edit-modal dropdown.
    const loadMeals = async () => {
        const res = await fetch('/api/bruh/admin/meals/list', { cache: 'no-store' });
        const json = (await res.json()) as { success: boolean; data?: Meal[] };
        if (json.success && json.data) setMeals(json.data);
    };
    useEffect(() => {
        void loadMeals();
    }, []);

    // Wire the sidebar's meal cards into FullCalendar's external Draggable API.
    // Each card carries data-meal-id / data-meal-name; on drop we read those attrs
    // in FullCalendar's `drop` handler.
    useEffect(() => {
        const container = sidebarRef.current;
        if (!container) return;
        const draggable = new Draggable(container, {
            itemSelector: '.meal-draggable',
            eventData: (el) => ({
                title: el.getAttribute('data-meal-name') ?? '',
                // `create: false` — don't render a temp event on drop; we handle persistence + refetch.
                create: false,
            }),
        });
        return () => draggable.destroy();
    }, [meals.length]);

    const refetch = () => {
        calendarRef.current?.getApi().refetchEvents();
    };

    // FullCalendar's dynamic event source — fires on view range change.
    const fetchMealPlanEvents = async (info: EventSourceFuncArg): Promise<EventInput[]> => {
        const from = toISODate(info.start);
        const to = toISODate(info.end);
        const res = await fetch(
            `/api/bruh/admin/meal-plans/list?from=${from}&to=${to}`,
            { cache: 'no-store' },
        );
        const json = (await res.json()) as { success: boolean; data?: MealPlan[] };
        if (!json.success || !json.data) return [];
        return json.data.map((mp) => ({
            id: `meal-plan-${mp.mealPlansId}`,
            title: mp.mealName,
            start: mp.date,
            allDay: true,
            classNames: ['fc-event-meal'],
            extendedProps: {
                source: 'meal-plan',
                mealPlansId: mp.mealPlansId,
                mealId: mp.mealId,
                mealName: mp.mealName,
                slot: mp.slot,
            },
        }));
    };

    // External drop (from sidebar) — creates a meal_plan for the drop date, slot=dinner default.
    const onExternalDrop = async (info: DropArg) => {
        const el = info.draggedEl as HTMLElement;
        const mealId = Number(el.getAttribute('data-meal-id'));
        if (!mealId) return;
        const date = toISODate(info.date);
        await fetch('/api/bruh/admin/meal-plans/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealId, date, slot: 'dinner' }),
        });
        refetch();
    };

    // Existing event dragged to a new day — upsert to the new date+slot.
    const onEventDrop = async (info: EventDropArg) => {
        const mealId = info.event.extendedProps.mealId as number;
        const slot = info.event.extendedProps.slot as MealSlot;
        const start = info.event.start;
        if (!start) return;
        const date = toISODate(start);
        await fetch('/api/bruh/admin/meal-plans/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealId, date, slot }),
        });
        refetch();
    };

    // Drag ended — check if the pointer landed on the trash zone.
    // Firing before eventDrop so we can short-circuit by removing the event ourselves.
    const onEventDragStop = async (info: EventDragStopArg) => {
        const trash = trashRef.current;
        if (!trash) return;
        const rect = trash.getBoundingClientRect();
        const je = info.jsEvent as MouseEvent;
        const inTrash =
            je.clientX >= rect.left &&
            je.clientX <= rect.right &&
            je.clientY >= rect.top &&
            je.clientY <= rect.bottom;
        if (!inTrash) return;
        const mealPlansId = info.event.extendedProps.mealPlansId as number;
        info.event.remove(); // optimistic — prevents eventDrop from firing on the removed event
        await fetch('/api/bruh/admin/meal-plans/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealPlansId }),
        });
        refetch();
    };

    // Event clicked — open the edit modal.
    const onEventClick = (info: EventClickArg) => {
        const props = info.event.extendedProps;
        setPendingEdit({
            mealPlansId: props.mealPlansId as number,
            mealId: props.mealId as number,
            mealName: props.mealName as string,
            date: toISODate(info.event.start ?? new Date()),
            slot: props.slot as MealSlot,
        });
        setReplaceMealId(props.mealId as number);
    };

    const closeModal = () => {
        setPendingEdit(null);
        setReplaceMealId(null);
    };

    const saveReplace = async () => {
        if (!pendingEdit || replaceMealId === null) return;
        await fetch('/api/bruh/admin/meal-plans/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mealId: replaceMealId,
                date: pendingEdit.date,
                slot: pendingEdit.slot,
            }),
        });
        closeModal();
        refetch();
    };

    const deleteMealPlan = async () => {
        if (!pendingEdit) return;
        await fetch('/api/bruh/admin/meal-plans/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mealPlansId: pendingEdit.mealPlansId }),
        });
        closeModal();
        refetch();
    };

    return (
        <>
            <div className={'calendar-layout'}>
                <aside ref={sidebarRef} className={'calendar-sidebar'}>
                    <h3 className={'calendar-sidebar-title'}>Meals</h3>
                    {meals.length === 0 ? (
                        <p className={'calendar-sidebar-empty'}>
                            No meals yet. Add some in the Meals admin.
                        </p>
                    ) : (
                        <ul className={'calendar-sidebar-list'}>
                            {meals.map((m) => (
                                <li
                                    key={m.mealId}
                                    className={'meal-draggable'}
                                    data-meal-id={m.mealId}
                                    data-meal-name={m.name}>
                                    {m.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                <div className={'calendar-main'}>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView={'dayGridMonth'}
                        height={'auto'}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth',
                        }}
                        events={fetchMealPlanEvents}
                        editable={true}
                        droppable={true}
                        drop={(info) => void onExternalDrop(info)}
                        eventDrop={(info) => void onEventDrop(info)}
                        eventDragStop={(info) => void onEventDragStop(info)}
                        eventClick={onEventClick}
                        weekends={true}
                        dayMaxEvents={false}
                    />
                </div>
            </div>

            <div ref={trashRef} className={'calendar-trash'}>
                <span className={'material-symbols-outlined'}>delete</span>
                <span>Drag here to remove</span>
            </div>

            {pendingEdit && (
                <Modal onClose={closeModal}>
                    <div style={{ color: 'black' }}>
                        <h2 style={{ marginBottom: '10px' }}>Edit meal</h2>
                        <p style={{ marginBottom: '20px' }}>
                            <strong>{pendingEdit.date}</strong> · {pendingEdit.slot}
                        </p>
                        <div>
                            <label
                                htmlFor={'replace-meal'}
                                style={{ display: 'block', marginBottom: '5px' }}>
                                Replace with
                            </label>
                            <select
                                id={'replace-meal'}
                                value={replaceMealId ?? ''}
                                onChange={(e) => setReplaceMealId(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginBottom: '20px',
                                }}>
                                {meals.map((m) => (
                                    <option key={m.mealId} value={m.mealId}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                            }}>
                            <button
                                className={'button button-danger'}
                                onClick={() => void deleteMealPlan()}>
                                Delete
                            </button>
                            <button
                                className={'button'}
                                onClick={() => void saveReplace()}
                                disabled={
                                    replaceMealId === null ||
                                    replaceMealId === pendingEdit.mealId
                                }>
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
