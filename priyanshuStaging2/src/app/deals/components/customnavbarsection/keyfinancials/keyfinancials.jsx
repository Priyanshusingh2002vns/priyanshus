"use client";
import React, { useState, useEffect, useRef } from "react";
import Barchart from "../charts/barchart/barchart";
import PurpleBarchart from "../charts/barchartpurple/barchartpurple";
import { Collapse, Tabs, Tab, Fade } from "react-bootstrap";
import "./keyfinancials.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import DebtBarChart from "../charts/DebtBarchart";
import InterestCoverageBarchart from "../charts/InterestCoverageBarchart";
import CurrentRatioBarchart from "../charts/CurrentRatioBarchart";
import ROABarchart from "../charts/ROABarchart";
import ROEBarchart from "../charts/ROEBarchart";
import ROCEBarchart from "../charts/ROCEBarchart";
import { useDealStore } from "@/store/dealStore";
import { transformObservationHtml } from "@/app/utils/formatUtils";
// import { useSearchParams } from "next/navigation";

const extractMetricData = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") {
    if ("data" in val) {
      if (val.data === null || val.data === undefined) return null;
      if (typeof val.data === "object") return extractMetricData(val.data);
      return val.data;
    }
    if ("value" in val) {
      if (val.value === null || val.value === undefined) return null;
      if (typeof val.value === "object") return extractMetricData(val.value);
      return val.value;
    }
    return null;
  }
  return val;
};

const formatIndianNumber = (value, defaultDecimals = null) => {
  const val = extractMetricData(value);
  if (val === null || val === undefined || val === "" || val === "N/A" || val === "n.a") return "-";
  const num = Number(val);
  if (isNaN(num)) return typeof val === "string" ? val : "-";
  
  let decimals = 0;
  if (defaultDecimals !== null) {
    decimals = defaultDecimals;
  } else {
    const str = String(val);
    const parts = str.split('.');
    decimals = parts.length > 1 ? parts[1].length : 0;
  }
  
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const AccordionToggleIcon = ({ isOpen }) => {
  if (isOpen) {
    return (
      <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{  display: "block",  height:"105%"}}>
        <circle cx="18" cy="18" r="18" fill="#FDF7E7" />
        <rect x="9" y="16.5" width="18" height="3" rx="1.5" fill="#B58D23" />
      </svg>
    );
  }
  return (
    <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <circle cx="18" cy="18" r="18" fill="#FDF7E7" />
      <rect x="9" y="16.5" width="18" height="3" rx="1.5" fill="#B58D23" />
      <rect x="16.5" y="9" width="3" height="18" rx="1.5" fill="#B58D23" />
    </svg>
  );
};

const extractObservationHtml = (sectionNode, dataArray) => {
  // 1. Check the root/sibling level of the section node
  if (sectionNode) {
    // Check observation_and_insights object
    const obsObj = sectionNode.observation_and_insights;
    if (obsObj) {
      if (obsObj.status !== false && obsObj.data) {
        return transformObservationHtml(obsObj.data);
      }
    }
    // Check observations_and_insights object/field
    const obsPlural = sectionNode.observations_and_insights;
    if (obsPlural) {
      if (typeof obsPlural === "object") {
        if (obsPlural.status !== false && obsPlural.data) {
          return transformObservationHtml(obsPlural.data);
        }
      } else if (typeof obsPlural === "string" && sectionNode.status !== false) {
        return transformObservationHtml(obsPlural);
      }
    }
    // Check observations/observations_status
    if (sectionNode.observations && sectionNode.observations_status !== false) {
      if (typeof sectionNode.observations === "string") {
        return transformObservationHtml(sectionNode.observations);
      } else if (sectionNode.observations.data) {
        return transformObservationHtml(sectionNode.observations.data);
      }
    }
  }

  // 2. Check the data array elements
  const arr = Array.isArray(dataArray) ? dataArray : (Array.isArray(sectionNode?.data) ? sectionNode.data : []);
  for (const item of arr) {
    if (!item) continue;
    
    // Check item.observation_and_insights
    if (item.observation_and_insights) {
      const o = item.observation_and_insights;
      if (o.status !== false && o.data) {
        return transformObservationHtml(o.data);
      }
    }

    // Check item.observations_and_insights
    if (item.observations_and_insights) {
      const o = item.observations_and_insights;
      if (typeof o === "object") {
        if (o.status !== false && o.data) {
          return transformObservationHtml(o.data);
        }
      } else if (typeof o === "string" && item.status !== false) {
        return transformObservationHtml(o);
      }
    }

    // Check item.observations / item.status / item.observation
    if (item.observations && item.status !== false) {
      if (typeof item.observations === "string") {
        return transformObservationHtml(item.observations);
      } else if (item.observations.data) {
        return transformObservationHtml(item.observations.data);
      }
    }
  }

  return null;
};

const shouldShowSectionObservations = (sectionNode, dataArray) => {
  if (sectionNode) {
    const obsObj = sectionNode.observation_and_insights;
    if (obsObj) {
      if (obsObj.status === true && obsObj.data !== null && obsObj.data !== undefined && String(obsObj.data).trim() !== "") {
        return true;
      }
      if (obsObj.status === false || obsObj.data === null || obsObj.data === undefined) {
        return false;
      }
    }
    const obsPlural = sectionNode.observations_and_insights;
    if (obsPlural && typeof obsPlural === "object") {
      if (obsPlural.status === true && obsPlural.data !== null && obsPlural.data !== undefined && String(obsPlural.data).trim() !== "") {
        return true;
      }
      if (obsPlural.status === false || obsPlural.data === null || obsPlural.data === undefined) {
        return false;
      }
    }
  }

  const arr = Array.isArray(dataArray) ? dataArray : (Array.isArray(sectionNode?.data) ? sectionNode.data : []);
  for (const item of arr) {
    if (!item) continue;
    
    const obsObj = item.observation_and_insights;
    if (obsObj) {
      if (obsObj.status === true && obsObj.data !== null && obsObj.data !== undefined && String(obsObj.data).trim() !== "") {
        return true;
      }
      if (obsObj.status === false || obsObj.data === null || obsObj.data === undefined) {
        return false;
      }
    }

    const obsPlural = item.observations_and_insights;
    if (obsPlural && typeof obsPlural === "object") {
      if (obsPlural.status === true && obsPlural.data !== null && obsPlural.data !== undefined && String(obsPlural.data).trim() !== "") {
        return true;
      }
      if (obsPlural.status === false || obsPlural.data === null || obsPlural.data === undefined) {
        return false;
      }
    }
  }

  const html = extractObservationHtml(sectionNode, dataArray);
  return !!(html && String(html).trim() !== "");
};

const dummyPerfData = [
  // { isCategory: true, label: "Revenue & Growth" },
  // { label: "Revenue (₹Cr)", values: ["120.0", "120.0", { val: "120.0", color: "#16A34A" }] },
  // { label: "Growth (%)", values: ["+28.0%", "+31.0%", { val: "+33.0%", color: "#16A34A" }] },
  // { isCategory: true, label: "Earnings (Margins %)" },
  // { label: "EBITDA (Cr)", values: ["124.8", "124.8", { val: "9.43 (11.0%)", color: "#16A34A" }] },
  // { label: "PAT (Cr)", values: ["124.8", "124.8", { val: "4.61 (5.0%)", color: "#16A34A" }] },
  // { isCategory: true, label: "Valuation" },
  // { label: "P/E Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { isCategory: true, label: "Profitability Metrics" },
  // { label: "ROE (%)", values: ["-1.4%", "-1.4%", { val: "-1.4%", color: "#DC2626" }] },
  // { label: "ROE (%)", values: ["-1.4%", "-1.4%", { val: "-1.4%", color: "#DC2626" }] },
  // { label: "ROCE (%)", values: ["11.4%", "11.4%", { val: "11.4%", color: "#16A34A" }] },
  // { isCategory: true, label: "Leverage & Coverage" },
  // { label: "Debt-To-Equity Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { label: "Interest Coverage Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { isCategory: true, label: "Working Capital" },
  // { label: "Debtor Days", values: ["12.0", "21.0", { val: "34.0", color: "#16A34A" }] },
  // { label: "Creditor Days", values: ["54.0", "87.0", { val: "96.0", color: "#16A34A" }] },
  // { label: "Inventory Days", values: ["23.0", "32.0", { val: "45.0", color: "#16A34A" }] },
  // { isCategory: true, label: "Asset Efficiency" },
  // { label: "Long-Term Funds To Fixed Assets", values: ["1.2x", "1.2x", { val: "1.2x", color: "#16A34A" }] },
  // { isCategory: true, label: "Liquidity & Cost Structure" },
  // { label: "Current Ratio", values: ["1.2x", "1.2x", { val: "1.2x", color: "#16A34A" }] },
  // { label: "COGS (% Of Revenue)", values: ["+28.5%", "+31.0%", { val: "+33.0%", color: "#16A34A" }] }
];

const IncomeStatementTrends = ({ isPrivateDeal, data }) => {
  const defaultTrendsData = [];

  const defaultObservations = [
    
  ];

  const rawApiData = data || [];
  const yearsToUse = rawApiData.length > 0
    ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2026"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
    const defaultItem = defaultTrendsData.find(d => d.year === yearStr) || {
      year: yearStr,
      revenue: null,
      growth: null,
      ebitda: null,
      ebitdaMargin: null,
      pat: null,
      patMargin: null
    };

    return {
      year: yearStr,
      revenue: apiItem?.revenue_in_cr ?? apiItem?.revenue ?? defaultItem.revenue,
      growth: apiItem?.growth_percent ?? apiItem?.growth ?? defaultItem.growth,
      ebitda: apiItem?.ebitda_in_cr ?? apiItem?.ebitda ?? defaultItem.ebitda,
      ebitdaMargin: apiItem?.ebitda_percent ?? apiItem?.ebitdaMargin ?? defaultItem.ebitdaMargin,
      pat: apiItem?.pat_in_cr ?? apiItem?.pat ?? defaultItem.pat,
      patMargin: apiItem?.pat_percent ?? apiItem?.patMargin ?? defaultItem.patMargin,
    };
  });

  const dealDetails = useDealStore((state) => state.dealDetails);
  const financialHighlights = dealDetails?.data?.financial_highlights;
  const observationHtml = extractObservationHtml(financialHighlights?.financial_trends, rawApiData);
  const showObservations = shouldShowSectionObservations(financialHighlights?.financial_trends, rawApiData);

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const rows = [
    { label: "Revenue (₹ Cr)", key: "revenue", format: "currency" },
    { label: "Growth (%)", key: "growth", format: "percentage" },
    { label: "EBITDA (₹ Cr)", key: "ebitda", format: "currency" },
    { label: "EBITDA Margin (%)", key: "ebitdaMargin", format: "percentage" },
    { label: "PAT (₹ Cr)", key: "pat", format: "currency" },
    { label: "PAT Margin (%)", key: "patMargin", format: "percentage" }
  ];

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="income-statement-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" >
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Scroll to view more</span>
          </div>
        )}

        <div 
          className="incomeStatementTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="incomeStatementTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="tr-row">
                  <td className="td-label">{row.label}</td>
                  {trendsData.map((col, idx) => {
                    const isLatest = idx === trendsData.length - 1;
                    const rawVal = extractMetricData(col[row.key]);

                    let displayVal = "-";
                    if (rawVal !== null && rawVal !== undefined && rawVal !== "" && rawVal !== "N/A" && rawVal !== "n.a") {
                      if (row.format === "percentage") {
                        const num = Number(rawVal);
                        displayVal = isNaN(num) ? String(rawVal) : `${num.toFixed(1)}%`;
                      } else if (row.format === "currency") {
                        if (row.key === "revenue") {
                          displayVal = formatIndianNumber(rawVal);
                        } else {
                          displayVal = formatIndianNumber(rawVal, 1);
                        }
                      } else {
                        displayVal = String(rawVal);
                      }
                    }

                    return (
                      <td
                        key={col.year}
                        className={isLatest ? "td-value-highlight" : "td-value-dim"}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showObservations && (
        <div className="observations-container">
          <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
          {observationHtml ? (
            <div 
              className="observations-html-content"
              style={{ fontSize: "14px", lineHeight: "1.6", color: isPrivateDeal ? "#fff" : "#1F2937" }}
              dangerouslySetInnerHTML={{ __html: observationHtml }}
            />
          ) : (
            <ul className="observations-list">
              {observationsList.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const BalanceSheetSection = ({ isPrivateDeal, data }) => {
  const balanceSheetRows = [
    {
      label: "EQUITY & LIABILITIES",
      type: "category-header",
      tooltip: "Total of Net Worth and Total Liabilities. Represents what the company owes to owners and third parties.",
      key: "total_equity_and_liabilities",
      values: { "2023": 255, "2024": 330, "2025": 420 }
    },
    {
      label: "Net Worth",
      type: "sub-header",
      tooltip: "The total equity/book value of the company (Share Capital + Reserves & Surplus).",
      key: "net_worth",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Share Capital",
      type: "indented",
      tooltip: "The portion of equity that has been raised through issuing shares.",
      key: "share_capital",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Reserves & Surplus",
      type: "indented",
      tooltip: "Accumulated profits and capital gains retained in the business rather than distributed.",
      key: "reserves_and_surplus",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Total Liabilities",
      type: "sub-header",
      tooltip: "Total debt and other obligations owed to external parties.",
      key: "total_liabilities",
      values: { "2023": 145, "2024": 190, "2025": 240 }
    },
    {
      label: "Current Liabilities",
      type: "indented",
      isBold: true,
      tooltip: "Short-term financial obligations that are due within one year.",
      key: "current_liabilities",
      values: { "2023": 145, "2024": 190, "2025": 240 }
    },
    {
      label: "Borrowings",
      type: "indented",
      tooltip: "Short-term interest-bearing loans and credit lines.",
      key: "current_borrowings",
      values: { "2023": 42, "2024": 55, "2025": 70 }
    },
    {
      label: "Trade Payables",
      type: "indented",
      tooltip: "Amount owed to suppliers for goods or services received on credit.",
      key: "trade_payables",
      values: { "2023": 30, "2024": 40, "2025": 50 }
    },
    {
      label: "Other Current Liabilities",
      type: "indented",
      tooltip: "Miscellaneous short-term debts not classified under borrowings or payables.",
      key: "other_current_liabilities",
      values: { "2023": 30, "2024": 40, "2025": 50 }
    },
    {
      label: "Non-Current Liabilities",
      type: "indented",
      isBold: true,
      tooltip: "Long-term financial obligations that are due after one year.",
      key: "non_current_liabilities",
      values: { "2023": 43, "2024": 55, "2025": 70 }
    },
    {
      label: "Borrowings",
      type: "indented",
      tooltip: "Long-term loans and bonds.",
      key: "non_current_borrowings",
      values: { "2023": 25, "2024": 30, "2025": 40 }
    },
    {
      label: "Other Non-Current Liabilities",
      type: "indented",
      tooltip: "Miscellaneous long-term obligations.",
      key: "other_non_current_liabilities",
      values: { "2023": 18, "2024": 25, "2025": 30 }
    },
    {
      label: "ASSETS",
      type: "category-header",
      tooltip: "Total economic resources owned by the company (Current + Non-Current Assets).",
      key: "total_assets",
      values: { "2023": 255, "2024": 330, "2025": 420 }
    },
    {
      label: "Current Assets",
      type: "sub-header",
      tooltip: "Resources that are expected to be converted to cash or consumed within one year.",
      key: "current_assets",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Trade Receivables",
      type: "indented",
      tooltip: "Money owed to the company by customers for goods/services delivered.",
      key: "trade_receivables",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Inventory",
      type: "indented",
      tooltip: "Value of raw materials, work-in-progress, and finished goods ready for sale.",
      key: "inventory",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Cash & Cash Equivalents",
      type: "indented",
      tooltip: "Highly liquid assets including physical currency and bank balances.",
      key: "cash_and_equivalents",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Other Current Assets",
      type: "indented",
      tooltip: "Miscellaneous short-term assets not categorized above.",
      key: "other_current_assets",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Non-Current Assets",
      type: "sub-header",
      tooltip: "Long-term resources such as property, plant, and equipment.",
      key: "non_current_assets",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Fixed Assets",
      type: "indented",
      tooltip: "Tangible physical assets (PP&E) used in operating the business.",
      key: "fixed_assets",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Other Non-Current Assets",
      type: "indented",
      tooltip: "Long-term investments and intangible assets.",
      key: "other_non_current_assets",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    }
  ];

  const defaultObservations = [];

  const dealDetails = useDealStore((state) => state.dealDetails);
  const financialHighlights = dealDetails?.data?.financial_highlights;

  const bsNode = financialHighlights?.balance_sheet;
  const rawApiData = bsNode?.data || data || [];

  const bsDataNode = Array.isArray(rawApiData) ? rawApiData[0] : rawApiData;
  const bsTreeData = bsDataNode?.balance_sheet_data || [];

  // Recursive tree flattener
  const flattenBSNode = (node, level = 0) => {
    if (!node || !node.metric_name) return [];

    const totalObj = node.data?.[0];
    const totalArray = totalObj?.total || [];
    const valuesByYear = {};
    totalArray.forEach(t => {
      if (t && t.year) {
        valuesByYear[t.year.toString()] = t.value;
      }
    });

    let type = "indented";
    if (level === 0) {
      type = "category-header";
    } else if (level === 1) {
      type = "sub-header";
    }

    const children = node.data?.slice(1) || [];
    const isBold = level < 2 && children.length > 0;

    const row = {
      label: node.metric_label || "",
      key: node.metric_name,
      tooltip: node.tooltip_allowed ? node.tooltip_content : null,
      type: type,
      level: level,
      isBold: isBold,
      values: valuesByYear
    };

    const flatChildren = [];
    children.forEach(child => {
      flatChildren.push(...flattenBSNode(child, level + 1));
    });

    return [row, ...flatChildren];
  };

  const rootNodes = bsTreeData.filter(node => node && node.metric_name);
  const isNewBSDynamicShape = rootNodes.length > 0;

  let finalRows = [];
  let yearsToUse = [];

  if (isNewBSDynamicShape) {
    const allYears = new Set();
    const flatRows = [];
    rootNodes.forEach(node => {
      const flattened = flattenBSNode(node, 0);
      flatRows.push(...flattened);
      flattened.forEach(row => {
        Object.keys(row.values).forEach(yr => {
          allYears.add(yr);
        });
      });
    });

    yearsToUse = Array.from(allYears).sort((a, b) => Number(a) - Number(b));
    if (yearsToUse.length === 0) {
      yearsToUse = [];
    }
    finalRows = flatRows;
  } else {
    // Fallback to legacy static rows structure
    yearsToUse = rawApiData.length > 0
      ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
      : [];
    finalRows = rawApiData.length > 0 ? balanceSheetRows : [];
  }

  // Parse observations correctly checking status
  const obsNode = bsTreeData.find(node => node && node.observation_and_insights);
  const observationHtml = (isNewBSDynamicShape && obsNode?.observation_and_insights)
    ? (obsNode.observation_and_insights.status ? transformObservationHtml(obsNode.observation_and_insights.data) : null)
    : (extractObservationHtml(financialHighlights?.balance_sheet, rawApiData) 
       || extractObservationHtml(financialHighlights?.financial_performance, financialHighlights?.financial_performance?.data));
  const showObservations = (isNewBSDynamicShape && obsNode?.observation_and_insights)
    ? (obsNode.observation_and_insights.status === true && obsNode.observation_and_insights.data !== null && obsNode.observation_and_insights.data !== undefined && String(obsNode.observation_and_insights.data).trim() !== "")
    : shouldShowSectionObservations(financialHighlights?.balance_sheet, rawApiData);

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="balance-sheet-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Scroll to view more</span>
          </div>
        )}

        <div 
          className="balanceSheetTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="balanceSheetTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {yearsToUse.map((yearStr, idx) => {
                  const isLatest = idx === yearsToUse.length - 1;
                  const displayYear = `FY ${yearStr}`;
                  return (
                    <th
                      key={yearStr}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {finalRows.map((row, rowIdx) => {
                let trClass = "tr-row";
                if (row.type === "category-header") {
                  trClass = "tr-category-header";
                } else if (row.type === "sub-header") {
                  trClass = "tr-sub-header";
                } else if (row.type === "indented") {
                  trClass = row.isBold ? "tr-indented tr-indented-bold" : "tr-indented";
                }

                const paddingLeft = row.level > 1 ? `${(row.level - 0) * 30 }px` : undefined;

                return (
                  <tr key={rowIdx} className={trClass}>
                    <td className="td-label" style={{ paddingLeft }}>
                      {row.label}
                      {row.tooltip && (
                        <span className="bs-tooltip-container">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="bs-tooltip-icon" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.72632 1.72632C3.89454 -0.441901 7.45751 -0.441901 9.62573 1.72632C11.7939 3.89454 11.7939 7.45752 9.62573 9.62573C8.52687 10.7246 7.1007 11.2595 5.67554 11.2595C4.25054 11.2594 2.82506 10.7245 1.72632 9.62573C-0.441901 7.45751 -0.441901 3.89454 1.72632 1.72632ZM5.70483 0.905029C4.47567 0.90511 3.24796 1.36288 2.30542 2.30542C0.448639 4.1622 0.448639 7.21915 2.30542 9.07593C4.16221 10.9326 7.21918 10.9327 9.07593 9.07593C10.933 7.18967 10.9323 4.16183 9.10522 2.30542L8.92554 2.13354C8.00941 1.30665 6.85725 0.905029 5.70483 0.905029ZM5.58862 4.73022C5.72065 4.73025 5.83796 4.76374 5.92163 4.84741C5.99081 4.91666 6.06812 5.02802 6.06812 5.18042V7.98022C6.0681 8.1144 6.03235 8.2417 5.90601 8.32593C5.86104 8.35589 5.81614 8.38329 5.7644 8.4021C5.71122 8.42139 5.65573 8.43041 5.58862 8.43042C5.47769 8.43042 5.37083 8.39297 5.27026 8.32593L5.26245 8.32007L5.25562 8.31323C5.18639 8.24401 5.10915 8.13273 5.10913 7.98022V5.18042C5.10913 5.04633 5.14415 4.91896 5.27026 4.83472C5.31532 4.80468 5.36003 4.77643 5.41187 4.75757C5.46519 4.73818 5.52131 4.73022 5.58862 4.73022ZM5.61792 3.12573C5.74993 3.12578 5.89673 3.15942 6.00952 3.27222C6.06137 3.32413 6.09882 3.37979 6.1228 3.44214C6.14655 3.50404 6.15503 3.56797 6.15503 3.63452C6.155 3.75914 6.12517 3.92201 5.9939 4.00952C5.94574 4.05471 5.89489 4.08921 5.83374 4.11108C5.76787 4.13461 5.69682 4.14232 5.61792 4.14233C5.53902 4.14233 5.46797 4.13457 5.4021 4.11108C5.33482 4.08706 5.27856 4.04903 5.22632 3.99683C5.17432 3.94483 5.13608 3.88937 5.11206 3.8269C5.08828 3.765 5.07985 3.70107 5.07983 3.63452C5.07983 3.52541 5.10322 3.38715 5.19702 3.29565L5.24097 3.25952C5.3518 3.15741 5.49122 3.12573 5.61792 3.12573Z" />
                          </svg>
                          <span className="bs-tooltip-text">{row.tooltip}</span>
                        </span>
                      )}
                    </td>
                    {yearsToUse.map((yearStr, idx) => {
                      const isLatest = idx === yearsToUse.length - 1;

                      let value;
                      if (isNewBSDynamicShape) {
                        value = row.values[yearStr];
                      } else {
                        const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
                        value = apiItem?.[row.key] ?? apiItem?.data?.[row.key];
                      }

                      const rawVal = extractMetricData(value);
                      let displayVal = "-";
                      if (rawVal !== null && rawVal !== undefined && rawVal !== "" && rawVal !== "N/A" && rawVal !== "n.a") {
                        const formattedNum = formatIndianNumber(rawVal);
                        displayVal = formattedNum === "-" ? "-" : `₹ ${formattedNum} Cr`;
                      }

                      return (
                        <td
                          key={yearStr}
                          className={isLatest ? "td-value-highlight" : "td-value-dim"}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {showObservations && (
        <div className="observations-container">
          <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
          {observationHtml ? (
            <div 
              className="observations-html-content"
              style={{ fontSize: "14px", lineHeight: "1.6", color: isPrivateDeal ? "#fff" : "#1F2937" }}
              dangerouslySetInnerHTML={{ __html: observationHtml }}
            />
          ) : (
            <ul className="observations-list">
              {observationsList.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const CashFlowSection = ({ isPrivateDeal, data }) => {
  const defaultObservations = [];

  const dealDetails = useDealStore((state) => state.dealDetails);
  const financialHighlights = dealDetails?.data?.financial_highlights;

  const cashFlowAnalysisNode = financialHighlights?.cash_flow_analysis || financialHighlights?.cash_flow;
  const rawApiData = cashFlowAnalysisNode?.data || data || [];

  // Identify if rawApiData is in the new dynamic shape (metrics with matric_data/data arrays)
  const isNewDynamicShape = Array.isArray(rawApiData) && rawApiData.length > 0 && 
    (rawApiData[0]?.matric_data || rawApiData[0]?.data) && 
    (rawApiData[0]?.matric_label || rawApiData[0]?.matric_name || rawApiData[0]?.financial_metrics_label);

  let finalRows = [];
  let yearsToUse = [];

  if (isNewDynamicShape) {
    // 1. Gather all unique years from all metrics to determine columns
    const allYears = new Set();
    rawApiData.forEach(metric => {
      if (!metric) return;
      const mData = metric.matric_data || metric.data || [];
      mData.forEach(d => {
        if (d && d.year) {
          allYears.add(d.year.toString());
        }
      });
    });

    yearsToUse = Array.from(allYears).sort((a, b) => Number(a) - Number(b));
    if (yearsToUse.length === 0) {
      yearsToUse = ["2023", "2024", "2025"];
    }

    // 2. Build rows dynamically
    finalRows = rawApiData.map(metric => {
      if (!metric) return null;
      const mData = metric.matric_data || metric.data || [];
      const values = {};
      mData.forEach(d => {
        if (d && d.year) {
          values[d.year.toString()] = d.value;
        }
      });

      return {
        label: metric.matric_label || metric.financial_metrics_label || "Custom Metric",
        description: metric.matric_disclaimer || metric.financial_metrics_disclaimer || "",
        key: metric.matric_name || metric.financial_metrics || "custom_key",
        values: values
      };
    }).filter(Boolean);
  } else {
    // Fallback to legacy default rows structure
    const defaultCashFlowRows = [
      {
        label: "CFO (₹ Cr)",
        description: "Cash generated from core business operations.",
        key: "cfo",
        values: { "2023": 45, "2024": 62, "2025": 88 }
      },
      {
        label: "CFI (₹ Cr)",
        description: "Cash used for investments and long-term assets.",
        key: "cfi",
        values: { "2023": -30, "2024": -45, "2025": -55 }
      },
      {
        label: "CFF (₹ Cr)",
        description: "Cash flow related to funding and borrowings.",
        key: "cff",
        values: { "2023": -10, "2024": 15, "2025": -20 }
      }
    ];

    yearsToUse = rawApiData.length > 0
      ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
      : [];

    finalRows = rawApiData.length > 0 ? defaultCashFlowRows : [];
  }

  const observationHtml = extractObservationHtml(financialHighlights?.cash_flow_analysis, rawApiData)
    || extractObservationHtml(financialHighlights?.cash_flow, rawApiData);
  const showObservations = shouldShowSectionObservations(financialHighlights?.cash_flow_analysis, rawApiData)
    || shouldShowSectionObservations(financialHighlights?.cash_flow, rawApiData);

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const formatCashFlowValue = (val) => {
    const raw = extractMetricData(val);
    if (raw === null || raw === undefined || raw === "" || raw === "N/A" || raw === "n.a") return "-";
    const num = Number(raw);
    if (isNaN(num)) return typeof raw === "string" ? raw : "-";
    const sign = num >= 0 ? "+" : ""; // Negative numbers already include "-"
    const formattedNum = formatIndianNumber(raw);
    return formattedNum === "-" ? "-" : `${sign}${formattedNum} Cr`;
  };

  const getCashFlowColorClass = (val) => {
    const raw = extractMetricData(val);
    if (raw === null || raw === undefined || raw === "" || raw === "N/A" || raw === "n.a") return "";
    const num = Number(raw);
    if (isNaN(num)) return "";
    return num >= 0 ? "cf-positive" : "cf-negative";
  };

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="cash-flow-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Scroll to view more</span>
          </div>
        )}

        <div 
          className="cashFlowTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="cashFlowTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {yearsToUse.map((yearStr, idx) => {
                  const isLatest = idx === yearsToUse.length - 1;
                  const displayYear = `FY ${yearStr}`;
                  return (
                    <th
                      key={yearStr}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {finalRows.map((row, rowIdx) => {
                return (
                  <tr key={rowIdx} className="tr-row">
                    <td className="td-label">
                      <div className="cf-metric-title">{row.label}</div>
                      <div className="cf-metric-desc">{row.description}</div>
                    </td>
                    {yearsToUse.map((yearStr, idx) => {
                      const isLatest = idx === yearsToUse.length - 1;

                      let value;
                      if (isNewDynamicShape) {
                        value = row.values[yearStr];
                      } else {
                        const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
                        value = apiItem?.[row.key] ?? apiItem?.data?.[row.key];
                      }

                      const displayVal = formatCashFlowValue(value);
                      const colorClass = getCashFlowColorClass(value);

                      return (
                        <td
                          key={yearStr}
                          className={`${isLatest ? "td-value-highlight" : "td-value-dim"} ${colorClass}`}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showObservations && (
        <div className="observations-container">
          <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
          {observationHtml ? (
            <div 
              className="observations-html-content"
              style={{ fontSize: "14px", lineHeight: "1.6", color: isPrivateDeal ? "#fff" : "#1F2937" }}
              dangerouslySetInnerHTML={{ __html: observationHtml }}
            />
          ) : (
            <ul className="observations-list">
              {observationsList.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const WorkingCapitalSection = ({ isPrivateDeal, data }) => {
  const workingCapitalRows = [
    {
      label: "Debtor Days",
      description: "Average number of days taken to collect customer payments.",
      key: "debtor_days",
      values: { "2023": 42, "2024": 38, "2025": 34 }
    },
    {
      label: "Creditor Days",
      description: "Average time taken to pay suppliers and vendors.",
      key: "creditor_days",
      values: { "2023": 55, "2024": 60, "2025": 65 }
    },
    {
      label: "Inventory Days",
      description: "Average number of days inventory remains unsold.",
      key: "inventory_days",
      values: { "2023": 42, "2024": 30, "2025": 32 }
    },
    {
      label: "CCC (Cash Conversion Cycle)",
      description: "(Debtor Days + Inventory Days - Creditor Days)",
      key: "ccc",
      isCCC: true,
      values: { "2023": 15, "2024": 8, "2025": 1 }
    }
  ];

  const defaultObservations = [];

  const rawApiData = data || [];

  const dealDetails = useDealStore((state) => state.dealDetails);
  const financialHighlights = dealDetails?.data?.financial_highlights;

  // Extract from financial_performance if working_capital is not set or empty, or if we want to prioritize it
  const performanceArray = financialHighlights?.financial_performance?.data || [];
  const mappedPerfData = performanceArray
    .filter(item => item?.status !== false && item?.value && item?.data?.working_capital)
    .map(item => {
      let yearVal = "N/A";
      if (item.value) {
        const parsed = parseFloat(item.value);
        if (!isNaN(parsed)) {
          yearVal = parsed.toFixed(0);
        } else {
          yearVal = String(item.value);
        }
      }
      const wc = item.data.working_capital;
      return {
        year: yearVal,
        debtor_days: extractMetricData(wc.debtor_days),
        creditor_days: extractMetricData(wc.creditor_days),
        inventory_days: extractMetricData(wc.inventory_days),
        working_capital_ccc: extractMetricData(wc.working_capital_ccc),
      };
    });

  const finalWcData = mappedPerfData.length > 0 ? mappedPerfData : rawApiData;

  const yearsToUse = finalWcData.length > 0
    ? [...new Set(finalWcData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2025"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = finalWcData.find(item => item?.year?.toString() === yearStr);
    return {
      year: yearStr,
      apiItem
    };
  });

  const observationHtml = extractObservationHtml(financialHighlights?.financial_performance, financialHighlights?.financial_performance?.data)
    || extractObservationHtml(financialHighlights?.working_capital, rawApiData);
  const showObservations = shouldShowSectionObservations(financialHighlights?.financial_performance, financialHighlights?.financial_performance?.data)
    || shouldShowSectionObservations(financialHighlights?.working_capital, rawApiData);

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const formatDaysValue = (val) => {
    const raw = extractMetricData(val);
    if (raw === null || raw === undefined || raw === "" || raw === "N/A" || raw === "n.a") return "-";
    const formatted = formatIndianNumber(raw);
    if (formatted === "-") return "-";
    return `${formatted} Days`;
  };

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="working-capital-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Scroll to view more</span>
          </div>
        )}

        <div 
          className="workingCapitalTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="workingCapitalTable">
            <thead>
              <tr>
                <th className="th-metric">Efficiency Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {workingCapitalRows.map((row, rowIdx) => {
                const trClass = row.isCCC ? "tr-row tr-ccc" : "tr-row";
                return (
                  <tr key={rowIdx} className={trClass}>
                    <td className="td-label">
                      <div className="wc-metric-title">{row.label}</div>
                      <div className="wc-metric-desc">{row.description}</div>
                    </td>
                    {trendsData.map((col, idx) => {
                      const isLatest = idx === trendsData.length - 1;
                      const apiItem = col.apiItem;

                      let value;
                      if (row.isCCC) {
                        const debtorVal = extractMetricData(apiItem?.debtor_days ?? apiItem?.data?.debtor_days);
                        const creditorVal = extractMetricData(apiItem?.creditor_days ?? apiItem?.data?.creditor_days);
                        const inventoryVal = extractMetricData(apiItem?.inventory_days ?? apiItem?.data?.inventory_days);
                        const cccVal = extractMetricData(apiItem?.working_capital_ccc ?? apiItem?.data?.working_capital_ccc);

                        if (cccVal !== undefined && cccVal !== null) {
                          value = cccVal;
                        } else if (debtorVal !== undefined && creditorVal !== undefined && inventoryVal !== undefined && debtorVal !== null && creditorVal !== null && inventoryVal !== null) {
                          const dNum = Number(debtorVal);
                          const iNum = Number(inventoryVal);
                          const cNum = Number(creditorVal);
                          if (!isNaN(dNum) && !isNaN(iNum) && !isNaN(cNum)) {
                            value = dNum + iNum - cNum;
                          } else {
                            value = null;
                          }
                        } else {
                          value = null;
                        }
                      } else {
                        value = extractMetricData(apiItem?.[row.key] ?? apiItem?.data?.[row.key]);
                      }

                      const displayVal = formatDaysValue(value);

                      return (
                        <td
                          key={col.year}
                          className={isLatest ? "td-value-highlight" : "td-value-dim"}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showObservations && (
        <div className="observations-container">
          <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
          {observationHtml ? (
            <div 
              className="observations-html-content"
              style={{ fontSize: "14px", lineHeight: "1.6", color: isPrivateDeal ? "#fff" : "#1F2937" }}
              dangerouslySetInnerHTML={{ __html: observationHtml }}
            />
          ) : (
            <ul className="observations-list">
              {observationsList.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const Keyfinancials = ({ isPrivateDeal = false, dealDetails: dealDetailsProp }) => {


  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;

  const transformFinancialData = (apiData) => {
    try {
      const perfArray = apiData?.financial_performance?.data;
      if (!Array.isArray(perfArray)) {
        console.warn("KeyFinancials: financial_performance.data is not an array");
        return [];
      }

      return perfArray
        .filter((yearObj) => yearObj?.status && yearObj?.data)
        .map((yearObj) => {
          const year = yearObj.value || "N/A";
          const yearData = yearObj.data || {};

          return {
            year: year.toString(),


            revenue: {
              status: yearData.revenue_in_cr?.status || false,
              value: extractMetricData(yearData.revenue_in_cr)
            },

            // growth
            growth: {
              status: yearData.topline_growth_percent?.status || false,
              value: extractMetricData(yearData.topline_growth_percent)
            },

            // earnings
            ebitda: {
              status: yearData.earnings?.ebitda_in_cr?.status || false,
              value: extractMetricData(yearData.earnings?.ebitda_in_cr),
            },
            pat: {
              status: yearData.earnings?.pat_in_cr?.status || false,
              value: extractMetricData(yearData.earnings?.pat_in_cr),
            },

            // valuation
            peratio: {
              status: yearData.valuation?.pe_ratio?.status || false,
              value: extractMetricData(yearData.valuation?.pe_ratio),
            },

            // returns on capital
            roa: {
              status: yearData.returns_on_capital?.roa_percent?.status || false,
              value: extractMetricData(yearData.returns_on_capital?.roa_percent),
            },
            roe: {
              status: yearData.returns_on_capital?.roe_percent?.status || false,
              value: extractMetricData(yearData.returns_on_capital?.roe_percent),
            },
            roce: {
              status: yearData.returns_on_capital?.roce_percent?.status || false,
              value: extractMetricData(yearData.returns_on_capital?.roce_percent),
            },

            // leverage and coverage
            debttoequity: {
              status:
                yearData.leverage_and_coverage?.debt_to_equity?.status || false,
              value:
                extractMetricData(yearData.leverage_and_coverage?.debt_to_equity),
            },
            interestcoverage: {
              status:
                yearData.leverage_and_coverage?.interest_coverage_ratio?.status ||
                false,
              value:
                extractMetricData(yearData.leverage_and_coverage?.interest_coverage_ratio),
            },

            // working capital
            debtordays: {
              status: yearData.working_capital?.debtor_days?.status || false,
              value: extractMetricData(yearData.working_capital?.debtor_days),
            },
            creditordays: {
              status: yearData.working_capital?.creditor_days?.status || false,
              value: extractMetricData(yearData.working_capital?.creditor_days),
            },
            inventorydays: {
              status: yearData.working_capital?.inventory_days?.status || false,
              value: extractMetricData(yearData.working_capital?.inventory_days),
            },

            // asset efficiency
            longtermfundstofixed: {
              status:
                yearData.asset_efficiency?.lt_funds_to_fixed_assets?.status ||
                false,
              value:
                extractMetricData(yearData.asset_efficiency?.lt_funds_to_fixed_assets),
            },

            // liquidity
            currentratio: {
              status: yearData.liquidity?.current_ratio?.status || false,
              value: extractMetricData(yearData.liquidity?.current_ratio),
            },

            // cost structure
            cogs: {
              status:
                yearData.cost_structure?.cogs_percent_of_revenue?.status || false,
              value:
                extractMetricData(yearData.cost_structure?.cogs_percent_of_revenue),
            },
          };
        });
    } catch (error) {
      console.error("KeyFinancials: Error transforming financial data", error);
      return [];
    }
  };



  const getFinancialData = () => {
    try {
      if (isPrivateDeal) {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      } else {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      }
    } catch (error) {
      console.error('KeyFinancials: Error getting financial data', error);
      return [];
    }
  };

  const financialData = getFinancialData();
  const data = financialData.length > 0 ? financialData : (isPrivateDeal ? [] : []);

  const performanceArray = dealDetails?.data?.financial_highlights?.financial_performance?.data || [];
  const hasWorkingCapitalData = performanceArray.some(item => {
    const wc = item?.data?.working_capital;
    if (!wc) return false;
    const debtor = extractMetricData(wc.debtor_days);
    const creditor = extractMetricData(wc.creditor_days);
    const inventory = extractMetricData(wc.inventory_days);
    return (debtor !== null && debtor !== undefined && debtor !== "") ||
           (creditor !== null && creditor !== undefined && creditor !== "") ||
           (inventory !== null && inventory !== undefined && inventory !== "");
  }) || !!(dealDetails?.data?.financial_highlights?.working_capital?.data?.length > 0);

  const hasBalanceSheetData = !!(dealDetails?.data?.financial_highlights?.balance_sheet?.data?.length > 0);

  const hasCashFlowData = !!(dealDetails?.data?.financial_highlights?.cash_flow_analysis?.data?.length > 0 || dealDetails?.data?.financial_highlights?.cash_flow?.data?.length > 0);

  const ratiosNode = dealDetails?.data?.financial_highlights?.financial_ratio;
  const rawRatiosData = ratiosNode?.data || [];
  const ratiosObservationHtml = extractObservationHtml(ratiosNode, rawRatiosData);
  const showRatiosObservations = shouldShowSectionObservations(ratiosNode, rawRatiosData);

  const defaultRatiosObservations = [];
  const apiRatiosObservations = rawRatiosData?.[0]?.observations || defaultRatiosObservations;
  const ratiosObservationsList = Array.isArray(apiRatiosObservations) ? apiRatiosObservations : defaultRatiosObservations;

  const showData = dealDetails?.data?.financial_highlights?.financial_performance?.data?.data?.revenue_in_cr?.status;
  console.log('Showing the data for Revenue', showData);

  const ratioData = dealDetails?.data?.financial_highlights?.financial_ratio?.data || [];

  const isRatioValid = (keys) => {
    if (!Array.isArray(ratioData) || ratioData.length === 0) return false;
    return ratioData.some(item => {
      if (!item || typeof item !== 'object' || item.observation_and_insights) return false;
      return keys.some(key => {
        const val = extractMetricData(item[key]);
        return val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
      });
    });
  };

  const ratioTabVisibility = {
    "Debt to Equity (x)": isRatioValid(["debt_to_equity"]),
    "Interest Coverage Ratio (x)": isRatioValid(["interest_coverage", "interest_coverage_ratio"]),
    "Current Ratio (x)": isRatioValid(["current_ratio", "currentratio"]),
    "ROA (%)": isRatioValid(["roa", "roa_percent"]),
    "ROE (%)": isRatioValid(["roe", "roe_percent"]),
    "ROCE (%)": isRatioValid(["roce", "roce_percent"]),
  };

  const tabs = [
    { key: "Debt to Equity (x)", label: "Debt to Equity (x)" },
    { key: "Interest Coverage Ratio (x)", label: "Interest Coverage Ratio (x)" },
    { key: "Current Ratio (x)", label: "Current Ratio (x)" },
    { key: "ROA (%)", label: "ROA (%)" },
    { key: "ROE (%)", label: "ROE (%)" },
    { key: "ROCE (%)", label: "ROCE (%)" },
  ];

  const visibleTabs = tabs.filter(tab => ratioTabVisibility[tab.key]);

  const [activeTab, setActiveTab] = useState("Debt to Equity (x)");

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some(t => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    const updateActiveIndicator = () => {
      if (tabsContainerRef.current) {
        const activeTabElement = tabsContainerRef.current.querySelector(".customTab.active");
        if (activeTabElement) {
          setActiveStyle({
            left: activeTabElement.offsetLeft,
            width: activeTabElement.offsetWidth,
          });
        }
      }
    };

    updateActiveIndicator();
    const timer = setTimeout(updateActiveIndicator, 50);

    window.addEventListener("resize", updateActiveIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateActiveIndicator);
    };
  }, [activeTab]);

  const tabDescriptions = {
    "Debt to Equity (x)": "Measures the company’s leverage relative to shareholder equity.",
    "Interest Coverage Ratio (x)": "Shows the company’s ability to meet interest obligations.",
    "Current Ratio (x)": "Evaluates short-term liquidity and financial stability.",
    "ROA (%)": "Measures profitability generated from total assets.",
    "ROE (%)": "Measures how efficiently the company generates profits from shareholder equity.",
    "ROCE (%)": "Evaluates efficiency in utilizing capital employed.",
  };

  const formattedData = data.map((item) => ({
    ...item,
    debttoequity: {
      ...item.debttoequity,
      value:
        item?.debttoequity?.value != null && !Number.isNaN(Number(item.debttoequity.value))
          ? Number(item.debttoequity.value).toFixed(1)
          : item?.debttoequity?.value,
    },
    currentratio: {
      ...item.currentratio,
      value:
        item?.currentratio?.value != null && !Number.isNaN(Number(item.currentratio.value))
          ? Number(item.currentratio.value).toFixed(1)
          : item?.currentratio?.value,
    },
    cogs: {
      ...item.cogs,
      value:
        item?.cogs?.value != null && !Number.isNaN(Number(item.cogs.value))
          ? Number(item.cogs.value).toFixed(1)
          : item?.cogs?.value,
    },
  }));

  // Track open/close state for each main section
  const [openStates, setOpenStates] = useState({
    financialTrends: true,
    balanceSheet: true,
    cashFlow: true,
    workingCapital: true,
    financialRatios: true,
    documents: true,
  });

  // Track open/close state for nested yearly accordions
  const [nestedOpen, setNestedOpen] = useState(() => {
    const sorted = [...data].sort((a, b) => b.year - a.year);

    const initial = {};
    sorted.forEach((item, index) => {
      initial[item.year] = index === 0; // first year open, rest closed
    });
    return initial;
  });

  const toggleSection = (section) => {
    setOpenStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleYear = (year) => {
    setNestedOpen((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };
  return (
    // <div className="key-financials-container">
    <div
      className={`key-financials-container ${isPrivateDeal ? "private-deal" : ""
        }`}
    >
      {/* Financial Trends */}
      {dealDetails?.data?.financial_highlights?.financial_trends?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialTrends")}
          >
            <h3>Income Statement</h3>
            <span>
              <AccordionToggleIcon isOpen={openStates.financialTrends} />
            </span>
          </div>
          <Collapse in={openStates.financialTrends}>
            <div className="section-body">
              <p className="section-sub-header">
                Revenue growth with EBITDA and PAT margins
              </p>
              <Barchart
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
              <IncomeStatementTrends
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Balance Sheet */}
      {(hasBalanceSheetData || dealDetails?.data?.financial_highlights?.financial_performance?.status) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("balanceSheet")}
          >
            <h3>Balance Sheet</h3>
            <span>
              <AccordionToggleIcon isOpen={openStates.balanceSheet} />
            </span>
          </div>

          <Collapse in={openStates.balanceSheet}>
            <div className="section-body financial-performance-ui">
              <BalanceSheetSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.balance_sheet?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Cash Flow */}
      {(hasCashFlowData || dealDetails?.data?.financial_highlights?.financial_performance?.status) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("cashFlow")}
          >
            <h3>Cash Flow</h3>
            <span>
              <AccordionToggleIcon isOpen={openStates.cashFlow} />
            </span>
          </div>

          <Collapse in={openStates.cashFlow}>
            <div className="section-body financial-performance-ui">
              <CashFlowSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.cash_flow_analysis?.data || dealDetails?.data?.financial_highlights?.cash_flow?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Working Capital */}
      {(hasWorkingCapitalData || (dealDetails?.data?.financial_highlights?.working_capital?.status && Array.isArray(dealDetails?.data?.financial_highlights?.working_capital?.data) && dealDetails.data.financial_highlights.working_capital.data.length > 0)) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("workingCapital")}
          >
            <h3>Working Capital</h3>
            <span>
              <AccordionToggleIcon isOpen={openStates.workingCapital} />
            </span>
          </div>

          <Collapse in={openStates.workingCapital}>
            <div className="section-body financial-performance-ui">
              <WorkingCapitalSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.working_capital?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Financial Ratios */}
      {dealDetails?.data?.financial_highlights?.financial_ratio?.status && visibleTabs.length > 0 && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialRatios")}
          >
            <h3>Financial Ratios</h3>
            <span>
              <AccordionToggleIcon isOpen={openStates.financialRatios} />
            </span>
          </div>
          <Collapse in={openStates.financialRatios}>
            <div className="section-body">
              <div>
                {/* Tabs Header */}
                <div className="customTabsWrapper">
                  <div className="customTabs" ref={tabsContainerRef} style={{ position: "relative" }}>
                    <div
                      className="customTabIndicator"
                      style={{
                        left: `${activeStyle.left}px`,
                        width: `${activeStyle.width}px`,
                      }}
                    />
                    {visibleTabs.map((tab) => (
                      <button
                        key={tab.key}
                        className={`customTab ${activeTab === tab.key ? "active" : ""
                          }`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Description */}
                <div className="ratioTabDescription">
                  {tabDescriptions[activeTab]}
                </div>

                {/* Tabs Content */}
                <div className="tabContent">
                  {activeTab === "ROCE (%)" && (
                    <ROCEBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "ROE (%)" && (
                    <ROEBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "ROA (%)" && (
                    <ROABarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Current Ratio (x)" && (
                    <CurrentRatioBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Interest Coverage Ratio (x)" && (
                    <InterestCoverageBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Debt to Equity (x)" && (
                    <DebtBarChart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                </div>

                {/* Observations & Insights for Financial Ratios */}
                {showRatiosObservations && (
                  <div className="observations-container" style={{ marginTop: "24px" }}>
                    <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
                    {ratiosObservationHtml ? (
                      <div 
                        className="observations-html-content"
                        style={{ fontSize: "14px", lineHeight: "1.6", color: isPrivateDeal ? "#fff" : "#1F2937" }}
                        dangerouslySetInnerHTML={{ __html: ratiosObservationHtml }}
                      />
                    ) : (
                      <ul className="observations-list">
                        {ratiosObservationsList.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>
            </div>
          </Collapse>
        </div>
      )}


      {/* Documents */}
      {/* <div className="section">
        <div
          className="section-header"
          onClick={() => toggleSection("documents")}
        >
          <h3>Documents</h3>
          <span>{openStates.documents ? <ChevronUp /> : <ChevronDown />}</span>
        </div>
        <Collapse in={openStates.documents}>
          <div className="section-body">
           
          </div>
        </Collapse>
      </div> */}
    </div>
  );
};

export default Keyfinancials;
