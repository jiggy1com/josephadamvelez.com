// if you change the breakpoints here also make sure to update _mixins.scss
const breakpoints = {
    mobile: {
        min: 0,
        max: 480,
    },
    tablet: {
        min: 481,
        max: 1399,
    },
    desktop: {
        min: 1400,
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
        return width >= this.getBreakpointMin('mobile') && width <= this.getBreakpointMax('mobile');
    }

    isTablet() {
        const width = window.innerWidth;
        return width >= this.getBreakpointMin('tablet') && width <= this.getBreakpointMax('tablet');
    }

    isDesktop() {
        const width = window.innerWidth;
        return (
            width >= this.getBreakpointMin('desktop') && width <= this.getBreakpointMax('desktop')
        );
    }
}
