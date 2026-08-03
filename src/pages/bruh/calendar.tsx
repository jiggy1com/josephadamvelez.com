import dynamic from 'next/dynamic';
import { BruhNav } from '@/components/bruh/BruhNav';

// FullCalendar accesses window on mount — keep it out of SSR.
const BruhCalendar = dynamic(
    () => import('@/components/bruh/BruhCalendar').then((mod) => mod.BruhCalendar),
    { ssr: false },
);

export function getServerSideProps() {
    return {
        props: {
            title: 'Bruh Calendar',
        },
    };
}

export default function Calendar() {
    return (
        <div>
            <BruhNav />
            <BruhCalendar />
        </div>
    );
}
