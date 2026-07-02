"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import StaffPageContent from "@/components/demo/staff/StaffPageContent";
import { useStaffPage } from "@/components/demo/staff/useStaffPage";

export default function StaffPage() {
    const state = useStaffPage();

    return (
        <RoleGuard permission="hr">
            <div className="w-full space-y-6 p-4 md:p-6">
                <StaffPageContent state={state} />
            </div>
        </RoleGuard>
    );
}
