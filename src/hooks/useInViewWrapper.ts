import {useInView} from "react-intersection-observer";
import {useEffect} from "react";

type useInViewOptions = {
    id: string; // Unique identifier for the element being observed
    rootMargin?: string;
    threshold?: number;
    triggerOnce?: boolean;
}

/**
 * Options for the useInViewWrapper hook
 * @param useInViewOptions
 */


const useInViewWrapper = (useInViewOptions: useInViewOptions) => {

    // inView reflects if the element is currently in the viewport
    const {ref, inView, entry} = useInView({
        triggerOnce: false,
        threshold: 0,
        ...useInViewOptions,
    });

    useEffect(() => {
        if (entry) {
            if (inView) {

            }
        }
    }, [inView, entry]);

    return ref;
};