"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    start: number;
    end: number;
    onPageChange: (page: number) => void;
    /** Noun shown in the summary, e.g. "sản phẩm". Defaults to "mục". */
    unit?: string;
}

function pageWindow(current: number, total: number, span = 5): number[] {
    const half = Math.floor(span / 2);
    let from = Math.max(1, current - half);
    const to = Math.min(total, from + span - 1);
    from = Math.max(1, to - span + 1);
    const pages: number[] = [];
    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
}

const btnBase =
    "flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({
    page,
    totalPages,
    total,
    start,
    end,
    onPageChange,
    unit = "mục",
}: PaginationProps) {
    if (total === 0) return null;
    const pages = pageWindow(page, totalPages);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <span className="text-slate-500">
                Hiển thị <span className="font-medium text-slate-700">{start}–{end}</span> trên{" "}
                <span className="font-medium text-slate-700">{total}</span> {unit}
            </span>
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        className={cn(btnBase, "text-slate-600 hover:bg-slate-100")}
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Trang trước"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {pages[0] > 1 && <span className="px-1 text-slate-400">…</span>}
                    {pages.map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={cn(
                                btnBase,
                                p === page
                                    ? "border-custom bg-custom font-semibold text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                    {pages[pages.length - 1] < totalPages && <span className="px-1 text-slate-400">…</span>}
                    <button
                        className={cn(btnBase, "text-slate-600 hover:bg-slate-100")}
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Trang sau"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
