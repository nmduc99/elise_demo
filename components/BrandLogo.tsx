"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import clsx from "clsx";

export const BRAND_LOGO_SRC = "/Icon-Elise.png";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    priority?: boolean;
    className?: string;
    textClassName?: string;
}

const SIZES = {
    sm: { px: 28, className: "h-7 w-7" },
    md: { px: 32, className: "h-8 w-8" },
    lg: { px: 56, className: "h-14 w-14" },
} as const;

export default function BrandLogo({
    size = "md",
    showText = true,
    priority = false,
    className,
    textClassName,
}: BrandLogoProps) {
    const t = useTranslations("elise");
    const dim = SIZES[size];

    return (
        <div className={clsx("flex items-center gap-2", className)}>
            <Image
                src={BRAND_LOGO_SRC}
                alt={t("brand")}
                width={dim.px}
                height={dim.px}
                className={clsx(dim.className, "shrink-0 object-contain")}
                priority={priority}
            />
            {showText && (
                <div className={clsx("leading-tight", textClassName)}>
                    <p className="font-bold text-black text-sm md:text-base tracking-wide">
                        {t("brand")}
                    </p>
                    <p className="hidden sm:block text-[10px] text-slate-400">
                        {t("brandTagline")}
                    </p>
                </div>
            )}
        </div>
    );
}
