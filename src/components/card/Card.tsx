import React from 'react';

type CardProps = {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    trimHeader?: boolean;
    className?: string;
    children: React.ReactNode;
};

export function Card({
    header,
    footer,
    trimHeader = false,
    className = '',
    children,
}: CardProps) {
    const classList = ['card', className].filter(Boolean).join(' ');
    const headerClassList = ['card-header', trimHeader ? 'trim' : ''].filter(Boolean).join(' ');

    return (
        <div className={classList}>
            {header !== undefined && header !== '' && (
                <div className={headerClassList}>{header}</div>
            )}
            <div className={'card-body'}>{children}</div>
            {footer !== undefined && footer !== '' && (
                <div className={'card-footer'}>{footer}</div>
            )}
        </div>
    );
}
