"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import OrganizationPageContent from "@/components/demo/organization/OrganizationPageContent";
import { useOrganizationPage } from "@/components/demo/organization/useOrganizationPage";

export default function OrganizationPage() {
    const state = useOrganizationPage();

    return (
        <RoleGuard permission="organization">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý tổ chức</h1>
                    <p className="text-sm text-slate-500">
                        Công ty, khu vực, tỉnh/thành và hệ thống cửa hàng
                    </p>
                </div>

                <OrganizationPageContent state={state} />
            </div>
        </RoleGuard>
    );
}
