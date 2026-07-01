"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed CRUD collection for the Elise demo master-data pages
 * (products, brands, categories, suppliers, employees, stores...).
 *
 * Seeds from the bundled mock data on first use, then persists any edits so the
 * demo feels like a real CRUD app within a browser session. `reset()` restores
 * the original seed data.
 */
export interface WithId {
    id: string;
}

export function useCrudCollection<T extends WithId>(
    key: string,
    seed: T[]
): {
    items: T[];
    add: (item: T) => void;
    update: (id: string, patch: Partial<T>) => void;
    remove: (id: string) => void;
    reset: () => void;
    ready: boolean;
} {
    const [items, setItems] = useState<T[]>(seed);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                setItems(JSON.parse(raw));
            } else {
                setItems(seed);
            }
        } catch {
            setItems(seed);
        }
        setReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const persist = useCallback(
        (next: T[]) => {
            try {
                localStorage.setItem(key, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        },
        [key]
    );

    const add = useCallback(
        (item: T) => setItems((prev) => persist([item, ...prev])),
        [persist]
    );

    const update = useCallback(
        (id: string, patch: Partial<T>) =>
            setItems((prev) => persist(prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))),
        [persist]
    );

    const remove = useCallback(
        (id: string) => setItems((prev) => persist(prev.filter((it) => it.id !== id))),
        [persist]
    );

    const reset = useCallback(() => {
        try {
            localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
        setItems(seed);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { items, add, update, remove, reset, ready };
}
