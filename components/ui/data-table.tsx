"use client";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import React, { ReactNode, useMemo } from "react";
import { LoadingOverlay } from "./loading-overlay";

export interface ColumnConfig<T> {
  label: string;
  key: keyof T | string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  // Data
  items: T[];
  columns: ColumnConfig<T>[];

  // Sorting
  sortConfig?: { key: string; direction: "asc" | "desc" | null };
  onSort?: (key: string) => void;

  // Pin/Star functionality
  enablePinning?: boolean;
  pinnedItems?: Set<string>;
  onTogglePin?: (itemKey: string) => void;

  // Loading state
  isLoading?: boolean;
  loadingText?: string;

  // Empty state
  emptyText?: string;

  // Row expansion
  expandedRow?: string | null;
  onRowClick?: (item: T) => void;
  renderExpandedRow?: (item: T) => ReactNode;
  getRowKey: (item: T) => string;
  isRowExpanded?: (item: T) => boolean;

  // Summary row
  summaryRow?: ReactNode[];

  // Styling
  className?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  bodyRowClassName?:
    | string
    | ((item: T, isExpanded: boolean, isPinned: boolean) => string);
  containerClassName?: string;
}

export function DataTable<T>({
  items,
  columns,
  sortConfig,
  onSort,
  enablePinning = false,
  pinnedItems = new Set(),
  onTogglePin,
  isLoading = false,
  loadingText = "Loading...",
  emptyText = "No data available",
  expandedRow,
  onRowClick,
  renderExpandedRow,
  getRowKey,
  isRowExpanded,
  summaryRow,
  className = "",
  tableClassName = "min-w-max",
  headerRowClassName = "bg-[#fff4f0] border-b border-gray-200 hover:bg-[#fff4f0]",
  bodyRowClassName = "hover:bg-[#fff4f0] cursor-pointer text-left border-b border-gray-200",
  containerClassName = "bg-white shadow-md rounded-lg w-full h-full overflow-x-auto relative",
}: DataTableProps<T>) {
  // Sort items based on pinned sort config
  const sortedItems = useMemo(() => {
    // Only sort by pinned when explicitly sorting by "_pinned" and direction is active
    if (
      enablePinning &&
      sortConfig?.key === "_pinned" &&
      sortConfig.direction &&
      pinnedItems.size > 0
    ) {
      const pinned: T[] = [];
      const unpinned: T[] = [];

      items.forEach((item) => {
        const key = getRowKey(item);
        if (pinnedItems.has(key)) {
          pinned.push(item);
        } else {
          unpinned.push(item);
        }
      });

      // If direction is "desc", put unpinned first
      return sortConfig.direction === "asc"
        ? [...pinned, ...unpinned]
        : [...unpinned, ...pinned];
    }

    return items;
  }, [items, pinnedItems, enablePinning, getRowKey, sortConfig]);

  const getBodyRowClass = (item: T, isExpanded: boolean, isPinned: boolean) => {
    if (typeof bodyRowClassName === "function") {
      return bodyRowClassName(item, isExpanded, isPinned);
    }

    if (isExpanded) {
      // Remove hover effect and normal borders, add orange borders with gray bottom separator
      const baseClass = bodyRowClassName
        .replace("hover:bg-gray-50", "")
        .replace("hover:bg-gray-100", "")
        .replace("border-b", "")
        .replace("border-gray-100", "")
        .trim();
      return `${baseClass} !transition-none !border-l-[2px] !border-r-[2px] !border-t-[2px] !border-b-[1px] !border-l-custom !border-r-custom !border-t-custom !border-b-[#e5e7eb] hover:bg-transparent`;
    }

    return bodyRowClassName;
  };

  const getSummaryCellClassName = (col: ColumnConfig<T>) => {
    const colClassName = col.className || "";
    // Extract text alignment classes (text-left, text-right, text-center)
    const textAlignMatch = colClassName.match(/\btext-(left|right|center)\b/);
    const textAlign = textAlignMatch ? textAlignMatch[0] : "text-left";
    // Remove existing text alignment classes to avoid duplicates
    const classNameWithoutTextAlign = colClassName
      .replace(/\btext-(left|right|center)\b/g, "")
      .trim();
    // Check if column has padding with !important
    const hasImportantPadding =
      colClassName.includes("!px-") || colClassName.includes("!py-");
    // If column has !important padding, preserve it and add text alignment
    if (hasImportantPadding) {
      return `${textAlign} ${classNameWithoutTextAlign}`.trim();
    }
    // Use text alignment from column or default, and add default padding
    return `${textAlign} px-4 py-2 ${classNameWithoutTextAlign}`.trim();
  };

  // Extract background color from headerRowClassName for sticky header
  const getHeaderBackground = () => {
    const bgMatch = headerRowClassName.match(/\bbg-\[#[A-Fa-f0-9]+\]|\bbg-\w+/);
    return bgMatch ? bgMatch[0] : "bg-[#fff4f0]";
  };

  const headerBg = getHeaderBackground();

  return (
    <div className={containerClassName}>
      <LoadingOverlay
        loading={isLoading}
        position="absolute"
        className="z-20 top-0 left-0"
      />

      <table className={cn("w-full caption-bottom text-sm", tableClassName)}>
        <TableHeader>
          <TableRow className={headerRowClassName}>
            {enablePinning && (
              <TableHead
                className={`sticky top-0 z-20 w-12 px-4 py-2 cursor-pointer select-none group ${headerBg}`}
                onClick={() => onSort?.("_pinned")}
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    sortConfig?.key === "_pinned" &&
                    sortConfig?.direction !== null
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span
                  className={`absolute right-1 top-1/2 -translate-y-1/2 text-xs transition-opacity ${
                    sortConfig?.key === "_pinned" &&
                    sortConfig?.direction !== null
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {sortConfig?.key === "_pinned" &&
                  sortConfig?.direction !== null
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : "▼"}
                </span>
              </TableHead>
            )}
            {columns.map(
              ({ label, key, sortable = true, headerClassName = "" }) => {
                const canSort = sortable && onSort;

                return (
                  <TableHead
                    key={String(key)}
                    className={`sticky top-0 z-20 ${
                      canSort ? "cursor-pointer select-none" : ""
                    } text-left px-4 py-2 pr-8 group ${headerBg} ${headerClassName}`}
                    onClick={() => canSort && onSort(String(key))}
                  >
                    <span>{label}</span>
                    {canSort && (
                      <span
                        className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs transition-opacity ${
                          sortConfig?.key === String(key) &&
                          sortConfig?.direction !== null
                            ? "opacity-100 text-gray-700"
                            : "opacity-0 group-hover:opacity-100 text-gray-300"
                        }`}
                      >
                        {sortConfig?.key === String(key) &&
                        sortConfig?.direction !== null
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▼"}
                      </span>
                    )}
                  </TableHead>
                );
              }
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaryRow && (
            <TableRow
              key="summary"
              className="font-semibold border-b border-gray-200 cursor-pointer bg-gray-50"
            >
              {enablePinning && <TableCell className="px-4 py-2"></TableCell>}
              {columns.map((col, index) => (
                <TableCell key={index} className={getSummaryCellClassName(col)}>
                  {summaryRow[index] || ""}
                </TableCell>
              ))}
            </TableRow>
          )}
          {isLoading ? (
            <TableRow key="loading">
              <TableCell
                colSpan={columns.length + (enablePinning ? 1 : 0)}
                className="text-center py-8 text-gray-500"
              >
                {loadingText}
              </TableCell>
            </TableRow>
          ) : sortedItems.length === 0 ? (
            <TableRow key="no-data">
              <TableCell
                colSpan={columns.length + (enablePinning ? 1 : 0)}
                className="text-center py-6 text-gray-500"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item, index) => {
              const rowKey = getRowKey(item);
              // Use index as fallback to ensure unique keys even if data has duplicates
              const uniqueKey = `${rowKey}-${index}`;
              const isExpanded = isRowExpanded
                ? isRowExpanded(item)
                : expandedRow === rowKey;
              const isPinned = pinnedItems.has(rowKey);

              return (
                <React.Fragment key={uniqueKey}>
                  <TableRow
                    className={getBodyRowClass(item, isExpanded, isPinned)}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {enablePinning && (
                      <TableCell
                        className="px-4 py-2 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin?.(rowKey);
                        }}
                      >
                        <button
                          className="hover:scale-110 transition-transform cursor-pointer"
                          aria-label={isPinned ? "Unpin row" : "Pin row"}
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              isPinned
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                          />
                        </button>
                      </TableCell>
                    )}
                    {columns.map(({ key, render, className = "" }) => (
                      <TableCell
                        key={String(key)}
                        className={`px-4 py-2 ${className}`}
                      >
                        {render
                          ? render(item)
                          : (() => {
                              const k = key as keyof T;
                              return String(item[k] ?? "—");
                            })()}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && renderExpandedRow && (
                    <TableRow
                      key={`${uniqueKey}-expanded`}
                      className="!transition-none !border-l-[2px] !border-r-[2px] !border-b-[2px] !border-l-custom !border-r-custom !border-b-custom !border-t-0 hover:bg-transparent"
                    >
                      <TableCell
                        colSpan={columns.length + (enablePinning ? 1 : 0)}
                        className="p-0"
                      >
                        {renderExpandedRow(item)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </table>
    </div>
  );
}
