"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loadingOverlayVariants = cva(
  "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[30]",
  {
    variants: {
      position: {
        fixed: "fixed",
        absolute: "absolute",
      },
    },
    defaultVariants: {
      position: "absolute",
    },
  }
);

interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingOverlayVariants> {
  /** Whether the loading overlay is visible */
  loading?: boolean;
  /** Optional loading text to display */
  loadingText?: string;
  /** Optional size of the spinner in pixels */
  spinnerSize?: number;
  /** Optional className for the spinner */
  spinnerClassName?: string;
}

export function LoadingOverlay({
  loading = true,
  loadingText,
  position = "fixed",
  spinnerSize = 24,
  spinnerClassName,
  className,
  ...props
}: LoadingOverlayProps) {
  // Don't render anything if not loading
  React.useEffect(() => {
    if (loading) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      role="alert"
      aria-busy="true"
      aria-label={loadingText || "Loading"}
      className={cn(loadingOverlayVariants({ position }), className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin text-primary", spinnerClassName)} size={spinnerSize} aria-hidden="true" />
        {loadingText && <p className="text-sm text-muted-foreground">{loadingText}</p>}
      </div>
    </div>
  );
}
