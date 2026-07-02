"use client";

import { inputClass } from "@/lib/demo/formClasses";
import { formatNumber } from "@/lib/demo/format";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PositiveNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
    /** `vi-vn` formats with thousand separators (e.g. 1.000.000). */
    format?: "plain" | "vi-vn";
}

function formatDisplay(value: number, format: "plain" | "vi-vn"): string {
    if (format === "vi-vn") {
        return formatNumber(value);
    }
    return String(value);
}

function parseDigits(inputValue: string): string {
    return inputValue.replace(/\D/g, "");
}

/** Text input that only accepts non-negative integer digits. */
export default function PositiveNumberInput({
    value,
    onChange,
    className,
    placeholder,
    format = "plain",
}: PositiveNumberInputProps) {
    const [displayValue, setDisplayValue] = useState(() => formatDisplay(value, format));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formatDisplay(value, format));
        }
    }, [value, format, isFocused]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        const digits = format === "vi-vn" ? parseDigits(inputValue) : inputValue;

        if (digits === "") {
            setDisplayValue("");
            return;
        }

        if (!/^\d+$/.test(digits)) {
            return;
        }

        const numValue = parseInt(digits, 10);
        if (Number.isNaN(numValue) || numValue < 0) {
            return;
        }

        setDisplayValue(format === "vi-vn" ? formatNumber(numValue) : digits);
        onChange(numValue);
    };

    const handleBlur = () => {
        setIsFocused(false);

        if (displayValue === "" || parseDigits(displayValue) === "") {
            setDisplayValue(formatDisplay(0, format));
            onChange(0);
            return;
        }

        setDisplayValue(formatDisplay(value, format));
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            className={cn(inputClass, className)}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
        />
    );
}
