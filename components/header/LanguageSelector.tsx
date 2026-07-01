"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/routing";
import Image from "next/image";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { languages, normalizePathname } from "./headerConstants";

export default function LanguageSelector() {
    const locale = useLocale();
    const pathname = usePathname();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const currentLang = languages.find((l) => l.code === locale) || languages[0];

    return (
        <DropdownMenu open={isLangOpen} onOpenChange={setIsLangOpen}>
            <DropdownMenuTrigger
                id="language-dropdown-trigger"
                className="flex items-center gap-2 px-3 py-2.5 rounded-md transition cursor-pointer"
            >
                <Image
                    src={currentLang.flag}
                    alt={currentLang.label}
                    width={20}
                    height={20}
                    className="object-contain"
                />
                <span className="hidden md:inline">{currentLang.label}</span>
                <span className="inline md:hidden">{currentLang.shortLabel}</span>
                {isLangOpen ? (
                    <ChevronUp size={16} className="ml-1" />
                ) : (
                    <ChevronDown size={16} className="ml-1" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => {
                    const normalizedPath = normalizePathname(pathname);
                    return (
                        <DropdownMenuItem key={lang.code} asChild>
                            <Link
                                href={normalizedPath as any}
                                locale={lang.code}
                                className="flex items-center gap-2 w-full"
                            >
                                <Image
                                    src={lang.flag}
                                    alt={lang.label}
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                                <span>{lang.label}</span>
                                {locale === lang.code && (
                                    <Check size={16} className="ml-auto" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
