"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./market-analysis.module.css";

const getCurrencySymbol = (curr) => {
  if (!curr) return "";
  if (curr === "INR" || curr === "₹") return "₹";
  if (curr === "USD" || curr === "$") return "$";
  if (curr === "EUR" || curr === "€") return "€";
  if (curr === "GBP" || curr === "£") return "£";
  return curr;
};

const formatValue = (val, currency, unit, ratio) => {
  const hasVal = val !== null && val !== undefined && val !== "";
  const hasRatio = ratio !== null && ratio !== undefined && ratio !== "";

  if (!hasVal && !hasRatio) return "-";
  
  let targetVal = hasVal ? val : ratio;
  
  let formattedVal = targetVal;
  if (typeof targetVal === "number") {
    formattedVal = targetVal.toLocaleString("en-IN");
  }
  
  let valStr = String(formattedVal);
  let currSymbol = getCurrencySymbol(currency);
  let curr = currSymbol && !valStr.includes(currSymbol) ? currSymbol : "";
  let unitStr = unit && !valStr.includes(unit) ? (unit === "%" || unit === "x" ? unit : ` ${unit}`) : "";
  
  let result = `${curr}${valStr}${unitStr}`.trim();
  if (hasVal && hasRatio && !result.includes(String(ratio)) && String(val) !== String(ratio)) {
    result += ` | Ratio: ${ratio}`;
  }
  return result;
};

const formatChange = (changeVal, unit, currency) => {
  if (changeVal === null || changeVal === undefined || changeVal === "") {
    return { text: "-", isPositive: false, isNegative: false };
  }

  const currSymbol = getCurrencySymbol(currency);
  let num = typeof changeVal === "number" ? changeVal : parseFloat(changeVal);
  if (!isNaN(num)) {
    const isPositive = num >= 0;
    const isNegative = num < 0;
    const sign = num > 0 ? "+" : "";
    const currStr = currSymbol ? currSymbol : "";
    const unitStr = unit ? (unit === "%" || unit === "x" ? unit : ` ${unit}`) : "";
    const formattedNum = Math.abs(num).toLocaleString("en-IN", { maximumFractionDigits: 4 });
    const signPrefix = isNegative ? "-" : sign;
    const text = `${signPrefix}${currStr}${formattedNum}${unitStr}`;
    return {
      text,
      isPositive,
      isNegative
    };
  } else {
    const str = String(changeVal);
    const isPositive = !str.startsWith("-");
    const isNegative = str.startsWith("-");
    return {
      text: str,
      isPositive,
      isNegative
    };
  }
};

const formatIndexCardChange = (item, defaultFallback) => {
  if (!item) return { text: defaultFallback, isPositive: !defaultFallback.startsWith("-"), isNegative: defaultFallback.startsWith("-") };

  const changeVal = item.particulars_change;
  const todayVal = item.particulars_today_value;
  const prevVal = item.particulars_previous_value;

  if (changeVal === null || changeVal === undefined || changeVal === "") {
    return { text: "-", isPositive: false, isNegative: false };
  }

  // If changeVal is already a string
  if (typeof changeVal === "string") {
    let str = changeVal.trim();
    const isPositive = !str.startsWith("-");
    const isNegative = str.startsWith("-");

    if (!str.toLowerCase().includes("vs prev")) {
      str = `${str} VS Prev.Close`;
    }
    return { text: str, isPositive, isNegative };
  }

  // If changeVal is a number
  if (typeof changeVal === "number") {
    const isPositive = changeVal >= 0;
    const isNegative = changeVal < 0;
    const sign = changeVal > 0 ? "+" : "";
    const formattedChange = Math.abs(changeVal).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const signPrefix = isNegative ? "-" : sign;

    let pctStr = "";
    let prevNum = typeof prevVal === "number" ? prevVal : parseFloat(prevVal);
    if (!isNaN(prevNum) && prevNum !== 0) {
      const pct = (changeVal / prevNum) * 100;
      const formattedPct = Math.abs(pct).toFixed(2);
      const pctSign = pct > 0 ? "+" : pct < 0 ? "-" : "";
      pctStr = ` (${pctSign}${formattedPct}%)`;
    }

    const text = `${signPrefix}${formattedChange}${pctStr} VS Prev.Close`;
    return { text, isPositive, isNegative };
  }

  return formatChange(changeVal, item.particulars_change_unit, item.particulars_change_currency);
};

export default function MarketAnalysisClient({ initialData }) {
  const [timeStr, setTimeStr] = useState("14:14:25 UTC | MAY 28, 2026");
  const [postData, setPostData] = useState(initialData || null);

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    // If initialData was already provided by SSR, avoid duplicate fetch
    if (initialData && !postData) {
      setPostData(initialData);
      return;
    }

    const fetchMarketPulse = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/admin/api/community/live-puls-posts`);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.data || json?.data;
          const data = Array.isArray(list) ? list[0] : list;
          if (data && typeof data === "object") {
            setPostData(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch market pulse data:", err);
      }
    };

    if (!postData) {
      fetchMarketPulse();
    }
  }, [initialData, postData]);

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
  }, []);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      
      const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
      ];
      const month = months[now.getUTCMonth()];
      const day = now.getUTCDate();
      const year = now.getUTCFullYear();

      setTimeStr(`${hours}:${minutes}:${seconds} UTC | ${month} ${day}, ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Particulars cards
  const niftyParticular = postData?.particulars?.find(p => p.particulars_key === "nifty-50");
  const giftParticular = postData?.particulars?.find(p => p.particulars_key === "gift-nifty");
  const tentativeParticular = postData?.particulars?.find(p => p.particulars_key === "tentative-opening");

  const niftyChange = formatIndexCardChange(niftyParticular, "-25.10 (-0.10%) VS Prev.Close");
  const giftChange = formatIndexCardChange(giftParticular, "+78 (+0.31%) VS Prev.Close");
  const tentativeChange = formatIndexCardChange(tentativeParticular, "+78 (+0.31%) VS Prev.Close");

  let tableParticulars = postData?.particulars?.filter(
    p => p.particulars_key !== "nifty-50" && p.particulars_key !== "tentative-opening"
  ) || postData?.particulars;

  if (Array.isArray(tableParticulars) && tableParticulars.length > 0) {
    const mainItems = [];
    let gainersItem = null;
    let losersItem = null;
    let volumeItem = null;

    tableParticulars.forEach(p => {
      if (p.particulars_key === "top-2-sector-gainers") {
        gainersItem = p;
      } else if (p.particulars_key === "top-2-sector-losers") {
        losersItem = p;
      } else if (p.particulars_key === "volume-spikes-nifty-sensex") {
        volumeItem = p;
      } else {
        mainItems.push(p);
      }
    });

    if (gainersItem) mainItems.push(gainersItem);
    if (losersItem) mainItems.push(losersItem);
    if (volumeItem) mainItems.push(volumeItem);

    tableParticulars = mainItems;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContainer}>
        {/* Header Section */}
        <div className={styles.headerWrap}>
          <header className={styles.headerSection}>
            <div className={styles.headerLeft}>
              <div className={styles.systemRow}>
                <span className={styles.liveBadge}>
                  LIVE &bull; MARKET PULSE
                </span>
                <span className={styles.systemVersion}>
                  PR.EQT INTEL SYSTEM v4.1
                </span>
              </div>
              
              <h1 className={styles.mainHeading}>
                PR.EQT MARKET INTELLIGENCE <span className={styles.highlightTerminal}>TERMINAL</span>
              </h1>
              
              <p className={styles.subText}>
                Daily Quantitative Snapshots | Indian Macro Securities | Private & Public Venture Data
              </p>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.institutionalPill}>
                <span className={styles.institutionalText}>
                  FOR INSTITUTIONAL USE ONLY
                </span>
              </div>

              <div className={styles.clockWrapper}>
                <span className={styles.clockIcon}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M7 3.5V7.2H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.clockText}>
                  {timeStr}
                </span>
              </div>
            </div>
          </header>
        </div>

        {/* Content Section containing Indices and Score Interpretation */}
        <section className={styles.contentSection}>
          {/* Indices Cards Grid */}
          <div className={styles.indicesGrid}>
            
            {/* Card 1: NIFTY 50 */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>
                {niftyParticular?.particulars_label || niftyParticular?.particulers_label || "NIFTY 50"}
              </h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>
                  {niftyParticular 
                    ? formatValue(
                        niftyParticular.particulars_today_value,
                        niftyParticular.particulars_today_value_currency,
                        niftyParticular.particulars_today_value_unit,
                        niftyParticular.particulars_today_value_ratio
                      )
                    : "24,205.10"
                  }
                </span>
                <span className={`${styles.changePill} ${niftyParticular ? (niftyChange.isNegative ? styles.negativePill : styles.positivePill) : styles.negativePill}`}>
                  <span className={styles.arrowIcon}>
                    {niftyParticular && !niftyChange.isNegative ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                        <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                        <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {niftyParticular ? niftyChange.text : "-25.10 (-0.10%)"}
                </span>
              </div>
              <p className={styles.prevCloseText}>
                Prev. Close: {niftyParticular 
                  ? formatValue(
                      niftyParticular.particulars_previous_value,
                      niftyParticular.particulars_previous_value_currency,
                      niftyParticular.particulars_previous_value_unit,
                      niftyParticular.particulars_previous_value_ratio
                    )
                  : "23,661.50"
                }
              </p>
              <span className={styles.sourceLabel}>
                Source: {niftyParticular?.particulars_source_name || "NSE India"} / {niftyParticular?.particulars_source_url || "nseindia.com"}
              </span>
            </article>

            {/* Card 2: GIFT NIFTY */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>
                {giftParticular?.particulars_label || giftParticular?.particulers_label || "GIFT NIFTY"}
              </h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>
                  {giftParticular 
                    ? formatValue(
                        giftParticular.particulars_today_value,
                        giftParticular.particulars_today_value_currency,
                        giftParticular.particulars_today_value_unit,
                        giftParticular.particulars_today_value_ratio
                      )
                    : "24,205.10"
                  }
                </span>
                <span className={`${styles.changePill} ${giftParticular ? (giftChange.isNegative ? styles.negativePill : styles.positivePill) : styles.positivePill}`}>
                  <span className={styles.arrowIcon}>
                    {giftParticular && giftChange.isNegative ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                        <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                        <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {giftParticular ? giftChange.text : "+78 (+0.31%) VS Prev.Close"}
                </span>
              </div>
              <p className={styles.prevCloseText}>
                {giftParticular 
                  ? `Prev. Close: ${formatValue(
                      giftParticular.particulars_previous_value,
                      giftParticular.particulars_previous_value_currency,
                      giftParticular.particulars_previous_value_unit,
                      giftParticular.particulars_previous_value_ratio
                    )}`
                  : "Prev. Session 3 Close 25,234.50"
                }
              </p>
              <span className={styles.sourceLabel}>
                Source: {giftParticular?.particulars_source_name || "NSE India"} / {giftParticular?.particulars_source_url || "nseindia.com"}
              </span>
            </article>

            {/* Card 3: TENTATIVE OPENING */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>
                {tentativeParticular?.particulars_label || tentativeParticular?.particulers_label || "TENTATIVE OPENING"}
              </h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>
                  {tentativeParticular 
                    ? formatValue(
                        tentativeParticular.particulars_today_value,
                        tentativeParticular.particulars_today_value_currency,
                        tentativeParticular.particulars_today_value_unit,
                        tentativeParticular.particulars_today_value_ratio
                      )
                    : "24,205.10"
                  }
                </span>
                <span className={`${styles.changePill} ${tentativeParticular ? (tentativeChange.isNegative ? styles.negativePill : styles.positivePill) : styles.positivePill}`}>
                  <span className={styles.arrowIcon}>
                    {tentativeParticular && tentativeChange.isNegative ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                        <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                        <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {tentativeParticular ? tentativeChange.text : "+78 (+0.31%) VS Prev.Close"}
                </span>
              </div>
              <p className={styles.prevCloseText}>
                {tentativeParticular 
                  ? `Nifty Prev. Close: ${formatValue(
                      tentativeParticular.particulars_previous_value,
                      tentativeParticular.particulars_previous_value_currency,
                      tentativeParticular.particulars_previous_value_unit,
                      tentativeParticular.particulars_previous_value_ratio
                    )}`
                  : "Nifty Prev. Close: 25,234.80"
                }
              </p>
              <span className={styles.sourceLabel}>
                Source: {tentativeParticular?.particulars_source_name || "NSE India"} / {tentativeParticular?.particulars_source_url || "nseindia.com"}
              </span>
            </article>

          </div>

          {/* PR.QTY INDEX SCORE Interpretation Banner */}
          <div className={styles.scoreBanner}>
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>PR.QTY INDEX SCORE</span>
              <div className={styles.scoreValueRow}>
                <span className={styles.scoreMain}>{postData?.index_score ?? "-"}</span>
                <span className={styles.scoreMax}>/ 10</span>
              </div>
              <div className={styles.bullishBadge}>
                <span className={styles.bullishDot}></span>
                {postData?.market_remark || ""}
              </div>
            </div>

            <div className={styles.interpretationBox}>
              <h4 className={styles.interpretationTitle}>{postData?.market_remark_heading || "SCORE INTERPRETATION"}</h4>
              <p className={styles.interpretationText}>
                {postData?.market_remark_description || "Current market conditions indicate favorable sentiment with strong domestic institutional flows and stable macro indicators. Volatility remains contained within acceptable ranges."}
              </p>
              <div className={styles.signalRow}>
                <span className={styles.signalBullet}>&bull;</span>
                <p className={styles.signalText}>
                  Signal: {postData?.market_remark_signal || "Balanced risk profile. Accumulate in tranches toward high recovery operators."}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Data Table */}
          <div className={styles.tableWrapperRelative}>
            <div className={`${styles.scrollShadowLeft} ${showLeftShadow ? styles.visible : ""}`} />
            <div className={`${styles.scrollShadowRight} ${showRightShadow ? styles.visible : ""}`} />
            
            {showScrollHint && (
              <div className={styles.scrollHintBadge} onClick={() => setShowScrollHint(false)}>
                <span className={styles.scrollHintIconWrapper}>
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
              className={styles.tableContainer}
              ref={tableWrapperRef}
              onScroll={handleScroll}
            >
              <table className={styles.analysisTable}>
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th>Today</th>
                    <th>1 Day (Prev.)</th>
                    <th>Chg.</th>
                    <th>Signal / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {tableParticulars && tableParticulars.length > 0 ? (
                    tableParticulars.map((item) => {
                      const key = item.particulars_key;
                      const label = item.particulars_label || item.particulers_label || "";
                      const noteSignal = item.particulers_notes_signal || item.particulars_notes_signal || "";

                      // Special Row: Top 2 Sector Gainers
                      if (key === "top-2-sector-gainers") {
                        const lines = noteSignal ? noteSignal.split(/\r?\n/) : [];
                        return (
                          <tr className={styles.specialRow} key={item.id || key}>
                            <td>
                              <div className={styles.particularsCell}>
                                <span className={styles.particularsTitle}>{label}</span>
                                <span className={styles.particularsSource}>
                                  Source: {item.particulars_source_name || "NSE India"} / {item.particulars_source_url || "nseindia.com"}
                                </span>
                              </div>
                            </td>
                            <td colSpan="4" className={styles.gainersSpanCell}>
                              <div className={styles.spanningContainer}>
                                {lines.map((line, idx) => {
                                  let highlight = line;
                                  let desc = "";
                                  if (line.includes("-")) {
                                    const parts = line.split("-");
                                    highlight = parts[0].trim() + " -";
                                    desc = parts.slice(1).join("-").trim();
                                  }
                                  return (
                                    <div className={styles.spanningLine} key={idx}>
                                      <span className={styles.spanningHighlightGreen}>{highlight} </span>
                                      {desc && <span className={styles.spanningDesc}>{desc}</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Special Row: Top 2 Sector Losers
                      if (key === "top-2-sector-losers") {
                        const lines = noteSignal ? noteSignal.split(/\r?\n/) : [];
                        return (
                          <tr className={styles.specialRow} key={item.id || key}>
                            <td>
                              <div className={styles.particularsCell}>
                                <span className={styles.particularsTitle}>{label}</span>
                                <span className={styles.particularsSource}>
                                  Source: {item.particulars_source_name || "NSE India"} / {item.particulars_source_url || "nseindia.com"}
                                </span>
                              </div>
                            </td>
                            <td colSpan="4" className={styles.losersSpanCell}>
                              <div className={styles.spanningContainer}>
                                {lines.map((line, idx) => {
                                  let highlight = line;
                                  let desc = "";
                                  if (line.includes("-")) {
                                    const parts = line.split("-");
                                    highlight = parts[0].trim() + " -";
                                    desc = parts.slice(1).join("-").trim();
                                  }
                                  return (
                                    <div className={styles.spanningLine} key={idx}>
                                      <span className={styles.spanningHighlightRed}>{highlight} </span>
                                      {desc && <span className={styles.spanningDesc}>{desc}</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Standard Row
                      const changeInfo = formatChange(
                        item.particulars_change,
                        item.particulars_change_unit,
                        item.particulars_change_currency
                      );

                      return (
                        <tr key={item.id || key}>
                          <td>
                            <div className={styles.particularsCell}>
                              <span className={styles.particularsTitle}>{label}</span>
                              <span className={styles.particularsSource}>
                                Source: {item.particulars_source_name || "NSE India"} / {item.particulars_source_url || "nseindia.com"}
                              </span>
                            </div>
                          </td>
                          <td className={styles.todayCell}>
                            {formatValue(
                              item.particulars_today_value,
                              item.particulars_today_value_currency,
                              item.particulars_today_value_unit,
                              item.particulars_today_value_ratio
                            )}
                          </td>
                          <td className={styles.prevCell}>
                            {formatValue(
                              item.particulars_previous_value,
                              item.particulars_previous_value_currency,
                              item.particulars_previous_value_unit,
                              item.particulars_previous_value_ratio
                            )}
                          </td>
                          <td className={`${styles.changeCell} ${changeInfo.isPositive ? styles.changePositive : changeInfo.isNegative ? styles.changeNegative : ""}`}>
                            {changeInfo.text}
                          </td>
                          <td>
                            <div className={styles.signalCell}>
                              {changeInfo.text !== "-" && (
                                <span className={styles.signalArrow}>
                                  {changeInfo.isNegative ? (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                                      <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                              )}
                              {noteSignal || "-"}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      {/* Fallback Static Rows before API data loads */}
                      <tr>
                        <td>
                          <div className={styles.particularsCell}>
                            <span className={styles.particularsTitle}>US 10Y Treasury Yield</span>
                            <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                          </div>
                        </td>
                        <td className={styles.todayCell}>4.25%</td>
                        <td className={styles.prevCell}>4.21%</td>
                        <td className={`${styles.changeCell} ${styles.changePositive}`}>+0.04%</td>
                        <td>
                          <div className={styles.signalCell}>
                            <span className={styles.signalArrow}>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                                <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            Easing yields support risk-on sentiment
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

