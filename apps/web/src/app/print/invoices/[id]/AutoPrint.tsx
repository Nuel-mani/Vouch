"use client";

import { useEffect } from 'react';

export function AutoPrint() {
    useEffect(() => {
        // slight delay to ensure styles are loaded
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return null;
}
