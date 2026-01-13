import React, { useRef } from 'react';

type useInViewOptions = {
    id: string; // Unique identifier for the element being observed
    rootMargin?: string;
    threshold?: number;
    triggerOnce?: boolean;
};

export function Section({
    children,
    id,
    className,
    ...rest
}: {
    children: React.ReactNode;
    id: string;
    className?: string;
}) {
    const ref = useRef(null);

    return (
        <section id={id} ref={ref} className={className}>
            <article>{children}</article>
        </section>
    );
}
