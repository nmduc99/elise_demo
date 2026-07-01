"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";

interface PaginationWithInputProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationWithInput({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
}: PaginationWithInputProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      // Prevent input larger than totalPages
      if (value === "" || numValue <= totalPages) {
        setInputValue(value);
      }
    }
  };

  const handleInputBlur = () => {
    const pageNumber = parseInt(inputValue);
    if (isNaN(pageNumber) || pageNumber < 1) {
      setInputValue("1");
      onPageChange(1);
    } else if (pageNumber > totalPages) {
      setInputValue(totalPages.toString());
      onPageChange(totalPages);
    } else {
      onPageChange(pageNumber);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  if (totalPages <= 0) return null;

  // Calculate dynamic width based on totalPages digits
  const totalPagesDigits = totalPages.toString().length;
  const inputWidth = totalPagesDigits <= 2 ? 'w-[70px]' : totalPagesDigits === 3 ? 'w-[80px]' : 'w-[90px]';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* First Page Button */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="h-8 w-8"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous Page Button */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Input with Total Pages */}
      <div className="relative inline-flex items-center">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={`h-8 ${inputWidth} text-center pl-2 pr-[2.0rem]`}
        />
        <span className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500 pointer-events-none whitespace-nowrap select-none">
          / {totalPages}
        </span>
      </div>

      {/* Next Page Button */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page Button */}
      <Button
        size="icon"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="h-8 w-8"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

