"use client";

import { cn } from "@/lib/utils";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarNavigationProps {
  title: string;
  items: NavigationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function SidebarNavigation({
  title,
  items,
  selectedId,
  onSelect,
  className = "",
}: SidebarNavigationProps) {
  return (
    <div className={cn("w-72 flex-shrink-0", className)}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <nav className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">
            {title}
          </h3>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 flex items-center justify-between group",
                selectedId === item.id
                  ? "bg-orange-50 text-custom shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              {selectedId === item.id && (
                <div className="w-1 h-6 bg-custom rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

