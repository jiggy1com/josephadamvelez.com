import { useEffect, useState } from 'react';
import { Breakpoints } from '@/utils/breakpoints';

export type BreakpointName =
    | 'mobile'
    | 'mobileLandscape'
    | 'tablet'
    | 'tabletLandscape'
    | 'desktop'
    | 'desktopWide';

export function useBreakpoint(defaultName: BreakpointName = 'desktop'): BreakpointName {
    const [name, setName] = useState<BreakpointName>(defaultName);

    useEffect(() => {
        const bp = new Breakpoints();

        const update = () => {
            const current = bp.getCurrentBreakpointName();
            if (current) setName(current);
        };

        update();

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return name;
}
