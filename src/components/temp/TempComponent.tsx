import { useEffect, useState } from 'react';

export function TempComponent() {

    const [state, setState] = useState({
        data: [],
    });

    useEffect(() => {
        const arr: {}[] = [];
        const items = () => {
            for (let i = 0; i < 20; i++) {
                arr.push({});
            }
        };
        items();
        // @ts-ignore
        setState((prevState: {
            data: {}[]
        }) => {
            return {
                ...prevState,
                data: [...arr],
            };
        });
    }, []);

    return (
        <>
            {state.data.map(() => {
                return (
                    <p>test</p>
                );
            })}
        </>
    );
}