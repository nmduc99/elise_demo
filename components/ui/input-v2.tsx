import { cn } from "@/lib/utils";
import * as React from "react";

interface InputV2Props extends Omit<React.ComponentProps<"input">, 'onChange' | 'value' | 'type'> {
    value?: number;
    onChange?: (value: number) => void;
    max?: number;
    min?: number;
    maxLength?: number;
    isOverLimit?: boolean;
}

const InputV2 = React.forwardRef<HTMLInputElement, InputV2Props>(
    ({ className, max, min = 0, value = 0, onChange, isOverLimit = false, maxLength, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState(value.toString());
        const [isFocused, setIsFocused] = React.useState(false);

        // Sync with external value changes
        React.useEffect(() => {
            setDisplayValue(value.toString());
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            const effectiveMin = typeof min === "number" ? min : 0;

            // Allow empty string temporarily for user to type
            if (inputValue === '') {
                setDisplayValue('');
                return;
            }

            // Only allow digits
            if (!/^\d+$/.test(inputValue)) {
                return;
            }

            const maxChars = typeof maxLength === "number" ? maxLength : 13;
            if (inputValue.length > maxChars) {
                setDisplayValue(effectiveMin.toString());
                onChange?.(effectiveMin);
                return;
            }

            // Parse the value
            let numValue = parseInt(inputValue, 10);

            // Handle invalid numbers
            if (isNaN(numValue)) {
                return;
            }

            // Enforce minimum
            if (numValue < effectiveMin) {
                numValue = effectiveMin;
            }

            // Remove max enforcement - allow any value
            // if (max !== undefined && numValue > max) {
            //     numValue = max;
            // }

            setDisplayValue(numValue.toString());
            onChange?.(numValue);
        };

        const handleBlur = () => {
            setIsFocused(false);
            const effectiveMin = typeof min === "number" ? min : 0;
            // If empty on blur, set to minimum
            if (displayValue === '') {
                setDisplayValue(effectiveMin.toString());
                onChange?.(effectiveMin);
            }
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        return (
            <input
                type="text"
                className={cn(
                    "flex h-9 w-full bg-transparent px-3 py-1 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-0 border-b-2 focus:ring-0",
                    isOverLimit
                        ? "border-red-500 text-red-600"
                        : isFocused
                            ? "border-blue-500"
                            : "border-gray-300",
                    className
                )}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                inputMode="numeric"
                maxLength={maxLength}
                {...props}
            />
        )
    }
)
InputV2.displayName = "InputV2"

export { InputV2 };

