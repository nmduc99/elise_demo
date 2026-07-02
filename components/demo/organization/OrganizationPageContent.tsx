"use client";

import CompanyDialog from "@/components/demo/organization/CompanyDialog";
import CompanyTab from "@/components/demo/organization/CompanyTab";
import OrganizationStats, {
    organizationStatsProps,
} from "@/components/demo/organization/OrganizationStats";
import ProvincesTab from "@/components/demo/organization/ProvincesTab";
import {
    RegionDialog,
    ProvinceDialog,
} from "@/components/demo/organization/RegionProvinceDialogs";
import RegionsTab from "@/components/demo/organization/RegionsTab";
import StoreDialog from "@/components/demo/organization/StoreDialog";
import StoresTab from "@/components/demo/organization/StoresTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrganizationPageState } from "./useOrganizationPage";

interface OrganizationPageContentProps {
    state: OrganizationPageState;
}

export default function OrganizationPageContent({ state }: OrganizationPageContentProps) {
    return (
        <>
            <OrganizationStats {...organizationStatsProps(state)} />

            <Tabs defaultValue="company">
                <TabsList>
                    <TabsTrigger value="company">Công ty</TabsTrigger>
                    <TabsTrigger value="regions">Khu vực</TabsTrigger>
                    <TabsTrigger value="provinces">Tỉnh/thành</TabsTrigger>
                    <TabsTrigger value="stores">Cửa hàng</TabsTrigger>
                </TabsList>

                <TabsContent value="company">
                    {state.co && (
                        <CompanyTab company={state.co} onEdit={() => state.setCoDraft(state.co!)} />
                    )}
                </TabsContent>

                <TabsContent value="regions">
                    <RegionsTab state={state} />
                </TabsContent>

                <TabsContent value="provinces">
                    <ProvincesTab state={state} />
                </TabsContent>

                <TabsContent value="stores">
                    <StoresTab state={state} />
                </TabsContent>
            </Tabs>

            <CompanyDialog
                draft={state.coDraft}
                setDraft={state.setCoDraft}
                onSave={state.saveCompany}
            />

            <RegionDialog
                open={state.regionOpen}
                onOpenChange={state.setRegionOpen}
                draft={state.regionDraft}
                setDraft={state.setRegionDraft}
                onSave={state.saveRegion}
            />

            <ProvinceDialog
                open={state.provOpen}
                onOpenChange={state.setProvOpen}
                draft={state.provDraft}
                setDraft={state.setProvDraft}
                onSave={state.saveProvince}
                regions={state.regions.items}
            />

            <StoreDialog
                open={state.storeOpen}
                onOpenChange={state.setStoreOpen}
                draft={state.storeDraft}
                setDraft={state.setStoreDraft}
                onSave={state.saveStore}
                provinces={state.provinces.items}
            />
        </>
    );
}
