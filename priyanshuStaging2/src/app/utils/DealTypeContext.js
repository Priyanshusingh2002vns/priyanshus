"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const DealTypeContext = createContext();

export function DealTypeProvider({ children }) {
    const [dealType, setDealType] = useState("public");
    const pathname = usePathname();

    const updateDealType = (type) => {
        if (type === "private" || type === "public" || type === "ccps" || type === "ofs") {
            setDealType(type);
        } else {
            console.warn("Deal type must be 'private', 'public' or 'ccps' or 'ofs'");
        }
    };

    useEffect(() => {
        // Check if current path matches /deals/[slug]
        const isDealPage = /^\/deals\/[^/]+$/.test(pathname);

        if (!isDealPage) {
            // Reset when leaving the deal detail page
            setDealType("public");
        }
    }, [pathname]);

    return (
        <DealTypeContext.Provider value={{ dealType, updateDealType }}>
            {children}
        </DealTypeContext.Provider>
    );
}

export const useDealType = () => {
    const context = useContext(DealTypeContext);
    if (!context) {
        throw new Error("useDealType must be used within a DealTypeProvider");
    }
    return context;
};
