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
    removeArticle,
    ...rest
}: {
    children: React.ReactNode;
    id: string;
    className?: string;
    removeArticle?: boolean;
}) {
    const ref = useRef(null);

    return (
        <section id={id} ref={ref} className={className}>
            {removeArticle ? children : <article>{children}</article>}
        </section>
    );
}
