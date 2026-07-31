import { fontUbuntu } from '@/utils/fonts';

type FlexItemProps = {
    children: React.ReactNode;
    order?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: 0 | 'auto';
    alignSelf?:
        | 'auto'
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'baseline'
        | 'first baseline'
        | 'last baseline'
        | 'start'
        | 'end'
        | 'self-start'
        | 'self-end';
    height?: string;
    minHeight?: string;
    width?: string;
    minWidth?: string;
    className?: string;
};

export function FlexItem({
    children,
    className = '',
    order,
    flexBasis,
    flexGrow,
    flexShrink,
    alignSelf,
    height,
    minHeight,
    width,
    minWidth,
}: FlexItemProps) {
    const styles = {
        order,
        flexBasis,
        flexGrow,
        flexShrink,
        alignSelf,
        height,
        minHeight,
        width,
        minWidth,
    };

    const classNameList = className + fontUbuntu.className;

    return (
        <div style={styles} className={classNameList}>
            {children}
        </div>
    );
}
