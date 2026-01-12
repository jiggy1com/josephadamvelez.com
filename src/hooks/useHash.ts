'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';

const useHash = () => {
    // Ensure this runs only on the client side
    const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');
    const params = useParams(); // Use useParams to detect general route changes

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        // Listen for standard hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Update hash if params change (covering next/link clicks)
        setHash(typeof window !== 'undefined' ? window.location.hash : '');

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [params]); // Depend on params to catch navigations that change the path but might also affect hash logic

    return hash;
};

export default useHash;
