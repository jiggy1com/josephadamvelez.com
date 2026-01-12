/**
 * Get the first visible element in the viewport based on the provided query selector
 * as long as the top is above the halfway point of the viewport.
 * @param querySelectorAll
 */

export function getFirstVisibleElement(querySelectorAll: string | null = null): HTMLElement | null {
    if (!querySelectorAll) {
        // get all sections with an ID
        querySelectorAll = 'section[id]';
    }

    const children = Array.from(
        document.querySelectorAll(querySelectorAll) as NodeListOf<HTMLElement>,
    ); //.reverse();

    for (const child of children) {
        const style = window.getComputedStyle(child);
        if (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            child.offsetParent !== null
        ) {
            const halfwayPoint = window.innerHeight / 2;
            const bottomViewport = window.innerHeight;
            const bounding = child.getBoundingClientRect();

            // Check if the entire element is within the viewport
            if (bounding.top >= 0 && bounding.bottom <= bottomViewport) {
                return child;
            }

            // Check if the top is above the viewport but the bottom is below the halfway point
            if (bounding.top <= 0 && bounding.bottom >= halfwayPoint) {
                return child;
            }

            if (bounding.top <= 0 && bounding.bottom < halfwayPoint) {
                continue;
            }

            if (bounding.top >= 0 && bounding.bottom > bottomViewport) {
                return child;
            }
        }
    }

    return null;
}
