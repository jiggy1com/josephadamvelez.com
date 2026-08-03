import { useEffect, useState } from 'react';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { Profile, Task } from '@/utils/adminQueries';
import { DAYS_OF_WEEK, type DayOfWeek } from '@/constants/days';

type Link = { profilesId: number; tasksId: number };

function linkKey(profilesId: number, tasksId: number): string {
    return `${profilesId}:${tasksId}`;
}

// Small helper — how do we describe the recurrence? Empty/null = every day.
function daysLabel(days: DayOfWeek[] | null): string {
    if (!days || days.length === 0) return 'every day';
    // Preserve calendar order (sun→sat) regardless of input order.
    const ordered = DAYS_OF_WEEK.filter((d) => days.includes(d));
    return ordered.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
}

export default function BruhAdminTasksMatrix() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [links, setLinks] = useState<Set<string>>(new Set());
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const [pr, tr, lr] = await Promise.all([
                fetch('/api/bruh/admin/profiles/list').then((r) => r.json()),
                fetch('/api/bruh/admin/tasks/list').then((r) => r.json()),
                fetch('/api/bruh/admin/profiles-tasks/list').then((r) => r.json()),
            ]);
            if (pr.success) setProfiles(pr.data);
            if (tr.success) setTasks(tr.data);
            if (lr.success) {
                const s = new Set<string>();
                (lr.data as Link[]).forEach((l) => s.add(linkKey(l.profilesId, l.tasksId)));
                setLinks(s);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setAlert({ success: false, message: msg });
        }
    };

    useEffect(() => {
        void load();
    }, []);

    // Optimistic toggle — flip local set, fire API, on failure revert.
    const toggle = async (profilesId: number, tasksId: number, next: boolean) => {
        if (busy) return;
        setBusy(true);
        const key = linkKey(profilesId, tasksId);
        setLinks((prev) => {
            const s = new Set(prev);
            if (next) s.add(key);
            else s.delete(key);
            return s;
        });
        try {
            await fetch('/api/bruh/admin/add-or-remove-profiles-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilesId, tasksId, active: next }),
            });
        } catch (e) {
            // Revert on failure
            setLinks((prev) => {
                const s = new Set(prev);
                if (next) s.delete(key);
                else s.add(key);
                return s;
            });
            setAlert({
                success: false,
                message: e instanceof Error ? e.message : String(e),
            });
        } finally {
            setBusy(false);
        }
    };

    // "All" toggle per row — assigns task to every profile (or clears if already all).
    const toggleAll = async (tasksId: number) => {
        if (busy) return;
        const allAssigned = profiles.every((p) => links.has(linkKey(p.profilesId, tasksId)));
        const next = !allAssigned;
        // Fire toggles in parallel; optimistic UI already handles per-cell state.
        await Promise.all(
            profiles.map((p) => {
                const currently = links.has(linkKey(p.profilesId, tasksId));
                if (currently !== next) return toggle(p.profilesId, tasksId, next);
                return Promise.resolve();
            }),
        );
    };

    return (
        <>
            <Section id={'bruh-admin-tasks-matrix-header'} className={'admin-section'}>
                <h1>Task Matrix</h1>
            </Section>
            <Section
                id={'bruh-admin-tasks-matrix'}
                className={'admin-section'}
                removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />

                {tasks.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No tasks yet. Add some in the Tasks admin.
                    </p>
                )}
                {profiles.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        No profiles yet. Add some in the Profiles admin.
                    </p>
                )}

                {tasks.length > 0 && profiles.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={'matrix-table'}>
                            <thead>
                                <tr>
                                    <th className={'matrix-corner'}>Task</th>
                                    {profiles.map((p) => (
                                        <th key={p.profilesId} className={'matrix-profile-col'}>
                                            {p.name}
                                        </th>
                                    ))}
                                    <th className={'matrix-all-col'}>All</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => {
                                    const allAssigned = profiles.every((p) =>
                                        links.has(linkKey(p.profilesId, task.tasksId)),
                                    );
                                    return (
                                        <tr key={task.tasksId}>
                                            <td className={'matrix-task-cell'}>
                                                <div>{task.name}</div>
                                                <div className={'matrix-task-meta'}>
                                                    {daysLabel(task.daysOfWeek)}
                                                </div>
                                            </td>
                                            {profiles.map((p) => {
                                                const checked = links.has(
                                                    linkKey(p.profilesId, task.tasksId),
                                                );
                                                const id = `matrix-${p.profilesId}-${task.tasksId}`;
                                                return (
                                                    <td key={p.profilesId} className={'matrix-cell'}>
                                                        <label htmlFor={id}>
                                                            <input
                                                                id={id}
                                                                type={'checkbox'}
                                                                checked={checked}
                                                                onChange={(e) =>
                                                                    void toggle(
                                                                        p.profilesId,
                                                                        task.tasksId,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    </td>
                                                );
                                            })}
                                            <td className={'matrix-cell matrix-all-cell'}>
                                                <label>
                                                    <input
                                                        type={'checkbox'}
                                                        checked={allAssigned}
                                                        onChange={() =>
                                                            void toggleAll(task.tasksId)
                                                        }
                                                    />
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </>
    );
}
