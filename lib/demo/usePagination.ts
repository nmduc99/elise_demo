"use client";

import { useEffect, useMemo, useState } from "react";

export interface PaginationState<T> {
    page: number;
    setPage: (p: number) => void;
    totalPages: number;
    pageItems: T[];
    total: number;
    /** 1-based index of the first visible row (0 when empty). */
    start: number;
    /** 1-based index of the last visible row. */
    end: number;
    pageSize: number;
}

/**
 * Lightweight client-side pagination for the Elise demo tables. Resets to a
 * valid page when the underlying list shrinks (e.g. after delete/filter).
 */
export function usePagination<T>(items: T[], pageSize = 10): PaginationState<T> {
    const [page, setPage] = useState(1);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pageItems = useMemo(
        () => items.slice((page - 1) * pageSize, page * pageSize),
        [items, page, pageSize]
    );

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return { page, setPage, totalPages, pageItems, total, start, end, pageSize };
}
