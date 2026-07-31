type FlexProps = {
    children: React.ReactNode;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justifyContent?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly'
        | 'start'
        | 'end'
        | 'left'
        | 'right';
    alignItems?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'stretch'
        | 'baseline'
        | 'first baseline'
        | 'last baseline'
        | 'start'
        | 'end'
        | 'self-start'
        | 'self-end';
    alignContent?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'stretch'
        | 'baseline'
        | 'first baseline'
        | 'last baseline'
        | 'start'
        | 'end'
        | 'self-start'
        | 'self-end';
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    height?: string;
    minHeight?: string;
    width?: string;
    minWidth?: string;
    className?: string;
};

export function Flex({
    children,
    flexDirection,
    flexWrap,
    justifyContent,
    alignContent,
    alignItems,
    gap,
    rowGap,
    columnGap,
    height,
    minHeight,
    width,
    minWidth,
    className,
}: FlexProps) {
    const styles = {
        display: 'flex',
        flexDirection,
        flexWrap,
        justifyContent,
        alignContent,
        alignItems,
        gap,
        rowGap,
        columnGap,
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
