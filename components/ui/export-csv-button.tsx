"use client";

// Export CSV Button Component
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ExportCSVButtonProps {
  onClick: () => void;
  disabled?: boolean;
  showIcon?: boolean;
  className?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function ExportCSVButton({
  onClick,
  disabled = false,
  showIcon = false,
  className = "",
  fullWidth = false,
  isLoading = false,
}: ExportCSVButtonProps) {
  const t = useTranslations("common");

  return (
    <Button
      className={`bg-custom hover:bg-dark text-white cursor-pointer whitespace-nowrap ${fullWidth ? "w-full" : ""
        } ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : showIcon ? (
        <Download size={16} className="mr-2" />
      ) : null}
      {t("exportCSV")}
    </Button>
  );
}
