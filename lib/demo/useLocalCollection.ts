"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Minimal localStorage-backed collection for interactive demo state
 * (warehouse transfers, POS sales). Resets cleanly so the demo is repeatable.
 */
export function useLocalCollection<T>(
    key: string
): [T[], (item: T) => void, () => void] {
    const [items, setItems] = useState<T[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) setItems(JSON.parse(raw));
        } catch {
            /* ignore */
        }
    }, [key]);

    const add = useCallback(
        (item: T) => {
            setItems((prev) => {
                const next = [item, ...prev];
                try {
                    localStorage.setItem(key, JSON.stringify(next));
                } catch {
                    /* ignore */
                }
                return next;
            });
        },
        [key]
    );

    const reset = useCallback(() => {
        setItems([]);
        try {
            localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
    }, [key]);

    return [items, add, reset];
}
