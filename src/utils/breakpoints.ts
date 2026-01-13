// if you change the breakpoints here also make sure to update _mixins.scss
const breakpoints = {
    mobile: {
        min: 0,
        max: 480,
    },
    mobileLandscape: {
        min: 481,
        max: 780,
    },
    tablet: {
        min: 781,
        max: 1024,
    },
    tabletLandscape: {
        min: 1025,
        max: 1440,
    },
    desktop: {
        min: 1441,
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

    isMobile() {
        const width = window.innerWidth;
        return (
            width >= this.getBreakpointMin('mobile') &&
            width <= this.getBreakpointMax('mobileLandscape')
        );
    }

    isTablet() {
        const width = window.innerWidth;
        return (
            width >= this.getBreakpointMin('tablet') &&
            width <= this.getBreakpointMax('tabletLandscape')
        );
    }

    isTabletLandscape() {
        const width = window.innerWidth;
        return (
            width >= this.getBreakpointMin('tabletLandscape') &&
            width <= this.getBreakpointMax('tabletLandscape')
        );
    }

    isDesktop() {
        const width = window.innerWidth;
        return (
            width >= this.getBreakpointMin('desktop') && width <= this.getBreakpointMax('desktop')
        );
    }

    isDesktopWide() {
        const width = window.innerWidth;
        return width >= this.getBreakpointMin('desktopWide');
    }
}
