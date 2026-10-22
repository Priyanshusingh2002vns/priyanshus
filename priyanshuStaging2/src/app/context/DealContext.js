"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DealsContext = createContext(null);

export const DealsProvider = ({ children }) => {
  const [allDeals, setAllDeals] = useState([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [currPage, setCurrPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      setError(null);

      try {
        const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
        const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
        const res = await fetch(
          `${baseUrl}admin/api/deals/all-deals/?page=1&limit=15&deal_type=[unlisted,public]`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const responseData = await res.json();
        const deals = responseData.data || [];
        const pagination = responseData.pagination || {};

        const rawTotal = Number(pagination.totalRecords);
        const safeTotal = !isNaN(rawTotal) && rawTotal > 0 ? rawTotal : (deals.length || 0);

        setAllDeals(deals);
        setTotalDeals(safeTotal);
        setHasMore(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setTotalDeals(0);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  return (
    <DealsContext.Provider
      value={{
        allDeals,
        totalDeals,
        currPage,
        setCurrPage,
        hasMore,
        loading,
        error,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
};

export const useDeals = () => {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useDeals must be used within a DealsProvider");
  }
  return context;
};
