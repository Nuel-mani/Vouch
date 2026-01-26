'use client';

import { useEffect } from 'react';

export function CryptoPolyfill() {
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.crypto) {
            // @ts-expect-error - polyfilling crypto for older browsers
            window.crypto = {};
        }
        if (typeof window !== 'undefined' && !window.crypto.randomUUID) {
            // @ts-expect-error - polyfilling randomUUID for older browsers
            window.crypto.randomUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            console.log('OpCore: Polyfilled crypto.randomUUID for compatibility.');
        }
    }, []);

    return null;
}
