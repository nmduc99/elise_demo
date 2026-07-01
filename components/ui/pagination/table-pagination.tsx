"use client";

import { PageSizeSelector } from "./page-size-selector";
import { PaginationWithInput } from "./pagination-with-input";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20, 50, 100],
  className = "",
}: TablePaginationProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-2.5 bg-white ${className}`}>
      {/* Left side - Page Size Selector */}
      <PageSizeSelector
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />

      {/* Right side - Pagination Controls */}
      <PaginationWithInput
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
}

