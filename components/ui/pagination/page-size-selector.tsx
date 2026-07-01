"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [15, 25, 50, 100],
  className = "",
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-sm text-gray-600 hidden sm:inline">Hiển thị</span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-[70px] sm:w-[100px] h-8 pl-2 pr-1 gap-0.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              <span className="sm:hidden">{size}</span>
              <span className="hidden sm:inline">{size} dòng</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

