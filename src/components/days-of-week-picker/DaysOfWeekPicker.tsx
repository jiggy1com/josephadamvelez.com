import { DAYS_OF_WEEK, type DayOfWeek } from '@/constants/days';

type DaysOfWeekPickerProps = {
    // Empty array = "every day" (semantically identical to null at the DB level).
    value: DayOfWeek[];
    onChange: (days: DayOfWeek[]) => void;
    disabled?: boolean;
};

// Shows two letters so mobile fits all seven pills in one row. Sunday/Saturday
// picked to disambiguate from Monday/Thursday at a glance.
const LABELS: Record<DayOfWeek, string> = {
    sun: 'Su',
    mon: 'Mo',
    tue: 'Tu',
    wed: 'We',
    thu: 'Th',
    fri: 'Fr',
    sat: 'Sa',
};

export function DaysOfWeekPicker({ value, onChange, disabled = false }: DaysOfWeekPickerProps) {
    const toggle = (day: DayOfWeek) => {
        if (disabled) return;
        onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
    };

    return (
        <div className={'days-of-week-picker'}>
            {DAYS_OF_WEEK.map((day) => {
                const selected = value.includes(day);
                return (
                    <button
                        key={day}
                        type={'button'}
                        className={`day-pill ${selected ? 'selected' : ''}`}
                        aria-pressed={selected}
                        aria-label={day}
                        disabled={disabled}
                        onClick={() => toggle(day)}>
                        {LABELS[day]}
                    </button>
                );
            })}
        </div>
    );
}
