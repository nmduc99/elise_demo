"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DrawerV2,
    DrawerV2Content,
    DrawerV2Trigger,
} from "@/components/ui/drawer-v2";
import { Link, usePathname } from "@/i18n/routing";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleFromUser } from "@/lib/demo/roles";
import { POS_NAV, navForRole } from "@/lib/demo/nav";
import { hasNavAccess } from "@/lib/demo/permissions";

export default function MobileNav() {
    const t = useTranslations("elise");
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const role = getRoleFromUser(user);

    const items = navForRole(role);
    const canSell = hasNavAccess(role, "pos");
    const allItems = canSell ? [...items, POS_NAV] : items;

    return (
        <div className="md:hidden" suppressHydrationWarning>
            <DrawerV2 open={open} onOpenChange={setOpen} direction="left">
                <DrawerV2Trigger asChild suppressHydrationWarning>
                    <button
                        aria-label="Open menu"
                        className="p-2 rounded-md transition cursor-pointer"
                        onClick={(e) => (e.target as HTMLButtonElement).blur()}
                        suppressHydrationWarning
                    >
                        <Menu size={20} className="text-white" />
                    </button>
                </DrawerV2Trigger>

                <DrawerV2Content className="!top-0 !left-0 !right-0 !bottom-0 flex flex-col bg-background">
                    <DialogHeader>
                        <VisuallyHidden>
                            <DialogTitle>Menu</DialogTitle>
                        </VisuallyHidden>
                    </DialogHeader>

                    <div className="flex justify-between items-center px-4 py-3 border-b">
                        <h2 className="text-lg font-semibold text-foreground">{t("brand")}</h2>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                        >
                            <X size={20} className="text-foreground" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
                        {allItems.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href as any}
                                    onClick={() => setOpen(false)}
                                    className={clsx(
                                        "block px-3 py-2 rounded-md text-sm font-semibold",
                                        isActive ? "bg-custom text-white" : "hover:bg-gray-100"
                                    )}
                                >
                                    {t(`nav.${item.labelKey}`)}
                                </Link>
                            );
                        })}
                    </nav>
                </DrawerV2Content>
            </DrawerV2>
        </div>
    );
}
