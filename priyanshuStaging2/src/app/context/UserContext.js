"use client"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState, useContext, useCallback } from "react";

const userContext = createContext();

export function UserProvider({ children }) {
    const [investor, setInvestor] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const logout = () => {
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("accessToken");
        Cookies.remove("verifyOtp", { path: "/" });
        Cookies.remove("verifyOtp");
        Cookies.remove("investorName", { path: "/" });
        Cookies.remove("investor", { path: "/" });
        setInvestor(null);
        window.dispatchEvent(new Event("tokenChanged"));
        router.replace("/");
        router.refresh();
    };



    const refreshInvestor = useCallback(async () => {
        try {
            const accessToken = Cookies.get("accessToken");
            if (!accessToken) {
                setInvestor(null);
                setLoading(false);
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}investor/api/investor/account-details`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            setInvestor(data.data);
            if (
                res.status === 401 ||
                data?.data?.status === 401 ||
                data?.message === "Invalid Access Token"
            ) {
                logout();
                return;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshInvestor();
    }, [refreshInvestor]);
    return (
        <userContext.Provider value={{ investor, setInvestor, loading, refreshInvestor }}>
            {children}
        </userContext.Provider>
    )
}

export function useUserContext() {
    return useContext(userContext);
}