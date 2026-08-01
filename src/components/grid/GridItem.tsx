type GridItemProps = {
    children: React.ReactNode;
    gridColumn?: string;
    gridColumnStart?: string | number;
    gridColumnEnd?: string | number;
    gridRow?: string;
    gridRowStart?: string | number;
    gridRowEnd?: string | number;
    gridArea?: string;
    justifySelf?: 'start' | 'end' | 'center' | 'stretch';
    alignSelf?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
    placeSelf?: string;
    height?: string;
    minHeight?: string;
    width?: string;
    minWidth?: string;
    className?: string;
};

export function GridItem({
    children,
    className = '',
    gridColumn,
    gridColumnStart,
    gridColumnEnd,
    gridRow,
    gridRowStart,
    gridRowEnd,
    gridArea,
    justifySelf,
    alignSelf,
    placeSelf,
    height,
    minHeight,
    width,
    minWidth,
}: GridItemProps) {
    const styles = {
        gridColumn,
        gridColumnStart,
        gridColumnEnd,
        gridRow,
        gridRowStart,
        gridRowEnd,
        gridArea,
        justifySelf,
        alignSelf,
        placeSelf,
        height,
        minHeight,
        width,
        minWidth,
    };

    return (
        <div style={styles} className={className}>
            {children}
        </div>
    );
}
