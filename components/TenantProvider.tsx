// components/TenantProvider.tsx
"use client";

import { createContext, ReactNode, useContext } from "react";

type TenantContextShape = {
    tenant: string;
};

const TenantContext = createContext<TenantContextShape>({ tenant: "www" });

export default function TenantProvider({ tenant, children }: { tenant: string; children: ReactNode }) {
    return <TenantContext.Provider value={{ tenant }}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);
