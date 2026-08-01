type GridProps = {
    children: React.ReactNode;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gridTemplateAreas?: string;
    gridAutoColumns?: string;
    gridAutoRows?: string;
    gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense' | 'dense';
    justifyItems?: 'start' | 'end' | 'center' | 'stretch';
    alignItems?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
    placeItems?: string;
    justifyContent?:
        | 'start'
        | 'end'
        | 'center'
        | 'stretch'
        | 'space-around'
        | 'space-between'
        | 'space-evenly';
    alignContent?:
        | 'start'
        | 'end'
        | 'center'
        | 'stretch'
        | 'space-around'
        | 'space-between'
        | 'space-evenly';
    placeContent?: string;
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    height?: string;
    minHeight?: string;
    width?: string;
    minWidth?: string;
    className?: string;
};

export function Grid({
    children,
    gridTemplateColumns,
    gridTemplateRows,
    gridTemplateAreas,
    gridAutoColumns,
    gridAutoRows,
    gridAutoFlow,
    justifyItems,
    alignItems,
    placeItems,
    justifyContent,
    alignContent,
    placeContent,
    gap,
    rowGap,
    columnGap,
    height,
    minHeight,
    width,
    minWidth,
    className,
}: GridProps) {
    const rawStyles: Record<string, string | undefined> = {
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows,
        gridTemplateAreas,
        gridAutoColumns,
        gridAutoRows,
        gridAutoFlow,
        justifyItems,
        alignItems,
        placeItems,
        justifyContent,
        alignContent,
        placeContent,
        gap,
        rowGap,
        columnGap,
        height,
        minHeight,
        width,
        minWidth,
    };
    const styles = Object.fromEntries(
        Object.entries(rawStyles).filter(([, v]) => v !== undefined),
    );
    return (
        <div style={styles} className={className}>
            {children}
        </div>
    );
}
