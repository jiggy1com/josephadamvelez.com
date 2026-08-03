// if you change the breakpoints here also make sure to update _mixins.scss
const breakpoints = {
    mobile: {
        min: 0,
        max: 479,
    },
    mobileLandscape: {
        min: 480,
        max: 779,
    },
    tablet: {
        min: 780,
        max: 1023,
    },
    tabletLandscape: {
        min: 1024,
        max: 1339,
    },
    desktop: {
        min: 1440,
        max: 1919,
    },
    desktopWide: {
        min: 1920,
        max: 9999,
    },
};

export class Breakpoints {
    breakpoints = breakpoints;

    constructor() {
        this.breakpoints = { ...breakpoints };
    }

    getBreakpoint(name: keyof typeof breakpoints) {
        return this.breakpoints[name];
    }

    getBreakpointMin(name: keyof typeof breakpoints) {
        return this.breakpoints[name].min;
    }

    getBreakpointMax(name: keyof typeof breakpoints) {
        return this.breakpoints[name].max;
    }

    getAllBreakpoints() {
        return this.breakpoints;
    }

    getWindowInnerWidth() {
        return typeof window !== 'undefined' ? window.innerWidth : 0;
    }

    isMobile() {
        const width = this.getWindowInnerWidth();
        return (
            width >= this.getBreakpointMin('mobile') &&
            width <= this.getBreakpointMax('mobileLandscape')
        );
    }

    isTablet() {
        const width = this.getWindowInnerWidth();
        return (
            width >= this.getBreakpointMin('tablet') &&
            width <= this.getBreakpointMax('tabletLandscape')
        );
    }

    isTabletLandscape() {
        const width = this.getWindowInnerWidth();
        return (
            width >= this.getBreakpointMin('tabletLandscape') &&
            width <= this.getBreakpointMax('tabletLandscape')
        );
    }

    isDesktop() {
        const width = this.getWindowInnerWidth();
        return (
            width >= this.getBreakpointMin('desktop') && width <= this.getBreakpointMax('desktop')
        );
    }

    isDesktopWide() {
        const width = this.getWindowInnerWidth();
        return width >= this.getBreakpointMin('desktopWide');
    }

    getCurrentBreakpointName() {
        const width = this.getWindowInnerWidth();
        const entries = Object.entries(breakpoints) as [
            keyof typeof breakpoints,
            { min: number; max: number },
        ][];
        for (const [name, range] of entries) {
            if (width >= range.min && width <= range.max) {
                return name;
            }
        }
        return null;
    }
}
