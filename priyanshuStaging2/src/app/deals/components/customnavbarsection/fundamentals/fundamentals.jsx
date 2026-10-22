"use-client"
import { useState, useEffect } from "react";
import "./fundamentals.css";
import Piechart from "../charts/piechart";
import { Collapse } from "react-bootstrap";
import { ChevronDown, ChevronUp, CreditCardIcon } from "lucide-react";
import { useDealStore } from "@/store/dealStore";
import { AdditionalNotes, AllocationAvilable, CapitalRaisingTarget, CreditRatingOutlook, PrimaryObjective, RiskFactors, UseProceeds } from "./ipoIcons";
import { Allison } from "next/font/google";
// import Accordion from "react-bootstrap/Accordion";

const Fundamentals = ({ isPrivateDeal }) => {
  const [showAll, setShowAll] = useState(true);
  const dealDetails = useDealStore((state) => state.dealDetails);
  const isUnlisted = dealDetails?.data?.deal_type === "unlisted";

  const [openStates, setOpenStates] = useState({
    "IPO key Highlights": dealDetails?.data?.ipoch_highlights?.status ? true : false,
    "IPO Objective": dealDetails?.data?.iopch_obje?.status ? true : false,
    "IPO Notes": dealDetails?.data?.iopch_notes?.status ? true : false,
    Documents: dealDetails?.data?.iopch_docs?.status ? true : false,
  });

  // Robust Fund Allocation extraction (matching FundAndTimeline logic)
  const utilFundsApi = dealDetails?.data?.deal_overview?.utilisation_of_funds;
  const legacyFundAlloc = dealDetails?.data?.fundraise_future_plans?.fund_allocation?.data;

  const fundAllocationRaw = utilFundsApi?.status && Array.isArray(utilFundsApi?.data) 
    ? utilFundsApi.data 
    : (Array.isArray(legacyFundAlloc) ? legacyFundAlloc : []);

  const fundAllocation = fundAllocationRaw.map((item) => ({
    name: item.label_name || item.category || "Unknown",
    amount_in_cr: parseFloat(item.amount_in_cr) || 0,
    percentage: parseFloat(item.amount_in_percent ?? item.percentage) || 0,
  }));

  const COLORS = ["#927127", "#DCC97C", "#1A1A1A", "#E8E7EE", "#B59131"];

  const totalAmountCr = fundAllocation.reduce(
    (sum, item) => sum + item.amount_in_cr,
    0
  );

  // Format data for pie chart and legend
  const formattedData = fundAllocation.map((item) => ({
    name: item.name,
    value: item.percentage,
  }));

  const timelineData =
    dealDetails?.data?.fundraise_future_plans?.timeline?.data || {};

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const today = new Date();

  const isPastOrToday = (date) => {
    if (!date) return false;
    return today >= date;
  };

  const openDate = new Date(timelineData.timeline_open_date);
  const closeDate = new Date(timelineData.timeline_close_date);
  const listingDate = new Date(timelineData.timeline_listing_date);


  const ipoObjective = dealDetails?.data?.fundraise_future_plans?.ipo_objective || {};
  const ipoNotes = dealDetails?.data?.fundraise_future_plans?.ipo_notes || {};

  const toggleDropdown = (title) => {
    setOpenStates((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const Dropdown = ({ title, children }) => {
    const isOpen = openStates[title];

    return (
      <div className="dropdown">
        {/* Header */}
        <div
          className="header"
          onClick={() => toggleDropdown(title)}
          aria-controls={`collapse-${title}`}
          aria-expanded={isOpen}
        >
          <h3 className="title">{title}</h3>

          <span className={`iconWrapper ${isOpen ? "open" : ""}`}>
            {isOpen ? (
              <ChevronUp size={24} color={isPrivateDeal ? "white" : "black"} />
            ) : (
              <ChevronDown
                size={24}
                color={isPrivateDeal ? "white" : "black"}
              />
            )}
          </span>
        </div>

        {/* Collapse wrapper */}
        <Collapse in={isOpen}>
          <div id={`collapse-${title}`}>
            <div className="content">{children}</div>
          </div>
        </Collapse>
      </div>
    );
  };

  // Transform API data to fundamentals format with error handling
  const transformFundamentalsData = (apiData) => {
    try {
      const ipoKeyHighlights = apiData?.fundraise_future_plans?.ipo_key_highlights;
      if (
        !apiData ||
        !ipoKeyHighlights?.data ||
        !Array.isArray(ipoKeyHighlights.data) ||
        ipoKeyHighlights.status === false ||
        ipoKeyHighlights.status === "false"
      ) {
        return [];
      }

      const highlights = apiData.fundraise_future_plans.ipo_key_highlights.data;

      const fundamentalsMap = {
        issue_price: { title: "Issue Price", key: isUnlisted ? "per_share_price" : "issue_price", format: { prefix: "₹" } },
        total_issue_shares: { title: "Total Issue Shares", key: "total_issue_shares" },
        lot_size: { title: "Lot Size", key: "lot_size" },
        min_investment: { title: "Min. Investment", key: "min_investment", format: { prefix: "₹" } },
        pre_issue_shares: { title: "Pre-issue no. of shares", key: "pre_issue_shares" },
        post_issue_shares: { title: "Post-issue no. of shares", key: "post_issue_shares" },
        pre_ipo_market_cap_cr: { title: "Pre-IPO Market Cap", key: "pre_ipo_market_cap_cr", format: { prefix: "₹", suffix: "Cr" } },
        post_ipo_market_cap_cr: { title: "Post-IPO Market Cap", key: "post_ipo_market_cap_cr", format: { prefix: "₹", suffix: "Cr" } },
        total_issue_size_in_cr: { title: "Total Issue Size", key: "total_issue_size_in_cr", format: { prefix: "₹", suffix: "Cr" } },
        anchor_book_size_cr: { title: "Anchor Book Size", key: "anchor_book_size_cr", format: { prefix: "₹", suffix: "Cr" } },
        total_raised_post_drhp_in_cr: { title: "Total Raised Post DRHP", key: "total_raised_post_drhp_in_cr", format: { prefix: "₹", suffix: "Cr" } },
        current_issue_size_of_ipo_in_cr: { title: "Current Issue Size of IPO", key: "current_issue_size_of_ipo_in_cr", format: { prefix: "₹", suffix: "Cr" } },
        shared_issued_post_drhp_filling: { title: "Shares Issued Post DRHP Filing", key: "shared_issued_post_drhp_filling" },
      };

      const transformed = Object.values(fundamentalsMap)
        .map((item) => {
          const apiItem = highlights.find((h) => h[item.key]);
          if (!apiItem) return null;

          const dataObj = apiItem[item.key];
          if (!dataObj) return null;

          // Check if data is nested under 'value' (listed style) or is directly the status/data object (unlisted style)
          const isNested = dataObj.value !== undefined || dataObj.description !== undefined;
          const valueData = isNested ? dataObj.value : dataObj;
          const descriptionData = isNested ? dataObj.description : null;

          let displayTitle = item.title;
          if (dataObj?.label_name) {
            displayTitle = dataObj.label_name;
          } else if (valueData?.label_name) {
            displayTitle = valueData.label_name;
          }

          const shouldShowKey =
            valueData?.status === true || descriptionData?.status === true;

          // ✅ Hide card if both data are null or undefined
          const isBothNull =
            (!valueData?.data && !descriptionData?.data) ||
            (valueData?.data === null && descriptionData?.data === null);

          if (!shouldShowKey || isBothNull) return null;

          const shouldShowValue =
            valueData?.status === true && valueData?.data !== null;
          const shouldShowDescription =
            descriptionData?.status === true && descriptionData?.data !== null;

          // ✅ Format numeric values with commas (e.g., 1,00,000)
          const rawValue = shouldShowValue ? valueData.data : null;
          let formattedValue =
            typeof rawValue === "number"
              ? rawValue.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              : !isNaN(Number(rawValue))
                ? Number(rawValue).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                : rawValue;

          // Apply currency and units for financial fields
          if (formattedValue && formattedValue !== "-" && item.format) {
            const prefix = item.format.prefix ? `${item.format.prefix} ` : "";
            const suffix = item.format.suffix ? ` ${item.format.suffix}` : "";
            formattedValue = `${prefix}${formattedValue}${suffix}`;
          }

          return {
            title: displayTitle,
            value: shouldShowValue
              ? formattedValue?.toString() || "-"
              : "-",
            description: shouldShowDescription ? descriptionData.data : "-",
          };
        })
        .filter(Boolean); // removes null entries

      return transformed;
    } catch (error) {
      console.error("Fundamentals: Error transforming IPO key highlights data", error);
      return [];
    }
  };

  // Get fundamentals data with fallback
  const getFundamentalsData = () => {
    try {
      const ipoHighlights = dealDetails?.data?.fundraise_future_plans?.ipo_key_highlights;
      if (ipoHighlights && ipoHighlights.status !== false && ipoHighlights.status !== "false") {
        const transformed = transformFundamentalsData(dealDetails?.data);
        return transformed.length > 0 ? transformed : [];
      }
      return [];
    } catch (error) {
      console.error('Fundamentals: Error getting fundamentals data', error);
      return [];
    }
  };

  const fundamentalsData = getFundamentalsData();

  const data = [
    { name: "Capital Expenditure", value: "12.0%" },
    { name: "Debt Repayment", value: "62.0%" },
    { name: "Others", value: "26.0%" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // const COLORS = ["#927127", "#D1BD56 ", "#10100f"];

  const visibleCards = showAll
    ? fundamentalsData
    : fundamentalsData.slice(0, 4);

  const [fundamentalsData1, setFundamentalsData] = useState([]);

  useEffect(() => {
    const apiData = {
      issuePrice: "₹170",
      marketLot: "150 Shares",
      listingExchange: "NSE, BSE",
      issueSize: "₹1,200 Cr",
    };

    const mappedData = [
      {
        title: "Issue Price",
        value: apiData.issuePrice,
        description: "Face Value: ₹10 per equity share",
      },
      {
        title: "Market Lot",
        value: apiData.marketLot,
        description: "Minimum order quantity",
      },
      {
        title: "Listing Exchange",
        value: apiData.listingExchange,
        description: "Both exchanges",
      },
      {
        title: "Issue Size",
        value: apiData.issueSize,
        description: "Total size of IPO",
      },
    ];

    setFundamentalsData(mappedData);
  }, []);

  return (
    <div
      className={`fundamentals-container ${isPrivateDeal ? "privateDeal" : ""}`}
    >
      {fundamentalsData && fundamentalsData.length > 0 && (
        <>
          <hr className="hr" />
          <Dropdown title={dealDetails?.data?.fundraise_future_plans?.ipo_key_highlights?.label_name || (isUnlisted ? "Key Highlights" : "IPO key Highlights")}>
            {" "}
            <div className="Fundamentals-body-div">
              {visibleCards.map((item, index) => (
                <div className="Fundamentals-body-section1-item" key={index}>
                  <p>{item.title}</p>
                  <div className="item-value">{item.value}</div>
                  <div className="item-desc">{item.description}</div>
                </div>
              ))}
            </div>
            {fundamentalsData.length > 4 && (
              <div className="show-more-btn-div">
                {" "}
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="show-more-btn"
                >
                  {" "}
                  {showAll ? (
                    <span>
                      Show Less{" "}
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: "rotate(180deg)" }}
                      >
                        <path
                          d="M17.0999 7.45898L11.6666 12.8923C11.0249 13.534 9.9749 13.534 9.33324 12.8923L3.8999 7.45898"
                          stroke="#B18C07"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span>
                      Show More{" "}
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.0999 7.45898L11.6666 12.8923C11.0249 13.534 9.9749 13.534 9.33324 12.8923L3.8999 7.45898"
                          stroke="#B18C07"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}{" "}
                </button>{" "}
              </div>
            )}{" "}
            
          </Dropdown>

        </>
      )}


      {ipoObjective?.status && (
        <>
          <hr className="hr" />
          <Dropdown title="IPO Objective">
            <div className="ipo-objective-container">

              {/* ===== Utility function to inject classes ===== */}
              {(() => {
                const addListClasses = (html) => {
                  if (!html) return "";
                  return html
                    .replace(/<ul>/g, '<ul class="ipoObjectiveList">')
                    .replace(/<li>/g, '<li class="ipoObjectiveItem">');
                };

                return (
                  <>
                    {/* ===== Primary Objective ===== */}
                    {ipoObjective?.business_expansion?.status && (
                      <section className="ipoObjectiveSection">
                        <PrimaryObjective />

                        <h4>Primary Objective</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(
                              ipoObjective.business_expansion.data
                            ),
                          }}
                        />
                      </section>
                    )}

                    {/* ===== Use of Proceeds ===== */}
                    {ipoObjective?.utilization_of_proceeds?.status && (
                      <section className="ipoObjectiveSection">
                        <UseProceeds />

                        <h4>Use of Proceeds</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(
                              ipoObjective.utilization_of_proceeds.data
                            ),
                          }}
                        />
                      </section>
                    )}

                    {/* ===== Capital Raising Target ===== */}
                    {ipoObjective?.capital_expenditure?.status && (
                      <section className="ipoObjectiveSection">
                        <CapitalRaisingTarget />

                        <h4>Capital Raising Target</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(
                              ipoObjective.capital_expenditure.data
                            ),
                          }}
                        />
                      </section>
                    )}

                    {/* ===== Credit Rating Outlook ===== */}
                    {ipoObjective?.credit_rating_outlook?.status && (
                      <section className="ipoObjectiveSection">
                        <CreditRatingOutlook />

                        <h4>Credit Rating Outlook</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(
                              ipoObjective.credit_rating_outlook.data
                            ),
                          }}
                        />
                      </section>
                    )}
                  </>
                );
              })()}
            </div>
          </Dropdown>

        </>

      )}


      {ipoNotes?.status && (
        <>
          <hr className="hr" />
          <Dropdown title="IPO Notes">
            <div className="ipo-objective-container">

              {/* ===== Utility function to inject classes ===== */}
              {(() => {
                const addListClasses = (html) => {
                  if (!html) return "";
                  return html
                    .replace(/<ul>/g, '<ul class="ipoObjectiveList">')
                    .replace(/<li>/g, '<li class="ipoObjectiveItem">');
                };

                return (
                  <>
                    {/* ===== Risk Factors ===== */}
                    {ipoNotes?.risk_factor?.status && (
                      <section className="ipoObjectiveSection">
                        <RiskFactors />

                        <h4>Risk Factors</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(ipoNotes.risk_factor.data),
                          }}
                        />
                        <p className="pastPerformanceDisclaimer">
                          * Past performance is not an indicator or guarantee of future returns.
                        </p>
                      </section>
                    )}

                    {/* ===== Allocation Available ===== */}
                    {ipoNotes?.additional_activities?.status && (
                      <section className="ipoObjectiveSection">
                        <AllocationAvilable />
                        <h4>Allocation Available</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(
                              ipoNotes.additional_activities.data
                            ),
                          }}
                        />
                      </section>
                    )}

                    {/* ===== Important Dates ===== */}
                    {ipoNotes?.important_dates?.status && (
                      <section className="ipoObjectiveSection">
                        <img src={'/importantDates.svg'} alt="Important dates" />

                        <h4>Important Dates</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(ipoNotes.important_dates.data),
                          }}
                        />
                      </section>
                    )}

                    {/* ===== Additional Notes ===== */}
                    {ipoNotes?.additional_notes?.status && (
                      <section className="ipoObjectiveSection">
                        <AdditionalNotes />

                        <h4>Additional Notes</h4>
                        <div
                          className="ipoObjectiveContent"
                          dangerouslySetInnerHTML={{
                            __html: addListClasses(ipoNotes.additional_notes.data),
                          }}
                        />
                      </section>
                    )}
                  </>
                );
              })()}
            </div>
          </Dropdown>
        </>
      )}


      {/* <hr className="hr" /> */}
      {/* <Dropdown title="IPO Notes">
        <div className="Ipo-notes-container">
          <section className="ipo-objective-container-section">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              {" "}
              <path
                d="M6.68604 6.68648L12.2656 12.266C14.2449 10.2867 16.9792 9.0625 19.9995 9.0625V1.17188C14.8003 1.17188 10.0933 3.2793 6.68604 6.68648Z"
                fill="#FFC178"
              />{" "}
              <path
                d="M1.17188 20H1.25H9.0625C9.0625 16.9797 10.2867 14.2454 12.266 12.2661L6.68648 6.68652C3.2793 10.0938 1.17188 14.8008 1.17188 20Z"
                fill="#B5FB4A"
              />{" "}
              <path
                d="M33.3139 6.68652L27.7344 12.2661C29.7137 14.2454 30.9379 16.9797 30.9379 20H38.8285C38.8285 14.8008 36.7211 10.0938 33.3139 6.68652Z"
                fill="#443197"
              />{" "}
              <path
                d="M20 1.17188V9.0625C23.0203 9.0625 25.7547 10.2867 27.734 12.266L33.3135 6.68648C29.9062 3.2793 25.1992 1.17188 20 1.17188Z"
                fill="#7E60FF"
              />{" "}
              <path
                d="M30.3777 40H9.62915C8.35814 40 7.22001 39.3429 6.58454 38.2422C5.94907 37.1415 5.94899 35.8273 6.58454 34.7266L16.9588 16.7578C17.5943 15.6571 18.7324 15 20.0034 15C21.2745 15 22.4126 15.6571 23.0481 16.7578L33.4224 34.7266C34.0579 35.8273 34.0578 37.1415 33.4224 38.2422C32.7869 39.3429 31.6488 40 30.3777 40Z"
                fill="#6B66D0"
              />{" "}
              <path
                d="M30.3753 40C31.6463 40 32.7844 39.3429 33.4199 38.2422C34.0554 37.1415 34.0554 35.8273 33.4199 34.7266L23.0456 16.7578C22.4101 15.6571 21.272 15 20.001 15V40H30.3753Z"
                fill="#453D81"
              />{" "}
              <path
                d="M20.002 17.3438C19.7986 17.3438 19.2925 17.4008 18.9872 17.9297L8.6129 35.8984C8.30758 36.4273 8.51118 36.8941 8.6129 37.0703C8.71462 37.2465 9.01712 37.6562 9.62774 37.6562H30.3763C30.987 37.6562 31.2895 37.2465 31.3912 37.0703C31.4929 36.8941 31.6965 36.4273 31.3912 35.8984L21.0169 17.9297C20.7116 17.4008 20.2055 17.3438 20.002 17.3438Z"
                fill="#FFF375"
              />{" "}
              <path
                d="M30.3753 37.6562C30.9859 37.6562 31.2884 37.2465 31.3901 37.0703C31.4918 36.8941 31.6954 36.4273 31.3901 35.8984L21.0158 17.9297C20.7105 17.4008 20.2043 17.3438 20.001 17.3438V37.6562H30.3753Z"
                fill="#FFC178"
              />{" "}
              <path
                d="M20.001 30.625C19.3538 30.625 18.8291 30.1003 18.8291 29.4531V22.4219C18.8291 21.7747 19.3538 21.25 20.001 21.25C20.6482 21.25 21.1729 21.7747 21.1729 22.4219V29.4531C21.1729 30.1003 20.6482 30.625 20.001 30.625Z"
                fill="#6B66D0"
              />{" "}
              <path
                d="M20.001 35.3125C20.6482 35.3125 21.1729 34.7878 21.1729 34.1406C21.1729 33.4934 20.6482 32.9688 20.001 32.9688C19.3538 32.9688 18.8291 33.4934 18.8291 34.1406C18.8291 34.7878 19.3538 35.3125 20.001 35.3125Z"
                fill="#6B66D0"
              />{" "}
              <path
                d="M21.1729 29.4531V22.4219C21.1729 21.7747 20.6482 21.25 20.001 21.25V30.625C20.6482 30.625 21.1729 30.1003 21.1729 29.4531Z"
                fill="#453D81"
              />{" "}
              <path
                d="M21.1729 34.1406C21.1729 33.4934 20.6482 32.9688 20.001 32.9688V35.3125C20.6482 35.3125 21.1729 34.7878 21.1729 34.1406Z"
                fill="#453D81"
              />{" "}
              <path
                d="M34.1422 5.85781C30.3646 2.08039 25.3422 0 20 0C14.6578 0 9.63539 2.08039 5.85781 5.85781C2.08039 9.63539 0 14.6578 0 20C0 20.6472 0.524687 21.1719 1.17188 21.1719H9.0625C9.70969 21.1719 10.2344 20.6472 10.2344 20C10.2344 14.6152 14.6152 10.2344 20 10.2344C25.3848 10.2344 29.7656 14.6152 29.7656 20C29.7656 20.6472 30.2903 21.1719 30.9375 21.1719H38.8281C39.4753 21.1719 40 20.6472 40 20C40 14.6578 37.9196 9.63539 34.1422 5.85781ZM7.94688 18.8281H2.38219C2.64492 14.8403 4.2382 11.2103 6.72039 8.37773L10.6531 12.3104C9.16187 14.1196 8.1843 16.3672 7.94688 18.8281ZM12.3103 10.653L8.37781 6.72062C11.2103 4.23844 14.8403 2.64594 18.8281 2.38336V7.94703C16.3672 8.18437 14.1196 9.16187 12.3103 10.653ZM21.1719 7.94695V2.38336C25.1597 2.64602 28.7896 4.23852 31.6221 6.72062L27.6897 10.653C25.8804 9.16187 23.6328 8.18437 21.1719 7.94695ZM32.0531 18.8281C31.8157 16.3672 30.838 14.1196 29.3469 12.3103L33.2795 8.37766C35.7617 11.2102 37.3551 14.8402 37.6177 18.8281H32.0531Z"
                fill="#F9F9F9"
              />{" "}
              <path
                d="M20 0V10.2344C25.3848 10.2344 29.7656 14.6152 29.7656 20C29.7656 20.6472 30.2903 21.1719 30.9375 21.1719H38.8281C39.4753 21.1719 40 20.6472 40 20C40 14.6578 37.9196 9.63539 34.1422 5.85781C30.3646 2.08039 25.3422 0 20 0ZM21.1719 7.94695V2.38336C25.1597 2.64602 28.7896 4.23852 31.6221 6.72062L27.6897 10.653C25.8804 9.16187 23.6328 8.18437 21.1719 7.94695ZM32.0531 18.8281C31.8157 16.3672 30.838 14.1196 29.3469 12.3103L33.2795 8.37766C35.7617 11.2102 37.3551 14.8402 37.6177 18.8281H32.0531Z"
                fill="#E2E2EA"
              />{" "}
            </svg>
            <h4>Risk Factors </h4>
            <div>
              <p>
                <svg
                  width="18"
                  height="2"
                  viewBox="0 0 18 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L17 0.999999"
                    stroke="#E5E7EB"
                    strokeLinecap="round"
                  />
                </svg>
                Establishing GIS manufacturing facility in Gujarat
              </p>

              <p>
                <svg
                  width="18"
                  height="2"
                  viewBox="0 0 18 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L17 0.999999"
                    stroke="#E5E7EB"
                    strokeLinecap="round"
                  />
                </svg>
                Establishing manufacturing facility in Odisha
              </p>

              <p>
                <svg
                  width="18"
                  height="2"
                  viewBox="0 0 18 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L17 0.999999"
                    stroke="#E5E7EB"
                    strokeLinecap="round"
                  />
                </svg>
                Repayment of short-term borrowings
              </p>

              <p>
                <svg
                  width="18"
                  height="2"
                  viewBox="0 0 18 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L17 0.999999"
                    stroke="#E5E7EB"
                    strokeLinecap="round"
                  />
                </svg>
                General corporate purposes
              </p>
            </div>
          </section>
          <section className="ipo-objective-container-section">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              {" "}
              <g clipPath="url(#clip0_6168_25501)">
                {" "}
                <path
                  d="M19.6358 37.2666C29.0955 37.2666 36.7642 29.598 36.7642 20.1382C36.7642 10.6784 29.0955 3.00977 19.6358 3.00977C10.176 3.00977 2.50732 10.6784 2.50732 20.1382C2.50732 29.598 10.176 37.2666 19.6358 37.2666Z"
                  fill="#F9F7F8"
                />{" "}
                <path
                  d="M24.2358 36.6404C22.7719 37.0498 21.2294 37.2671 19.6351 37.2671C10.1763 37.2671 2.50732 29.5981 2.50732 20.1376C2.50732 10.6787 10.1763 3.00977 19.6351 3.00977C21.2294 3.00977 22.7719 3.22703 24.2358 3.63648C17.0097 5.64516 11.7088 12.273 11.7088 20.1376C11.7088 28.0037 17.0097 34.6316 24.2358 36.6404Z"
                  fill="#DEDBEE"
                />{" "}
                <path
                  d="M39.0514 9.8493L36.6856 10.3973C33.4818 4.80836 27.6607 1.08078 21.1981 0.564922C10.4056 -0.296562 0.924246 7.78297 0.0627615 18.5755C-0.327317 23.4627 1.11042 28.287 4.11089 32.1598C7.09081 36.006 11.3589 38.5981 16.1289 39.4588C16.2122 39.4738 16.295 39.4845 16.3776 39.491C17.7842 39.6032 19.0616 38.5144 19.0821 37.0069C19.0989 35.7768 18.1876 34.7393 16.9776 34.5173C13.4458 33.8695 10.2852 31.943 8.07425 29.0892C5.84026 26.2059 4.76995 22.6138 5.06042 18.9745C5.7019 10.9376 12.7623 4.92102 20.7992 5.5625C25.0962 5.90547 29.0119 8.15664 31.5007 11.5983L29.4845 12.0653C28.9046 12.1996 28.6876 12.9113 29.0939 13.3463L35.4996 20.205C36.0375 20.7809 36.9972 20.5587 37.2271 19.8048L39.9653 10.8281C40.1391 10.2588 39.6313 9.715 39.0514 9.8493Z"
                  fill="#806215"
                />{" "}
                <path
                  d="M6.81644 32.1601C3.81589 28.2872 2.37823 23.4629 2.76831 18.5759C3.55073 8.77432 11.4428 1.21104 20.9696 0.549948C10.2722 -0.180208 0.918233 7.85964 0.062764 18.5759C-0.327314 23.463 1.11034 28.2873 4.11089 32.1601C7.09081 36.0063 11.3589 38.5984 16.1289 39.459C16.2122 39.474 16.295 39.4848 16.3776 39.4914C16.8537 39.5293 17.3148 39.4293 17.7175 39.2224C13.4005 38.1811 9.56167 35.7034 6.81644 32.1601Z"
                  fill="#C9A74E"
                />{" "}
                <path
                  d="M31.7997 13.347C31.3934 12.912 31.6104 12.2003 32.1903 12.066L34.2066 11.599C31.7178 8.15733 27.8021 5.90616 23.505 5.56319C22.649 5.49491 21.8043 5.50272 20.9771 5.57983C25.2042 5.96998 29.0466 8.20483 31.501 11.599L29.4848 12.066C28.9049 12.2003 28.6879 12.912 29.0942 13.347L35.4999 20.2057C36.0378 20.7816 36.9975 20.5594 37.2274 19.8056L37.3762 19.3178L31.7997 13.347Z"
                  fill="#C9A74E"
                />{" "}
                <path
                  d="M36.5261 36.6566C36.5225 36.6566 36.5191 36.6566 36.5155 36.6565C35.8567 36.6508 35.3271 36.1122 35.3328 35.4533C35.3384 34.8018 35.3442 34.0778 35.3496 33.3234H30.903C30.4809 33.3234 30.0903 33.1004 29.8757 32.7369C29.6611 32.3735 29.6545 31.9237 29.8584 31.5541C30.7514 29.9354 33.7148 24.5929 34.3529 23.8101C34.9227 23.111 35.6955 22.8276 36.42 23.0519C37.1514 23.2784 37.6707 23.9856 37.743 24.8537C37.7767 25.258 37.768 28.2076 37.7519 30.9373H37.995C38.6539 30.9373 39.1881 31.4715 39.1881 32.1304C39.1881 32.7893 38.6539 33.3234 37.995 33.3234H37.736C37.7288 34.2926 37.7222 35.0757 37.7188 35.4739C37.7132 36.1292 37.1801 36.6566 36.5261 36.6566ZM32.9301 30.9373H35.3654C35.3749 29.3153 35.3812 27.7517 35.3805 26.6383C34.7492 27.7101 33.8496 29.2915 32.9301 30.9373Z"
                  fill="#C9A74E"
                />{" "}
                <path
                  d="M25.33 36.6591C23.1443 36.6591 22.9814 36.6047 22.8221 36.5516C22.4269 36.4198 22.1315 36.1209 22.0117 35.7312C21.825 35.1244 22.1595 34.6373 22.2854 34.4541C22.398 34.2902 22.5618 34.0756 22.8097 33.751C23.3836 32.9996 24.4518 31.6009 26.2418 29.0434C26.7647 28.2963 27.1018 27.6293 27.2448 27.0598L27.2815 26.7728C27.2467 25.8677 26.4995 25.142 25.586 25.142C24.7768 25.142 24.0766 25.7168 23.9211 26.5086C23.794 27.1551 23.1671 27.5762 22.5204 27.4493C21.8739 27.3223 21.4527 26.6952 21.5797 26.0487C21.9545 24.1407 23.6394 22.7559 25.5861 22.7559C27.8374 22.7559 29.669 24.5874 29.669 26.8387C29.6632 27.0155 29.614 27.3705 29.5823 27.5451C29.3783 28.4251 28.9121 29.3895 28.1968 30.4115C26.948 32.1959 26.0437 33.4266 25.4105 34.2704C26.4444 34.2694 27.7303 34.2598 28.9396 34.2445C28.9447 34.2445 28.9498 34.2445 28.9549 34.2445C29.6068 34.2445 30.1393 34.7687 30.1475 35.4225C30.1558 36.0813 29.6284 36.6222 28.9696 36.6305C27.3618 36.6507 26.1895 36.6591 25.33 36.6591Z"
                  fill="#C9A74E"
                />{" "}
                <path
                  d="M19.6359 21.3314H15.8547C15.1958 21.3314 14.6616 20.7973 14.6616 20.1384C14.6616 19.4795 15.1958 18.9453 15.8547 18.9453H18.4429V13.4157C18.4429 12.7568 18.977 12.2227 19.6359 12.2227C20.2948 12.2227 20.829 12.7568 20.829 13.4157V20.1384C20.829 20.7973 20.2948 21.3314 19.6359 21.3314Z"
                  fill="#7A6D79"
                />{" "}
                <path
                  d="M19.6358 21.8537C20.6595 21.8537 21.4894 21.0238 21.4894 20.0001C21.4894 18.9764 20.6595 18.1465 19.6358 18.1465C18.6121 18.1465 17.7822 18.9764 17.7822 20.0001C17.7822 21.0238 18.6121 21.8537 19.6358 21.8537Z"
                  fill="#806215"
                />{" "}
                <path
                  d="M19.6383 10.0855C19.3049 10.0855 19.0347 9.81531 19.0347 9.48195V7.56258C19.0347 7.22922 19.3049 6.95898 19.6383 6.95898C19.9716 6.95898 20.2419 7.22922 20.2419 7.56258V9.48187C20.2419 9.81523 19.9716 10.0855 19.6383 10.0855Z"
                  fill="#7A6D79"
                />{" "}
                <path
                  d="M19.6383 33.0415C19.3049 33.0415 19.0347 32.7713 19.0347 32.4379V30.5186C19.0347 30.1853 19.3049 29.915 19.6383 29.915C19.9716 29.915 20.2419 30.1853 20.2419 30.5186V32.4379C20.2419 32.7712 19.9716 33.0415 19.6383 33.0415Z"
                  fill="#7A6D79"
                />{" "}
                <path
                  d="M32.0757 20.6037H30.1563C29.823 20.6037 29.5527 20.3334 29.5527 20.0001C29.5527 19.6667 29.823 19.3965 30.1563 19.3965H32.0757C32.4091 19.3965 32.6793 19.6667 32.6793 20.0001C32.6793 20.3334 32.4091 20.6037 32.0757 20.6037Z"
                  fill="#7A6D79"
                />{" "}
                <path
                  d="M9.12014 20.6037H7.20076C6.8674 20.6037 6.59717 20.3334 6.59717 20.0001C6.59717 19.6667 6.8674 19.3965 7.20076 19.3965H9.12006C9.45342 19.3965 9.72365 19.6667 9.72365 20.0001C9.72373 20.3334 9.4535 20.6037 9.12014 20.6037Z"
                  fill="#7A6D79"
                />{" "}
              </g>{" "}
              <defs>
                {" "}
                <clipPath id="clip0_6168_25501">
                  {" "}
                  <rect width="40" height="40" fill="white" />{" "}
                </clipPath>{" "}
              </defs>{" "}
            </svg>
            <h4>Allocation Available</h4>
            <ul>
              <li>
                The IPO complies with SEBI ICDR Regulations, offering not less
                than 25% of the post-issue equity to the public.
              </li>

              <li>GIS Facility (Gujarat): ₹2,000.00</li>

              <li>
                Specific reservations and categories include Qualified
                Institutional Buyers, Non-Institutional Investors, and
                Individual Investors, with proportional allocation mechanisms
              </li>
            </ul>
          </section>
          <section className="ipo-objective-container-section">
            <img src="/deals/important-dates.svg" alt="" />
            <h4>Important Dates</h4>
            <p>Dates will be announced soon</p>
          </section>
          <section className="ipo-objective-container-section">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              {" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.20855 33.2363H3.63416C2.6653 33.2363 1.76103 32.858 1.07822 32.1751C0.386179 31.4831 0.0170898 30.5788 0.0170898 29.61V5.21321C0.0170898 4.24435 0.395406 3.34009 1.07822 2.64804C1.76103 1.96523 2.67453 1.58691 3.63416 1.58691H3.64339L28.0402 1.59614C29.0182 1.59614 29.9317 1.97446 30.6238 2.67573C31.3066 3.35854 31.6757 4.26281 31.6665 5.22244V7.78761C31.6665 8.16592 31.362 8.47042 30.9836 8.47042C30.7899 8.47042 30.6146 8.38738 30.4946 8.25819L6.66992 32.0552C6.80832 32.1844 6.89137 32.3597 6.89137 32.5627C6.89137 32.9318 6.58687 33.2363 6.20855 33.2363Z"
                fill="#C9A74E"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30.6147 38.7631H9.15218C8.19255 38.7631 7.27905 38.3848 6.59624 37.6927C5.90419 37.0099 5.52588 36.0964 5.52588 35.1368L5.53511 10.7308C5.53511 9.76193 5.91342 8.85766 6.59624 8.17485C7.28828 7.48281 8.19255 7.10449 9.1614 7.10449L33.5582 7.11372C34.5363 7.11372 35.459 7.50126 36.151 8.1933C36.8246 8.88535 37.1937 9.78961 37.1845 10.74L36.9538 32.6547C36.963 32.8392 36.8984 33.0145 36.76 33.1529L31.2698 38.5878C31.1314 38.7169 30.9653 38.7815 30.79 38.7815C30.7346 38.7815 30.6701 38.7815 30.6147 38.7631Z"
                fill="#FFF7E2"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30.6145 38.763H30.1255V32.673C30.1255 32.2947 30.43 31.9902 30.8083 31.9902H36.9629L36.9536 32.6546C36.9629 32.8391 36.8983 33.0145 36.7599 33.1529L31.2697 38.5877C31.1313 38.7169 30.9652 38.7815 30.7898 38.7815C30.7345 38.7815 30.6699 38.7815 30.6145 38.763Z"
                fill="#EAD59C"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M26.4058 14.3945H16.3112C15.9329 14.3945 15.6284 14.09 15.6284 13.7117C15.6284 13.3426 15.9329 13.0381 16.3112 13.0381H26.4058C26.7749 13.0381 27.0794 13.3426 27.0794 13.7117C27.0794 14.09 26.7749 14.3945 26.4058 14.3945Z"
                fill="#333333"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.9515 18.7685H10.7658C10.3875 18.7685 10.083 18.464 10.083 18.0857C10.083 17.7074 10.3875 17.4121 10.7658 17.4121H31.9515C32.3298 17.4121 32.6251 17.7074 32.6251 18.0857C32.6251 18.464 32.3298 18.7685 31.9515 18.7685Z"
                fill="#333333"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.9515 23.1328H10.7658C10.3875 23.1328 10.083 22.8283 10.083 22.4592C10.083 22.0809 10.3875 21.7764 10.7658 21.7764H31.9515C32.3298 21.7764 32.6251 22.0809 32.6251 22.4592C32.6251 22.8283 32.3298 23.1328 31.9515 23.1328Z"
                fill="#333333"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.9515 27.5068H10.7658C10.3875 27.5068 10.083 27.2023 10.083 26.8332C10.083 26.4549 10.3875 26.1504 10.7658 26.1504H31.9515C32.3298 26.1504 32.6251 26.4549 32.6251 26.8332C32.6251 27.2023 32.3298 27.5068 31.9515 27.5068Z"
                fill="#333333"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M26.4058 31.8798H16.3112C15.9329 31.8798 15.6284 31.5753 15.6284 31.197C15.6284 30.8279 15.9329 30.5234 16.3112 30.5234H26.4058C26.7749 30.5234 27.0794 30.8279 27.0794 31.197C27.0794 31.5753 26.7749 31.8798 26.4058 31.8798Z"
                fill="#333333"
              />{" "}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.8512 13.9051C31.7312 13.9051 31.6205 13.8774 31.5097 13.8128C31.1868 13.6282 31.0761 13.213 31.2606 12.8808L35.5144 5.51751C34.7762 4.71475 34.6101 3.48753 35.1822 2.50021C35.5328 1.90044 36.0864 1.47599 36.7508 1.30067C37.4059 1.12536 38.098 1.21763 38.6977 1.55904C39.2883 1.90044 39.7127 2.45408 39.8973 3.11844C40.0726 3.7828 39.9803 4.47484 39.6389 5.06538C39.2975 5.66515 38.7439 6.0896 38.0795 6.26492C37.6089 6.3941 37.1199 6.38487 36.6678 6.24646L32.4417 13.5637C32.3125 13.7851 32.0818 13.9051 31.8512 13.9051Z"
                fill="#836310"
              />{" "}
            </svg>

            <h4>Additional Notes</h4>
            <ul>
              <li>
                The issue has been authorized by the Board (Dec 10, 2024) and by
                Shareholders (Dec 31, 2024).
              </li>
              <li>No exemptions from SEBI laws have been sought.</li>
            </ul>
          </section>
        </div>
      </Dropdown> */}
      {/* <hr className="hr" /> */}


    </div>
  );
};

export default Fundamentals;
