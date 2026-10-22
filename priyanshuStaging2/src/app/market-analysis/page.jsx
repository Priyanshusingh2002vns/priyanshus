import { cache } from "react";
import MarketAnalysisClient from "./MarketAnalysisClient";

export const revalidate = 60; // ISR: revalidate cache every 60 seconds

const getMarketPulse = cache(async () => {
  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/admin/api/community/live-puls-posts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.data || json?.data;
      return Array.isArray(list) ? list[0] : list;
    }
  } catch (error) {
    console.error("Error fetching initial market pulse for SSR:", error);
  }
  return null;
});

export default async function MarketAnalysisPage() {
  const initialData = await getMarketPulse();
  return <MarketAnalysisClient initialData={initialData} />;
}
