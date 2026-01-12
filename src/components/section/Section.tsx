import React, {useEffect, useRef, useState} from "react";
import useHash from "@/hooks/useHash";
import {useInView} from "react-intersection-observer";

type useInViewOptions = {
    id: string; // Unique identifier for the element being observed
    rootMargin?: string;
    threshold?: number;
    triggerOnce?: boolean;
}

export function Section({children, id, className, ...rest}: {
    children: React.ReactNode;
    id: string,
    className?: string
}) {

    // const currentHash = useHash()
    // const [state, setState] = useState({
    //
    //
    //     goingToHash: '#top',
    // })
    //
    // useEffect(() => {
    //     console.log('detected state.goingToHash change:', state.goingToHash, currentHash);
    //     if (currentHash !== state.goingToHash) {
    //         console.log('should be scrolling to hash:', state.goingToHash);
    //         document.location.hash = state.goingToHash
    //     }
    // }, [state.goingToHash])
    //
    // const useInViewWrapper = (useInViewOptions: useInViewOptions) => {
    //
    //     // inView reflects if the element is currently in the viewport
    //     const {ref, inView, entry} = useInView({
    //         triggerOnce: false,
    //         ...useInViewOptions,
    //     });
    //
    //     useEffect(() => {
    //         if (entry) {
    //
    //
    //             let found = false;
    //             const list = document.querySelectorAll('section[id]')
    //             console.log('Entry observed for', useInViewOptions.id, 'In view:', inView);
    //             console.log('list', list);
    //             if (inView) {
    //                 list.forEach((el) => {
    //                     const scrollTo = el.getAttribute('id');
    //                     console.log('id', id, 'scrollTo', scrollTo);
    //                     if (id !== scrollTo) {
    //                         console.log('changing state to scroll to:', scrollTo);
    //
    //                         setState((prevState) => {
    //                             return {
    //                                 ...prevState,
    //                                 goingToHash: `#${scrollTo}`
    //                             }
    //                         })
    //                     }
    //                 })
    //                 // found = true;
    //                 // document.location.hash = id;
    //             }
    //         }
    //     }, [inView, entry]);
    //
    //     return ref;
    // };
    //
    // const ref = useInViewWrapper({
    //     id: id,
    //     // rootMargin: '0px 0px 0px 0px',
    //     threshold: 0,
    //     triggerOnce: false,
    // });
    //
    //
    // useEffect(() => {
    //
    //     const handleScroll = () => {
    //
    //     }
    //
    //     const handleScrollEnd = () => {
    //
    //     }
    //
    //     window.addEventListener('scroll', handleScroll);
    //     window.addEventListener('scrollend', handleScrollEnd);
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //         window.removeEventListener('scrollend', handleScrollEnd);
    //     };
    // }, []);

    const ref = useRef(null);

    return (
        <section id={id} ref={ref} className={className}>
            <article>
                {children}
            </article>
        </section>
    )
}