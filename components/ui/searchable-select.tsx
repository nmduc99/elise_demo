"use client";

import * as React from "react";
import { Check, ChevronDown, Plus, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchableSelectProps {
    items: { value: string; label: string }[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
    showAddNew?: boolean;
    addNewLabel?: string;
    onAddNew?: () => void;
    onEdit?: (selectedValue: string) => void;
}

export function SearchableSelect({
    items,
    value,
    onValueChange,
    placeholder = "Select item...",
    emptyText = "No results found.",
    className,
    disabled = false,
    showAddNew = false,
    addNewLabel = "Thêm mới",
    onAddNew,
    onEdit,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredItems = React.useMemo(() => {
        if (!searchTerm) return items;
        return items.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const selectedItem = items.find((item) => item.value === value);

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue);
        setOpen(false);
        setSearchTerm("");
    };

    const handleAddNew = () => {
        setOpen(false);
        setSearchTerm("");
        if (onAddNew) {
            onAddNew();
        }
    };

    React.useEffect(() => {
        if (!open) return;

        const handleScroll = (event: Event) => {
            const target = event.target as HTMLElement;
            // If dragging scroll bar or scrolling inside popover content, don't close
            if (target?.closest('[data-radix-popper-content-wrapper]')) {
                return;
            }
            setOpen(false);
        };

        window.addEventListener('scroll', handleScroll, { capture: true });
        return () => window.removeEventListener('scroll', handleScroll, { capture: true });
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <span className="truncate">
                        {selectedItem ? selectedItem.label : placeholder}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="max-h-[200px] w-full p-1" type="auto">
                    {filteredItems.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500">
                            {emptyText}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-orange-50 hover:text-orange-900 group",
                                        value === item.value && "bg-orange-100 text-orange-900 font-medium"
                                    )}
                                    onClick={() => handleSelect(item.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === item.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <span className="flex-1 truncate">{item.label}</span>

                                    {onEdit && item.value !== "all" && (
                                        <div
                                            className="ml-2 p-1.5 rounded-full hover:bg-orange-100 transition-colors shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(item.value);
                                                setOpen(false);
                                            }}
                                            title="Sửa"
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-orange-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {showAddNew && onAddNew && (
                    <div className="border-t p-1">
                        <div
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-custom hover:bg-orange-50"
                            onClick={handleAddNew}
                        >
                            <Plus className="h-4 w-4" />
                            {addNewLabel}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

