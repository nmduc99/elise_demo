"use client";

import RoleGuard from "@/components/demo/RoleGuard";
import EmployeeDetailView from "@/components/demo/staff/EmployeeDetailView";
import { use } from "react";

interface StaffDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function StaffDetailPage({ params }: StaffDetailPageProps) {
    const { id } = use(params);

    return (
        <RoleGuard permission="hr">
            <EmployeeDetailView employeeId={id} />
        </RoleGuard>
    );
}
