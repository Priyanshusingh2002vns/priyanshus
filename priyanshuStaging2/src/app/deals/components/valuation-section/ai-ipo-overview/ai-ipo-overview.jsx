import React, { useEffect, useState, useRef } from "react";
import "./ai-ipo-overview.css";
import Image from "next/image";
import { OfferDateIcon, PatIcon, PeMultiple, RevenueIcon, Valuation } from "../../name-section/svgicon";
import { Collapse } from "react-bootstrap";
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from "lucide-react";
import { useDealStore } from "@/store/dealStore";
import Link from "next/link";
import Shares from "../../shares-section/shares";


// Local-only utility to normalize deal payloads for different deal types


const AiIpoOverview = ({ isPrivateDeal, isofs, isccps, dealDetails: dealDetailsProp }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isBelow920, setIsBelow920] = useState(false);
  const [expandedFields, setExpandedFields] = useState(true);
  const [open, setOpen] = useState(false);
  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const dealData = dealDetails?.data?.deal_setpData;

  const dealType = dealDetails?.data?.deal_type;
  const isunlisted = dealType === "unlisted";
  // OFS and CCPS deals behave exactly like private deals
  const isPrivateLike = isPrivateDeal || isofs || isccps || isunlisted;
  const isDarkTheme = isPrivateDeal || isofs || isccps; // Excludes unlisted
  
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("600px");

  useEffect(() => {
    if (contentRef.current) {
      const measure = () => {
        if (contentRef.current) {
          setContentHeight(`${contentRef.current.scrollHeight}px`);
        }
      };
      measure();
      const timer = setTimeout(measure, 150);
      return () => clearTimeout(timer);
    }
  }, [dealData, isBelow920]);

  const collapsedHeight = isPrivateLike ? "165px" : "130px";
  const inlineMaxHeight = isBelow920
    ? (expandedFields ? contentHeight : collapsedHeight)
    : "none";
  
  const hasFromAndTo = dealData?.offer_date?.status &&
    dealData?.offer_date?.data &&
    typeof dealData.offer_date.data === "object" &&
    dealData.offer_date.data.from &&
    dealData.offer_date.data.to;

  const isOfferDateNull = !dealData?.offer_date?.data || 
    dealData.offer_date.data === "null" ||
    dealData.offer_date.data === "" ||
    (typeof dealData.offer_date.data === "object" && 
     (!dealData.offer_date.data.from || dealData.offer_date.data.from === "null" || dealData.offer_date.data.from === "") && 
     (!dealData.offer_date.data.to || dealData.offer_date.data.to === "null" || dealData.offer_date.data.to === ""));

  const minLots = Number(dealData?.min_investment?.data?.lot_size) || 1;
  const lotSize = Number(dealData?.lot_size?.data) || 1;
  const sharesPerLot = lotSize;
  const perSharePrice = Number(dealData?.per_share_price?.data || dealData?.offer_price?.data || 0);
  const pricePerCcps = Number(dealData?.price_per_ccps?.data) || 0;

  const pricePerLot = dealType === "ccps"
    ? pricePerCcps * lotSize * minLots
    : perSharePrice * lotSize * minLots;

  const formatCommaseparated = (num) => {
    if (!num) return "-";
    const numStr = String(num);
    const [integerPart, decimalPart] = numStr.split(".");

    // Indian formatting: first comma after 3 digits, then every 2 digits
    const x = integerPart;
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    const formattedInteger = (otherNumbers !== "" ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," : "") + lastThree;

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  console.log("did we get the isPrivateDeal?", isPrivateDeal);

  const ipoDocUrl = dealData?.ipo_doc?.data?.file?.[0]?.path
    ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${dealData?.ipo_doc?.data?.file?.[0]?.path.replace("public/", "")}`
    : null;
  const bankerLogoPath = dealData?.merchant_banker?.data?.logo?.[0]?.path;
  const initialImgSrc = bankerLogoPath
    ? (`${process.env.NEXT_PUBLIC_USER_BASE}admin/${bankerLogoPath}`).replaceAll("/public", "")
    : "/logo-fallback.png";

  const [imgSrc, setImgSrc] = useState(initialImgSrc);

  useEffect(() => {
    setImgSrc(initialImgSrc);
  }, [initialImgSrc]);

  const _dealOverview = dealDetails?.data?.deal_overview || {};
  const _dealStepData = dealDetails?.data?.deal_setpData || {};
  const ipoTimeline = _dealStepData?.ipo_timeline || _dealOverview?.ipo_timeline;
  console.log("ipoTimeline data is here", ipoTimeline);

  // if (!ipoTimeline?.status || !ipoTimeline?.data || Object.keys(ipoTimeline.data).length === 0) {
  //   return null;
  // }

  const ipoData = ipoTimeline?.data || {};
  const handleImageError = () => {
    setImgSrc("/logo-fallback.png");
  };

  const rawBankerNames = dealData?.merchant_banker?.data?.banker_name;
  const bankerList = React.useMemo(() => {
    if (!rawBankerNames) return [];
    let raw = rawBankerNames;
    if (typeof raw === "object") {
      if (Array.isArray(raw)) {
        return raw
          .map((b) => (typeof b === "string" ? b : b?.banker_name || b?.name || ""))
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (raw.banker_name) raw = raw.banker_name;
      else if (raw.data) raw = raw.data;
    }
    if (typeof raw !== "string") return [String(raw).trim()].filter(Boolean);
    if (raw.includes(";")) {
      return raw.split(";").map((s) => s.trim()).filter(Boolean);
    }
    return [raw.trim()].filter(Boolean);
  }, [rawBankerNames]);

  const commaSeparatedBankers = bankerList.join(", ");

  const formatNumber = (val) => {
    let value = val;
    // Unwrap if the value is accidentally wrapped in { status, data }
    if (value && typeof value === 'object' && value.data !== undefined) {
      value = value.data;
    }
    if (value === null || value === undefined || isNaN(Number(value))) return value && typeof value === 'string' ? value : "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /** ✅ Static Label Mapping — fallback labels when label_name is not available */
  const fieldLabelMap = {
    listing_timeline: "Listing Timeline",
    valuation_in_cr: "Valuation",
    pre_money_valuation: "Pre Money Valuation",
    revenue_fy25_in_cr: "Revenue (FY'25)",
    pat_fy25_in_cr: "PAT (FY'25)",
    pe_trailing_forward: "P/E Trailing Forward",
    pe_multiple: "P/E Multiple",
    round_size: "Round Size",
    face_value: "Face Value",
    offer_price: "Offer Price",
    lot_size: "Lot Size",
    sale_type: "Sale Type",
    cagr_growth_3y_percent: "CAGR Growth 3Y",
    roe_fy25_percent: "ROE (FY'25)",
    pat_margin_percent: "PAT Margin (%)",
    roce_fy25_percent: "ROCE (FY'25)",
    price_to_book_ratio: "Price to Book Value",
    target_valuation: "Target valuation",
    debt_to_equity_fy25: "Debt/Equity (FY'25)",
    merchant_banker_appointed: "Merchant banker appointed",
    expecting_listing_date: "Expecting Listing Date",
    conversion_event: "Conversion Event",
    conversion_ratio: "Conversion Ratio",
    company_website: "Company Website",
    ebitda_fy25_in_cr: "EBITDA FY'25 (in Cr)",
    issue_size: "Issue Size",
  };

  /** ✅ Prefix/Suffix Mapping — extend as needed */
  const fieldFormatMap = {
    pre_money_valuation: { prefix: "₹", suffix: "Cr" },
    valuation_in_cr: { prefix: "₹", suffix: "Cr" },
    revenue_fy25_in_cr: { prefix: "₹", suffix: "Cr" },
    pat_fy25_in_cr: { prefix: "₹", suffix: "Cr" },
    round_size: { prefix: "₹", suffix: "Cr" },
    pe_trailing_forward: { suffix: "x" },
    pe_multiple: { suffix: "x" },
    roce_fy25_percent: { suffix: "%" },
    roe_fy25_percent: { suffix: "%" },
    cagr_growth_3y_percent: { suffix: "%" },
    pat_margin_percent: { suffix: "%" },
    face_value: { prefix: "₹" },
    offer_price: { prefix: "₹" },
    lot_size: { suffix: " shares" },
    min_investment: { prefix: "₹", suffix: " per lot" },
    price_to_book_ratio: { suffix: "x" },
    target_valuation: { prefix: "₹", suffix: "Cr" },
    ebitda_fy25_in_cr: { prefix: "₹", suffix: "Cr" },
    debt_to_equity_fy25: { suffix: "x" },
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsBelow920(window.innerWidth < 920);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);



  /** ✅ Generic dynamic renderer with static suffix/prefix logic */
  const shouldShowTooltip = (tooltip) => {
    if (!tooltip) return false;
    if (typeof tooltip === "string") return tooltip.trim() !== "";
    return tooltip?.status === true && !!tooltip?.data?.trim();
  };

  const renderField = (fieldKey, isDate = false, isCurrency = false, isLink = false) => {
    const field = dealData?.[fieldKey];
    const isMappedAndActive = field && field.status;

    if (!isMappedAndActive) {
      return null;
    }

    let value = field?.data;
    if (value && typeof value === 'object' && 'data' in value) {
      value = value.data;
    }

    if (value === undefined || value === null || value === "") {
      return null;
    }

    const staticLabel = fieldLabelMap[fieldKey];
    const label = field?.label_name || staticLabel || fieldKey;

    const tooltipData = typeof field?.tool_tip === 'string'
      ? field.tool_tip
      : field?.tool_tip?.data?.trim();
    const tooltipStatus = typeof field?.tool_tip === 'string'
      ? !!field.tool_tip
      : field?.tool_tip?.status;

    const formatConfig = fieldFormatMap[fieldKey] || {};
    let displayValue = "-";

    if (isDate) {
      displayValue = formatDate(value);
    } else if (typeof value === "boolean") {
      displayValue = value ? "✅ Yes" : "❌ No";
    } else if (typeof value === "object" && value?.data) {
      displayValue = value.data;
    } else {
      displayValue = value;
    }

    // Apply static prefix/suffix formatting (skip if TBD)
    if (displayValue !== null && displayValue !== undefined && displayValue !== "" && displayValue !== "-" && displayValue !== "TBA" && displayValue !== "TBD") {
      const num = !isNaN(Number(displayValue)) ? formatNumber(displayValue) : displayValue;
      const prefix = formatConfig.prefix ? `${formatConfig.prefix} ` : "";
      const suffix =
        formatConfig.suffix
          ? formatConfig.suffix === "x"
            ? "x" // no space before x
            : ` ${formatConfig.suffix}`
          : "";

      displayValue = `${prefix}${num}${suffix}`;
    } else if (displayValue === "TBD") {
      // No prefix/suffix for TBD
      displayValue = "TBD";
    }

    const showTooltip =
      shouldShowTooltip(field?.tool_tip) &&
      displayValue !== null &&
      displayValue !== undefined;

    return (
      <section className="others" key={fieldKey}>
        <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
          {fieldKey === "company_website" && (
            isDarkTheme ? (
              <img src="/companyWebsiteLogoprivate.svg" alt="web" className="company-web-icon" style={{ marginRight: '8px' }} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                style={{ marginRight: '8px' }}
              >
                <g clipPath="url(#clip0_2198_15260)">
                  <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 1.5C7.07418 3.52212 6 6.20756 6 9C6 11.7924 7.07418 14.4779 9 16.5C10.9258 14.4779 12 11.7924 12 9C12 6.20756 10.9258 3.52212 9 1.5Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.5 9H16.5" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_2198_15260">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )
          )}
          {label}
          {/* Removed non-functional placeholder tooltip icon */}
          {showTooltip && (
            <div className="custom-tooltip-wrapper">
              <span className="tooltip-icon">
                <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ cursor: "pointer", width: "12px", height: "12px" }} />
              </span>
              <div className="custom-tooltip-box">{tooltipData}</div>
            </div>
          )}
        </div>

        {isLink && displayValue !== "-" && displayValue !== "TBD" ? (
          <Link
            href={
              typeof displayValue === "string" && (displayValue.startsWith("http://") || displayValue.startsWith("https://"))
                ? displayValue
                : `https://${displayValue}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: isDarkTheme ? "#f9d65c" : "#B59131" }}
          >
            {displayValue.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </Link>
        ) : (
          <span>{displayValue}</span>
        )}
      </section>
    );
  };


  const steps = [
    { label: "IPO Open Date", date: ipoData.ipo_open_date },
    { label: "IPO Close Date", date: ipoData.ipo_close_date },
    { label: "Tentative Allotment", date: ipoData.tentative_allotment },
    { label: "Initiation of Refunds", date: ipoData.initiation_of_refunds },
    { label: "Credit of Shares to Demat", date: ipoData.credit_of_shares_to_demat },
    { label: "Tentative Listing Date", date: ipoData.tentative_listing_date },
    // { label: "Cut-off time for UPI mandate confirmation", date: ipoData.cut_off_time_for_upi_mandate_confirmation },
  ];

  // ✅ Function to format dates for IPO timeline (returns TBA)
  const formatDateForIPO = (dateString) => {
    if (!dateString || dateString === "null" || dateString === "TBA") return "TBA";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "TBA";
    const day = date.getDate();

    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return n + 'th';
      switch (n % 10) {
        case 1: return n + "st";
        case 2: return n + "nd";
        case 3: return n + "rd";
        default: return n + "th";
      }
    };

    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.toLocaleDateString("en-GB", { year: "numeric" });
    return `${getOrdinal(day)} ${month} ${year}`;
  };

  // ✅ Determine which steps are completed (today-based)
  const today = new Date();
  const stepsWithStatus = steps.map((step, i) => ({
    ...step,
    date: formatDateForIPO(step.date),
    completed: new Date(step.date) < today,
    number: (i + 1).toString().padStart(2, "0"),
  }));

  const showStartDate = !isMobile && hasFromAndTo;
  const showEndDate = !isMobile && hasFromAndTo;
  const showValuation = !!dealData?.valuation_in_cr?.status;
  const showRevenue = !!dealData?.revenue_fy25_in_cr?.status;
  const showPat = !!dealData?.pat_fy25_in_cr?.status;
  const showIssueSize = !!dealData?.issue_size?.status;

  const spanValuation = !isMobile && showValuation && !showRevenue;
  const spanRevenue = !isMobile && showRevenue && !showValuation;
  const spanPat = !isMobile && showPat && !showIssueSize;
  const spanIssueSize = !isMobile && showIssueSize && !showPat;

  let gridLayoutClass = "";
  if (!showStartDate && !showEndDate) {
    gridLayoutClass = "public-grid-4";
  }


  return (
    <div className="valuation-container">
      {!isPrivateLike &&
        <>
          <section className="body-section4" >
            {dealData?.min_investment?.status && (
              <section>
                <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                  <p>{"Minimum Investment"}</p>
                  {shouldShowTooltip(dealData?.min_investment?.tool_tip) && (
                    <div className="custom-tooltip-wrapper">
                      <span className="tooltip-icon">
                        <img src={isPrivateLike ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                      </span>
                      <div className="custom-tooltip-box">{typeof dealData?.min_investment?.tool_tip === 'string' ? dealData.min_investment.tool_tip : dealData?.min_investment?.tool_tip?.data}</div>
                    </div>
                  )}
                </div>
                <div className="mb-0">
                  ₹{dealData?.min_investment?.data?.amount_in_inr ? formatCommaseparated(Number(dealData.min_investment.data.amount_in_inr).toFixed(1)) : formatCommaseparated(typeof pricePerLot === 'number' && !isNaN(pricePerLot) ? pricePerLot.toFixed(1) : pricePerLot)} / {formatCommaseparated((Number(dealData?.min_investment?.data?.lot_size) || 0) * (Number(dealData?.lot_size?.data) || 0))} shares
                </div>
              </section>
            )}

            {
              dealData?.merchant_banker?.status && (
                <section className="bank-sec">
                  <div className="bank-det">
                    <img
                      src={imgSrc}
                      alt={dealData?.company_name || "Company Logo"}
                      onError={handleImageError}
                    />
                    <div className="bank-info">
                      <div className="label-with-tooltip">
                        <p>{dealData?.merchant_banker?.label_name || "Merchant Banker"}</p>
                        {shouldShowTooltip(dealData?.merchant_banker?.tool_tip) && (
                          <div className="custom-tooltip-wrapper">
                            <span className="tooltip-icon">
                              <img src={isPrivateLike ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                            </span>
                            <div className="custom-tooltip-box">{typeof dealData.merchant_banker.tool_tip === 'string' ? dealData.merchant_banker.tool_tip : dealData.merchant_banker.tool_tip?.data}</div>
                          </div>
                        )}
                      </div>
                      <div className="banker-names-display mb-0">
                        {/* 600px and above: in one line with comma */}
                        <div
                          className="banker-inline-view"
                          title={commaSeparatedBankers || undefined}
                        >
                          {bankerList.length > 0 ? commaSeparatedBankers : "-"}
                        </div>

                        {/* Below 600px: list view */}
                        <div className="banker-list-view">
                          {bankerList.length > 0 ? (
                            bankerList.map((name, idx) => (
                              <div key={idx} className="banker-list-item" title={name}>
                                {name}
                              </div>
                            ))
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )
            }

            {dealData?.ipo_doc?.status && (
              <section className="ipoDoc">
                <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                  <p>{"IPO Document"}</p>
                  {shouldShowTooltip(dealData?.ipo_doc?.data?.tool_tip) && (
                    <div className="custom-tooltip-wrapper">
                      <span className="tooltip-icon">
                        <img src={isPrivateLike ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                      </span>
                      <div className="custom-tooltip-box">{typeof dealData.ipo_doc.data.tool_tip === 'string' ? dealData.ipo_doc.data.tool_tip : dealData.ipo_doc.data.tool_tip?.data}</div>
                    </div>
                  )}
                </div>
                <div className="drhp mb-0">
                  {ipoDocUrl ? (
                    <>
                      {dealData?.ipo_doc?.data?.label_name || "IPO Document"}
                      <Link className="ipoDocLink" href={ipoDocUrl} target="_blank" rel="noopener noreferrer">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 9H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 13H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 17H8" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg></span>
                      </Link>

                    </>
                  ) : (
                    "No Document"
                  )}
                </div>
              </section>
            )}


          </section>
          <div className="seperator"></div>
        </>
      }


      <section className="smallcards-section">
        <div className={`smallcard-section-subcontainer ${!isPrivateLike ? `public-grid ${gridLayoutClass}`.trim() : ""}`}>
          {isPrivateLike ? (
            <>
              {dealData?.listing_timeline?.status && dealData?.listing_timeline?.data && (
                <section className="subs1-topp" style={{ backgroundColor: isDarkTheme ? "#1D1D1D" : "#F3F4F6" }}>
                  <div className="label-with-tooltip">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="data" >{dealData?.listing_timeline?.label_name || "Listing Timeline"}</span>
                      {shouldShowTooltip(dealData?.listing_timeline?.tool_tip) && (
                        <div className={`custom-tooltip-wrapper ${isMobile ? "main-other" : ""}`}>
                          <span className="tooltip-icon">
                            <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.listing_timeline.tool_tip === 'string' ? dealData.listing_timeline.tool_tip : dealData.listing_timeline.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className={isDarkTheme ? "valuation-bg" : "valuation-bg-light"}>
                      <PeMultiple />
                    </span>
                  </div>
                  <span className="offer-day nomargin" style={{ color: isDarkTheme ? "white" : "#242424" }}>
                    {(() => {
                      const dl = dealData?.listing_timeline?.data;
                      if (!dl) return "TBD";
                      const formatSingle = (dateStr) => {
                        if (!dateStr) return "TBD";
                        const d = new Date(dateStr);
                        const day = d.getDate();
                        const getOrdinal = (n) => {
                          if (n > 3 && n < 21) return n + 'th';
                          switch (n % 10) {
                            case 1: return n + "st";
                            case 2: return n + "nd";
                            case 3: return n + "rd";
                            default: return n + "th";
                          }
                        };
                        const month = d.toLocaleDateString("en-GB", { month: "short" });
                        const year = d.getFullYear();
                        return `${getOrdinal(day)} ${month} ${year}`;
                      };
                      if (typeof dl === "object" && (dl.from || dl.to)) {
                        return `${formatSingle(dl.from)} to ${formatSingle(dl.to)}`;
                      }
                      return formatSingle(dl);
                    })()}
                  </span>
                </section>
              )}

              <div className="smallcard-section-subcontainer-div" style={!(dealData?.listing_timeline?.status && dealData?.listing_timeline?.data) ? { width: "100%" } : {}}>
                {dealData?.valuation_in_cr?.status && (
                  <section className="subs top">
                    <section>
                      <div>
                        <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                          <span className="data">{dealData?.valuation_in_cr?.label_name || (isofs ? 'Market Cap' : 'Valuation')}</span>
                          {shouldShowTooltip(dealData?.valuation_in_cr?.tool_tip) && (
                            <div className="custom-tooltip-wrapper left-side">
                              <span className="tooltip-icon">
                                <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                              </span>
                              <div className="custom-tooltip-box">{typeof dealData.valuation_in_cr.tool_tip === 'string' ? dealData.valuation_in_cr.tool_tip : dealData.valuation_in_cr.tool_tip?.data}</div>
                            </div>
                          )}
                        </div>
                        <span className={isDarkTheme ? "valuation-bg" : "valuation-bg-light"}><Valuation /></span>
                      </div>
                      <span className="offer-day" style={{ color: isDarkTheme ? "white" : "#242424" }}>
                        {(() => {
                          const value = dealData?.valuation_in_cr?.data;
                          if (value === null || value === undefined || value === "") return "TBD";
                          return `₹${formatNumber(value)} Cr`;
                        })()}
                      </span>
                    </section>

                    {dealData?.revenue_fy25_in_cr?.status && (
                      <section>
                        <div>
                          <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                            <span className="data">{dealData?.revenue_fy25_in_cr?.label_name || "Revenue"}</span>
                            {shouldShowTooltip(dealData?.revenue_fy25_in_cr?.tool_tip) && (
                              <div className="custom-tooltip-wrapper right-side">
                                <span className="tooltip-icon">
                                  <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                                </span>
                                <div className="custom-tooltip-box">{typeof dealData.revenue_fy25_in_cr.tool_tip === 'string' ? dealData.revenue_fy25_in_cr.tool_tip : dealData.revenue_fy25_in_cr.tool_tip?.data}</div>
                              </div>
                            )}
                          </div>
                          <span className={isDarkTheme ? "valuation-bg" : "valuation-bg-light"}><RevenueIcon /></span>
                        </div>
                        <span className="offer-day" style={{ color: isDarkTheme ? "white" : "#242424" }}>
                          {(() => {
                            const value = dealData?.revenue_fy25_in_cr?.data;
                            if (value === null || value === undefined || value === "") return "TBD";
                            return `₹${formatNumber(value)} Cr`;
                          })()}
                        </span>
                      </section>
                    )}
                  </section>
                )}

                <section className="subs top">
                  {dealData?.pat_fy25_in_cr?.status && (
                    <section>
                      <div>
                        <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                          <span className="data">{dealData?.pat_fy25_in_cr?.label_name || "PAT (FY'25)"}</span>
                          {shouldShowTooltip(dealData?.pat_fy25_in_cr?.tool_tip) && (
                            <div className="custom-tooltip-wrapper left-side">
                              <span className="tooltip-icon">
                                <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                              </span>
                              <div className="custom-tooltip-box">{typeof dealData.pat_fy25_in_cr.tool_tip === 'string' ? dealData.pat_fy25_in_cr.tool_tip : dealData.pat_fy25_in_cr.tool_tip?.data}</div>
                            </div>
                          )}
                        </div>
                        <span className={isDarkTheme ? "valuation-bg" : "valuation-bg-light"}><PatIcon /></span>
                      </div>
                      <span className="offer-day" style={{ color: isDarkTheme ? "white" : "#242424" }}>
                        {(() => {
                          const value = dealData?.pat_fy25_in_cr?.data;
                          if (value === null || value === undefined || value === "") return "TBD";
                          return `₹${formatNumber(value)} Cr`;
                        })()}
                      </span>
                    </section>
                  )}

                  {dealData?.pe_multiple?.status && (
                    <section>
                      <div>
                        <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                          <span className="data">{dealData?.pe_multiple?.label_name || "P/E Multiple"}</span>
                          {shouldShowTooltip(dealData?.pe_multiple?.tool_tip) && (
                            <div className="custom-tooltip-wrapper">
                              <span className="tooltip-icon">
                                <img src={isDarkTheme ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                              </span>
                              <div className="custom-tooltip-box">{typeof dealData.pe_multiple.tool_tip === 'string' ? dealData.pe_multiple.tool_tip : dealData.pe_multiple.tool_tip.data}</div>
                            </div>
                          )}
                        </div>
                        <span className={isDarkTheme ? "valuation-bg" : "valuation-bg-light"}>
                          <PeMultiple />
                        </span>
                      </div>
                      <span className="offer-day" style={{ color: isDarkTheme ? "white" : "#242424" }}>
                        {(() => {
                          const value = dealData?.pe_multiple?.data;
                          if (value === null || value === undefined || value === "") return "TBD";
                          return `${formatNumber(value)}x`;
                        })()}
                      </span>
                    </section>
                  )}
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Card 1: Offer Start Date (Desktop only) */}
              {!isMobile && hasFromAndTo && !isOfferDateNull && (
                <section className="subs1-top card-start-date">
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{"Offer Start Date"}</span>
                      {shouldShowTooltip(dealData?.offer_date?.tool_tip) && (
                        <div className="custom-tooltip-wrapper">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", marginBottom: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.offer_date.tool_tip === 'string' ? dealData.offer_date.tool_tip : dealData.offer_date.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><OfferDateIcon /></span>
                  </div>
                  <span className="offer-day">{formatDateForIPO(dealData?.offer_date?.data?.from)}</span>
                </section>
              )}

              {/* Card 2: Offer End Date (Desktop only) */}
              {!isMobile && hasFromAndTo && !isOfferDateNull && (
                <section className="subs1-top card-end-date">
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{"Offer End Date"}</span>
                      {shouldShowTooltip(dealData?.offer_date?.tool_tip) && (
                        <div className="custom-tooltip-wrapper">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", marginBottom: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.offer_date.tool_tip === 'string' ? dealData.offer_date.tool_tip : dealData.offer_date.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><OfferDateIcon /></span>
                  </div>
                  <span className="offer-day">{formatDateForIPO(dealData?.offer_date?.data?.to)}</span>
                </section>
              )}

              {/* Card 3: Offer Date Range (Mobile only or if single date) */}
              {(isMobile || !hasFromAndTo) && dealData?.offer_date?.status && !isOfferDateNull && (
                <section className="subs1-top card-range-date">
                  {isMobile && hasFromAndTo ? (
                    <div className="ipo-dropdownButton" onClick={() => setOpen(!open)}>
                      {
                        dealData?.offer_date?.status && (
                          <>
                            <div className="ipo-dropdown">
                              <div className="label-with-tooltip" style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                <span className="data">{"Offer Date"}</span>
                                {shouldShowTooltip(dealData?.offer_date?.tool_tip) && (
                                  <div className={`custom-tooltip-wrapper ${isMobile ? "main-other" : ""}`}>
                                    <span className="tooltip-icon">
                                      <img src={isPrivateLike ? "/tooltip.svg" : "/toolTippublic.svg"} alt="info" style={{ marginBottom: "4px", cursor: "pointer", width: "12px", height: "12px" }} />
                                    </span>
                                    <div className="custom-tooltip-box">{typeof dealData.offer_date.tool_tip === 'string' ? dealData.offer_date.tool_tip : dealData.offer_date.tool_tip?.data}</div>
                                  </div>
                                )}
                              </div>
                              <span className={isPrivateLike ? "valuation-bg" : "valuation-bg-light"}><OfferDateIcon /></span>
                            </div>
                            <div className="ipo-dropdown">
                              <span className="offer-day">{formatDateForIPO(dealData?.offer_date?.data?.from)} to {formatDateForIPO(dealData?.offer_date?.data?.to)}</span>
                              {/* <span className="dropDown">{open ? <ChevronUp /> : <ChevronDown />}</span> */}
                            </div>
                          </>
                        )
                      }
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                          <p>{"Offer Date"}</p>
                          {shouldShowTooltip(dealData?.offer_date?.tool_tip) && (
                            <div className="custom-tooltip-wrapper">
                              <span className="tooltip-icon">
                                <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", marginBottom: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                              </span>
                              <div className="custom-tooltip-box">{typeof dealData.offer_date.tool_tip === 'string' ? dealData.offer_date.tool_tip : dealData.offer_date.tool_tip?.data}</div>
                            </div>
                          )}
                        </div>
                        <span className="valuation-bg-light"><OfferDateIcon /></span>
                      </div>
                      <span className="offer-day">
                        {hasFromAndTo 
                          ? `${formatDateForIPO(dealData.offer_date.data.from)} to ${formatDateForIPO(dealData.offer_date.data.to)}` 
                          : formatDateForIPO(dealData?.offer_date?.data)}
                      </span>
                    </>
                  )}
                </section>
              )}

              {/* Card 4: Valuation */}
              {dealData?.valuation_in_cr?.status && (
                <section className={`subs1-top card-valuation ${spanValuation ? "grid-span-2" : ""}`}>
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{dealData?.valuation_in_cr?.label_name || "Valuation"}</span>
                      {shouldShowTooltip(dealData?.valuation_in_cr?.tool_tip) && (
                        <div className="custom-tooltip-wrapper left-side">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.valuation_in_cr.tool_tip === 'string' ? dealData.valuation_in_cr.tool_tip : dealData.valuation_in_cr.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><Valuation /></span>
                  </div>
                  <span className="offer-day">₹{formatNumber(dealData?.valuation_in_cr?.data)} Cr</span>
                </section>
              )}

              {/* Card 5: Revenue */}
              {dealData?.revenue_fy25_in_cr?.status && (
                <section className={`subs1-top card-revenue ${spanRevenue ? "grid-span-2" : ""}`}>
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{dealData?.revenue_fy25_in_cr?.label_name || "Revenue"}</span>
                      {shouldShowTooltip(dealData?.revenue_fy25_in_cr?.tool_tip) && (
                        <div className="custom-tooltip-wrapper right-side">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.revenue_fy25_in_cr.tool_tip === 'string' ? dealData.revenue_fy25_in_cr.tool_tip : dealData.revenue_fy25_in_cr.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><RevenueIcon /></span>
                  </div>
                  <span className="offer-day">₹{formatNumber(dealData?.revenue_fy25_in_cr?.data)} Cr</span>
                </section>
              )}

              {/* Card 6: PAT */}
              {dealData?.pat_fy25_in_cr?.status && (
                <section className={`subs1-top card-pat ${spanPat ? "grid-span-2" : ""}`}>
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{dealData?.pat_fy25_in_cr?.label_name || "PAT"}</span>
                      {shouldShowTooltip(dealData?.pat_fy25_in_cr?.tool_tip) && (
                        <div className="custom-tooltip-wrapper left-side">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.pat_fy25_in_cr.tool_tip === 'string' ? dealData.pat_fy25_in_cr.tool_tip : dealData.pat_fy25_in_cr.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><PatIcon /></span>
                  </div>
                  <span className="offer-day">₹{formatNumber(dealData?.pat_fy25_in_cr?.data)} Cr</span>
                </section>
              )}

              {/* Card 7: Issue Size */}
              {dealData?.issue_size?.status && (
                <section className={`subs1-top card-issue-size ${spanIssueSize ? "grid-span-2" : ""}`}>
                  <div>
                    <div className="label-with-tooltip" style={{ display: "flex", alignItems: "center" }}>
                      <span className="data">{dealData?.issue_size?.label_name || "Issue Size"}</span>
                      {shouldShowTooltip(dealData?.issue_size?.tool_tip) && (
                        <div className="custom-tooltip-wrapper right-side">
                          <span className="tooltip-icon">
                            <img src="/toolTippublic.svg" alt="info" style={{ marginLeft: "5px", cursor: "pointer", width: "12px", height: "12px" }} />
                          </span>
                          <div className="custom-tooltip-box">{typeof dealData.issue_size.tool_tip === 'string' ? dealData.issue_size.tool_tip : dealData.issue_size.tool_tip?.data}</div>
                        </div>
                      )}
                    </div>
                    <span className="valuation-bg-light"><PeMultiple /></span>
                  </div>
                  <span className="offer-day">₹{formatNumber(dealData?.issue_size?.data?.overall || dealData?.issue_size?.data)} Cr</span>
                </section>
              )}
            </>
          )}
        </div>
        {isPrivateLike ?
          <>
            <section ref={contentRef} className={`main-other ${isBelow920 && !expandedFields ? 'collapsed private-collapsed' : ''}`} style={isBelow920 && inlineMaxHeight !== "none" ? { maxHeight: inlineMaxHeight } : {}}>
              {renderField("round_size")}
              {renderField("face_value")}
              {renderField("offer_price")}
              {renderField("lot_size")}
              {renderField("sale_type")}
              {renderField("pat_fy25_in_cr")}
              {renderField("pat_margin_percent")}
              {renderField("pe_multiple")}
              {renderField("ebitda_fy25_in_cr")}
              {renderField("cagr_growth_3y_percent")}
              {renderField("roe_fy25_percent")}
              {renderField("roce_fy25_percent")}
              {renderField("price_to_book_ratio")}
              {renderField("debt_to_equity_fy25")}
              {renderField("merchant_banker_appointed")}
              {renderField("expecting_listing_date", true)}
              {!isofs && !isccps && !isunlisted && renderField("target_valuation")}
              {renderField("company_website", false, false, true)}
              {isBelow920 && (
                <div className={`ipo-overview-blur-overlay ${isDarkTheme ? 'dark' : ''}`} />
              )}
            </section>
          </>

          :
          <>
            <section ref={contentRef} className={`main-other ${isBelow920 && !expandedFields ? 'collapsed public-collapsed' : ''}`} style={isBelow920 && inlineMaxHeight !== "none" ? { maxHeight: inlineMaxHeight } : {}}>
              {renderField("face_value")}
              {renderField("offer_price")}
              {renderField("lot_size")}
              {renderField("sale_type")}
              {renderField("pat_fy25_in_cr")}
              {renderField("pat_margin_percent")}
              {renderField("pe_multiple")}
              {renderField("ebitda_fy25_in_cr")}
              {renderField("cagr_growth_3y_percent")}
              {renderField("roe_fy25_percent")}
              {renderField("roce_fy25_percent")}
              {renderField("price_to_book_ratio")}
              {renderField("debt_to_equity_fy25")}
              {isBelow920 && dealData?.share_allocation?.status && (
                <Shares isPrivateDeal={isPrivateLike} isccps={isccps} />
              )}
              {renderField("company_website", false, false, true)}
              {isBelow920 && (
                <div className={`ipo-overview-blur-overlay ${isDarkTheme ? 'dark' : ''}`} />
              )}
            </section>
          </>
        }

        {isBelow920 && (
          <div className={`expand-toggle-btn-wrapper ${isDarkTheme ? "dark" : ""} ${expandedFields ? "expanded" : "collapsed"}`} onClick={() => setExpandedFields(!expandedFields)}>
            {expandedFields ? (
              <ChevronsUp className="expand-toggle-icon" strokeWidth={2.5} />
            ) : (
              <ChevronsDown className="expand-toggle-icon" strokeWidth={2.5} />
            )}
          </div>
        )}

      </section >
    </div >
  )
};

export default AiIpoOverview;
