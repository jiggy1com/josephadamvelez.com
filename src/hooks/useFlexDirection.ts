import { useEffect, useState } from 'react';
import { Breakpoints } from '@/utils/breakpoints';

export type Direction = 'column' | 'row' | 'row-reverse' | 'column-reverse';

export function useFlexDirection(): Direction {
    const [dir, setDir] = useState<Direction>('row');

    useEffect(() => {
        const bp = new Breakpoints();

        const compute = () => (bp.isMobile() || bp.isTablet() ? 'column' : 'row');

        const update = () => setDir(compute());

        update();

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return dir;
}
