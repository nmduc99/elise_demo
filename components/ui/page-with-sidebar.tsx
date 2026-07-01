"use client";

import SidebarNavigation, { NavigationItem } from "./sidebar-navigation";

interface PageWithSidebarProps {
  title: string;
  sidebarTitle: string;
  navigationItems: NavigationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  children: React.ReactNode;
  showPageTitle?: boolean;
}

export default function PageWithSidebar({
  title,
  sidebarTitle,
  navigationItems,
  selectedId,
  onSelect,
  children,
  showPageTitle = true,
}: PageWithSidebarProps) {
  return (
    <div className="w-full h-[calc(100vh-96px)] flex flex-col p-4 md:p-6 gap-6">
      {/* Page Title */}
      {showPageTitle && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar Navigation */}
        <SidebarNavigation
          title={sidebarTitle}
          items={navigationItems}
          selectedId={selectedId}
          onSelect={onSelect}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

