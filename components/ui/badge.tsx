import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-red-100 text-red-800 shadow hover:bg-red-200",
        warning:
          "border-transparent bg-orange-500 text-white shadow hover:bg-orange-600",
        success:
          "border-transparent bg-green-100 text-green-800 shadow hover:bg-green-200",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Chuẩn hóa class theo trạng thái (dùng chung cho Sổ quỹ, Hóa đơn, Đặt hàng, Khách hàng...)
export type StatusBadgeKind =
  | "draft" // Phiếu tạm
  | "success" // Đã thanh toán / Đã xác nhận / Đã hạch toán
  | "danger" // Đã hủy / lỗi
  | "warning" // Cảnh báo
  | "info" // Thông tin
  | "muted"; // Trung tính / chưa hạch toán

export const statusBadgeClasses: Record<StatusBadgeKind, string> = {
  draft: "bg-orange-100 text-orange-800",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-700",
  muted: "bg-gray-100 text-gray-700",
};

export { Badge, badgeVariants };
