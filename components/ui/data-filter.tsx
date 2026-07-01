"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { ReactNode } from "react";

export type FilterFieldType =
    | "select"
    | "multiselect"
    | "radio"
    | "input"
    | "checkbox"
    | "custom";

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterFieldConfig {
    id: string;
    label: string;
    type: FilterFieldType;
    options?: FilterOption[];
    value?: any;
    onChange?: (value: any) => void;
    placeholder?: string;
    renderCustom?: () => ReactNode;
    className?: string;
    contentClassName?: string;
    headerAction?: {
        label: string;
        onClick: () => void;
    };
    customRange?: {
        enabledValue?: string;
        fromLabel?: string;
        toLabel?: string;
        fromValue?: string;
        toValue?: string;
        onChange?: (range: { from?: string; to?: string }) => void;
    };
}

export interface DataFilterProps {
    fields: FilterFieldConfig[];
    isModal?: boolean;
    className?: string;
}

export function DataFilter({ fields, isModal = false, className = "" }: DataFilterProps) {

    const renderField = (field: FilterFieldConfig) => {
        switch (field.type) {
            case "select":
                return (
                    <>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || "Select..."} />
                            </SelectTrigger>
                            <SelectContent
                                className={clsx(
                                    "max-h-60 overflow-y-auto",
                                    field.contentClassName
                                )}
                            >
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.customRange &&
                            field.value === (field.customRange.enabledValue ?? "custom") && (
                                <div className="mt-3 space-y-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            {field.customRange.fromLabel || "From"}
                                        </Label>
                                        <Input
                                            type="date"
                                            value={field.customRange.fromValue ?? ""}
                                            onChange={(e) => {
                                                const newValue = e.target.value || "";
                                                field.customRange?.onChange?.({
                                                    from: newValue,
                                                    to: field.customRange?.toValue,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            {field.customRange.toLabel || "To"}
                                        </Label>
                                        <Input
                                            type="date"
                                            value={field.customRange.toValue ?? ""}
                                            onChange={(e) => {
                                                const newValue = e.target.value || "";
                                                field.customRange?.onChange?.({
                                                    from: field.customRange?.fromValue,
                                                    to: newValue,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                    </>
                );

            case "multiselect": {
                // Custom rendering for category field
                const selectedLabels = Array.isArray(field.value)
                    ? field.options?.filter((opt) => field.value.includes(opt.value)).map((opt) => opt.label) || []
                    : [];
                const maxDisplay = 2;
                const displayLabels = selectedLabels.length > maxDisplay
                    ? `${selectedLabels.slice(0, maxDisplay).join(", ")}, ...`
                    : selectedLabels.join(", ");
                return (
                    <Select
                        value=""
                        onValueChange={() => { }}
                    >
                        <SelectTrigger className="w-full mt-2 text-sm flex justify-between items-center" style={{ textAlign: "left" }}>
                            <span className="truncate block w-full  text-[#1e1e1e] ">
                                {selectedLabels.length > 0
                                    ? displayLabels
                                    : field.placeholder || "Select..."}
                            </span>
                        </SelectTrigger>
                        <SelectContent className="w-full p-0 max-h-60 overflow-y-auto">
                            <div className="p-2 max-h-[300px] overflow-y-auto">
                                {field.options?.map((option) => {
                                    const checked = Array.isArray(field.value) && field.value.includes(option.value);
                                    return (
                                        <div key={option.value} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={`${field.id}-${option.value}`}
                                                checked={checked}
                                                onCheckedChange={(checked) => {
                                                    const currentValue = Array.isArray(field.value)
                                                        ? field.value
                                                        : [];
                                                    const newValue = checked
                                                        ? [...currentValue, option.value]
                                                        : currentValue.filter((v) => v !== option.value);
                                                    field.onChange?.(newValue);
                                                }}
                                            />
                                            <Label
                                                htmlFor={`${field.id}-${option.value}`}
                                                className="text-sm"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </SelectContent>
                    </Select>
                );
            }

            case "radio":
                return (
                    <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className={clsx(
                            "md:flex items-center gap-2",
                            !field.contentClassName && "overflow-x-auto",
                            field.contentClassName
                        )}
                    >
                        {field.options?.map((option) => (
                            <div key={option.value}>
                                <RadioGroupItem
                                    value={option.value}
                                    id={`${field.id}-${option.value}`}
                                    className="sr-only"
                                />
                                <Label
                                    htmlFor={`${field.id}-${option.value}`}
                                    className={clsx(
                                        "cursor-pointer inline-flex items-center justify-center rounded-full px-4 py-2 border text-sm font-medium transition whitespace-nowrap",
                                        field.value === option.value
                                            ? "bg-custom text-white border-custom shadow"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                    )}
                                >
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "input":
                return (
                    <Input
                        placeholder={field.placeholder}
                        value={field.value || ""}
                        onChange={(e) => field.onChange?.(e.target.value)}
                        className="mt-2"
                    />
                );

            case "checkbox":
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${field.id}-${option.value}`}
                                    checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(option.value)
                                    }
                                    onCheckedChange={(checked) => {
                                        const currentValue = Array.isArray(field.value)
                                            ? field.value
                                            : [];
                                        const newValue = checked
                                            ? [...currentValue, option.value]
                                            : currentValue.filter((v) => v !== option.value);
                                        field.onChange?.(newValue);
                                    }}
                                />
                                <Label htmlFor={`${field.id}-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            case "custom":
                return field.renderCustom?.();

            default:
                return null;
        }
    };

    return (
        <div
            className={clsx(
                "bg-white",
                isModal
                    ? "w-full max-w-[90vw] max-h-[80vh]"
                    : "hidden md:block md:w-1/4 max-h-[550px] overflow-y-auto overflow-x-hidden shadow-md rounded-lg",
                className
            )}
        >
            <div className={clsx("p-4 space-y-4", isModal && "overflow-y-auto")}>
                {fields.map((field) => (
                    <div key={field.id} className={field.className}>
                        <div className="flex items-center justify-between">
                            <div className="font-semibold mb-2">{field.label}</div>
                            {field.headerAction && (
                                <Button
                                    variant="ghost"
                                    className="text-custom hover:text-dark hover:bg-transparent cursor-pointer"
                                    onClick={field.headerAction.onClick}
                                >
                                    {field.headerAction.label}
                                </Button>
                            )}
                        </div>
                        {renderField(field)}
                    </div>
                ))}
            </div>
        </div>
    );
}
