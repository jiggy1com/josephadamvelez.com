import React from 'react';

export default function DefaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <h1>default layout </h1>
            {children}
        </>
    );
}
