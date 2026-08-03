import dynamic from 'next/dynamic';
import { Section } from '@/components/section/Section';

// FullCalendar touches window on mount, so keep it out of SSR.
const BruhAdminCalendar = dynamic(
    () =>
        import('@/components/bruh/admin/BruhAdminCalendar').then(
            (mod) => mod.BruhAdminCalendar,
        ),
    { ssr: false },
);

export default function BruhAdminCalendarPage() {
    return (
        <>
            <Section id={'bruh-admin-calendar-header'} className={'admin-section'}>
                <h1>Calendar</h1>
            </Section>
            <Section
                id={'bruh-admin-calendar'}
                className={'admin-section'}
                removeArticle={true}>
                <BruhAdminCalendar />
            </Section>
        </>
    );
}
