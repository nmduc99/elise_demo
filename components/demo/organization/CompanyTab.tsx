"use client";

import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/demo/eliseData";
import { Pencil } from "lucide-react";

interface CompanyTabProps {
    company: Company;
    onEdit: () => void;
}

export default function CompanyTab({ company, onEdit }: CompanyTabProps) {
    return (
        <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{company.name}</h2>
                <Button variant="outline" onClick={onEdit}>
                    <Pencil size={14} className="mr-1.5" /> Sửa
                </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-slate-400">Mã số thuế</dt>
                    <dd className="font-medium text-slate-700">{company.taxCode}</dd>
                </div>
                <div>
                    <dt className="text-slate-400">Năm thành lập</dt>
                    <dd className="font-medium text-slate-700">{company.foundedYear}</dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-slate-400">Địa chỉ</dt>
                    <dd className="font-medium text-slate-700">{company.address}</dd>
                </div>
                <div>
                    <dt className="text-slate-400">Điện thoại</dt>
                    <dd className="font-medium text-slate-700">{company.phone}</dd>
                </div>
                <div>
                    <dt className="text-slate-400">Email</dt>
                    <dd className="font-medium text-slate-700">{company.email}</dd>
                </div>
                <div>
                    <dt className="text-slate-400">Website</dt>
                    <dd className="font-medium text-slate-700">{company.website}</dd>
                </div>
            </dl>
        </div>
    );
}
