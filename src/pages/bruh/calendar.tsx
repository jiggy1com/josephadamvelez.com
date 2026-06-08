import { BruhNav } from '@/components/bruh/BruhNav';
import { BruhCalendar } from '@/components/bruh/BruhCalendar';

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
