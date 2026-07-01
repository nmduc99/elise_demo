"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "../ui/navigation-menu";
import { navigationColors } from "@/lib/colors/navigationColors";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRoleFromUser } from "@/lib/demo/roles";
import { POS_NAV, navForRole } from "@/lib/demo/nav";
import { hasNavAccess } from "@/lib/demo/permissions";

interface MainNavigationProps {
    shopType?: string | null;
}

export default function MainNavigation({ shopType: _shopType }: MainNavigationProps) {
    const t = useTranslations("elise");
    const pathname = usePathname();
    const { user } = useAuth();
    const role = getRoleFromUser(user);

    const items = navForRole(role);
    const canSell = hasNavAccess(role, "pos");

    const navLinkClass = clsx(
        "text-sm font-semibold px-3 py-2.5 rounded-md transition-colors",
        navigationColors.navItem.text,
        navigationColors.navItem.hoverBg
    );

    const activeLinkClass = clsx(
        navigationColors.navItem.activeBg,
        navigationColors.navItem.activeText
    );

    return (
        <nav className="hidden md:flex w-full justify-between items-center">
            <ul className={`flex items-center justify-between ml-4 ${navigationColors.navItem.text}`}>
                <NavigationMenu>
                    <NavigationMenuList className="flex items-center gap-2">
                        {items.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);
                            return (
                                <NavigationMenuItem key={item.href}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item.href as any}
                                            className={clsx(navLinkClass, isActive && activeLinkClass)}
                                        >
                                            {t(`nav.${item.labelKey}`)}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
            </ul>

            {canSell && (
                <Link href={POS_NAV.href as any} className="text-sm font-semibold ml-2">
                    <div
                        className={clsx(
                            "hidden md:flex space-x-1.5 items-center justify-center border-2 rounded-[8px] p-2 cursor-pointer mr-4 shadow-md transition-all",
                            navigationColors.saleButton.bg,
                            navigationColors.saleButton.border,
                            navigationColors.saleButton.text,
                            navigationColors.saleButton.hoverBg,
                            navigationColors.saleButton.hoverBorder
                        )}
                    >
                        <ShoppingCart size={16} className={navigationColors.saleButton.text} />
                        <span className={clsx("text-sm font-semibold", navigationColors.saleButton.text)}>
                            {t("nav.pos")}
                        </span>
                    </div>
                </Link>
            )}
        </nav>
    );
}
