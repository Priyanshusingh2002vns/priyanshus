import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Collapse, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from './IPOCollapse.module.css'
import { useDealStore } from "@/store/dealStore";

const IPOCollapse = ({ isPrivateDeal, isccps, isofs, dealDetails: dealDetailsProp }) => {
    const [open, setOpen] = useState(true);


    const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
    const dealDetails = dealDetailsProp || dealDetailsFromStore;
    const dealData = dealDetails?.data?.deal_setpData;
    const isUnlisted = dealDetails?.data?.deal_type === "unlisted";

    const formatNumber = (value) => {
        if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
        return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const [isSmallScreen, setIsSmallScreen] = React.useState(false);
    React.useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 920);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const shouldShowTooltip = (tooltip) => {
        if (!tooltip) return false;
        if (typeof tooltip === "string") return tooltip.trim() !== "";
        return tooltip?.status === true && !!tooltip?.data?.trim();
    };

    const renderTooltip = (text) => (props) => (
        <Tooltip id="button-tooltip" {...props} className={styles.customTooltip}>
            {typeof text === 'object' && text !== null ? text.data : text}
        </Tooltip>
    );

    const extractStringValue = (val) => {
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString();
        if (typeof val === "object") {
            if ("data" in val && val.data !== null && val.data !== undefined) {
                return extractStringValue(val.data);
            }
            if ("value" in val && val.value !== null && val.value !== undefined) {
                return extractStringValue(val.value);
            }
            if ("as_of_date" in val && val.as_of_date) {
                return extractStringValue(val.as_of_date);
            }
            if ("date" in val && val.date) {
                return extractStringValue(val.date);
            }
            return "";
        }
        return String(val);
    };

    const formatAsOfDate = (dateVal) => {
        if (!dateVal) return "";
        if (dateVal instanceof Date) {
            const day = dateVal.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[dateVal.getMonth()];
            const year = dateVal.getFullYear();
            return `${day} ${month} ${year}`;
        }
        const str = extractStringValue(dateVal);
        if (!str || str.trim() === "") return "";
        const d = new Date(str);
        if (isNaN(d.getTime())) {
            return str;
        }
        const day = d.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const rawAsOfDate =
        dealData?.per_share_price?.as_of_date ||
        dealData?.per_share_price?.date ||
        dealData?.issue_price_per_share?.as_of_date ||
        dealData?.issue_price_per_share?.date ||
        dealData?.price_per_ccps?.as_of_date ||
        dealData?.price_per_ccps?.date ||
        dealData?.as_of_date ||
        dealData?.asOfDate ||
        dealDetails?.data?.updatedAt ||
        dealDetails?.data?.updated_at ||
        dealDetails?.data?.createdAt ||
        dealDetails?.data?.created_at;

    const formattedDate = formatAsOfDate(rawAsOfDate);
    const asOfDateText = formattedDate || formatAsOfDate(new Date());

    return (
        <div className={`${isPrivateDeal ? styles.privateipo : ''} ${styles.ipocllapseWrapper || ''}`}>
            <div
                className={styles.ipocollapseBtn}
            >
                {(dealData?.issue_price_per_share?.status || dealData?.price_per_ccps?.status || dealData?.per_share_price?.status) && (
                    <div className={styles.ipocollapseleft}>
                        <small className={styles.smallText}>
                            {isccps && dealData?.price_per_ccps?.status
                                ? (dealData?.price_per_ccps?.label_name || "Price per CCPS")
                                : (isUnlisted && dealData?.per_share_price?.status
                                    ? (dealData?.per_share_price?.label_name || "Per Share Price")
                                    : (dealData?.issue_price_per_share?.label_name || "Issue Price")
                                  )
                            }
                            {shouldShowTooltip(isccps && dealData?.price_per_ccps?.status ? dealData?.price_per_ccps?.tool_tip : dealData?.issue_price_per_share?.tool_tip) && (
                                <OverlayTrigger
                                    placement="top-start"
                                    container={typeof document !== "undefined" ? document.body : undefined}
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltip(isccps && dealData?.price_per_ccps?.status ? dealData?.price_per_ccps?.tool_tip : dealData.issue_price_per_share.tool_tip)}
                                >
                                    <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                </OverlayTrigger>
                            )}
                        </small>

                        {dealData?.issue_price_per_share?.status ? (
                            <div className={styles.largeText}>
                                {dealData.issue_price_per_share.data?.from === 0 && dealData.issue_price_per_share.data?.to === 0 ? (
                                    "TBD"
                                ) : (
                                    <>
                                        ₹{Number(dealData.issue_price_per_share.data?.from || 0).toFixed(1)} to ₹{Number(dealData.issue_price_per_share.data?.to || 0).toFixed(1)}
                                    </>
                                )}
                            </div>
                        ) : isPrivateDeal && dealData?.price_per_ccps?.status ? (
                            <div className={styles.largeText}>
                                {isccps && dealData?.price_per_ccps?.data === 0 ? (
                                    "TBD"
                                ) : (
                                    <>
                                        ₹{formatNumber(dealData?.price_per_ccps?.data)}
                                        <small className={styles.smll}> per CCPS</small>
                                    </>
                                )}
                            </div>
                        ) : (
                            dealData?.per_share_price?.status && (
                                <div className={styles.largeText}>
                                    {dealData?.per_share_price?.data === "0" ? (
                                        "TBD"
                                    ) : (
                                        <>
                                            ₹{dealData?.per_share_price?.data}
                                        </>
                                    )}
                                </div>
                            )
                        )}

                        {asOfDateText && (
                            <div className={styles.asOfDateText}>
                                As of {asOfDateText}
                            </div>
                        )}
                    </div>
                )}

                {!isPrivateDeal && !isUnlisted && (
                    <>
                        {dealData?.gmp?.status && (
                            <div className={styles.ipocollapseCenter}>
                                <div className={styles.ipocollapseCenterInner}>
                                    <small className={styles.smallText}>
                                        {dealData?.gmp?.label_name || "Current GMP (Per share)"}
                                        {shouldShowTooltip(dealData?.gmp?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={typeof document !== "undefined" ? document.body : undefined}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.gmp.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </small>
                                    <div className={styles.largeText}>
                                        {dealData?.gmp?.data !== null && dealData?.gmp?.data !== undefined && dealData?.gmp?.data !== "" ? (
                                            <>₹{formatNumber(dealData?.gmp?.data)}</>
                                        ) : (
                                            "-"
                                        )}
                                    </div>
                                    {asOfDateText && (
                                        <div className={styles.asOfDateText}>
                                            As of {asOfDateText}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {dealData?.estimated_gain_loss?.status && (
                            <div className={styles.ipocollapseCenter}>
                                <div className={styles.ipocollapseCenterInner}>
                                    <small className={styles.smallText}>
                                        {dealData?.estimated_gain_loss?.label_name || "Estimated Gain/Loss"}
                                        {shouldShowTooltip(dealData?.estimated_gain_loss?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={typeof document !== "undefined" ? document.body : undefined}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.estimated_gain_loss.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </small>
                                    <div className={styles.gainTextgreen} style={{ color: Number(dealData?.estimated_gain_loss?.data) < 0 ? 'red' : undefined }}>
                                        {dealData?.estimated_gain_loss?.data !== undefined && dealData?.estimated_gain_loss?.data !== null && dealData?.estimated_gain_loss?.data !== "" ? (
                                            <>
                                                {dealData.estimated_gain_loss.data > 0 ? "+" : ""}{dealData.estimated_gain_loss.data}%
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px", alignItems: "center", marginBottom: "3px" }}>
                                                    {dealData.estimated_gain_loss.data < 0 ? (
                                                        <path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    ) : (
                                                        <path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    )}
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                TBD
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px", alignItems: "center", marginBottom: "3px" }}>
                                                    <path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </>
                )}

                <div className={`${styles.ipocollapseright} ${(!isofs && dealData?.issue_size?.status) ? "" : styles.noChevron}`}>
                    {dealData?.lot_size?.status && (
                        <div className={styles.ipocollapserightInner}>
                            <small className={styles.smallText}>
                                {dealData?.lot_size?.label_name || "Lot Size"}
                                {shouldShowTooltip(dealData?.lot_size?.tool_tip) && (
                                    <OverlayTrigger
                                        placement={isSmallScreen ? "top-start" : "top-end"}
                                        container={typeof document !== "undefined" ? document.body : undefined}
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip(dealData.lot_size.tool_tip)}
                                    >
                                        <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                    </OverlayTrigger>
                                )}
                            </small>
                            <div className={styles.largeText}>
                                {dealData?.lot_size?.data === null || dealData?.lot_size?.data === undefined || dealData?.lot_size?.data === ""
                                    ? "TBD"
                                    : `${formatNumber(dealData?.lot_size?.data)} Shares`}
                            </div>
                        </div>
                    )}
                    {!isofs && dealData?.issue_size?.status && (
                        <div 
                            onClick={() => setOpen(!open)} 
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            {open ? (
                                <ChevronUp color={isPrivateDeal ? "white" : "black"} />
                            ) : (
                                <ChevronDown color={isPrivateDeal ? "white" : "black"} />
                            )}
                        </div>
                    )}
                </div>

            </div>

            {((dealDetails?.data?.deal_type || '').toLowerCase() === "public" && (dealData?.gmp?.status === true || dealData?.gmp?.status === "true")) && (
                <div className="unlistedDisclaimerDetails gmptxt">
                    <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="cautionIcon">
                        <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                        <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                        <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                    </svg>
                    <span>Grey Market Premium (GMPs) are shared for knowledge purpose only. PrEqt doesn’t promote or execute the trades.</span>
                </div>
            )}

            <Collapse in={!isofs && open && dealData?.issue_size?.status}>
                <div>
                    {dealData?.issue_size?.status && (
                        <Table className={`${styles.ipoCollapsetable} ${isPrivateDeal ? styles.privateTable : ""}`} borderless>
                            <thead>
                                <tr>
                                    <th className="">
                                        {dealData?.issue_size?.label_name || "Issue size"}
                                        {shouldShowTooltip(dealData?.issue_size?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={typeof document !== "undefined" ? document.body : undefined}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.issue_size.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.label_name || "Overall")
                                            : (dealData.issue_size.data.overall?.label_name || "Overall")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.data !== null && dealData.issue_size.data.overall?.data !== undefined && dealData.issue_size.data.overall?.data !== ""
                                                ? `₹${formatNumber(dealData?.issue_size.data.overall?.data)} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.overall !== null && dealData.issue_size.data.overall !== undefined && dealData.issue_size.data.overall !== ""
                                                ? `₹${formatNumber(dealData?.issue_size?.data?.overall)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.label_name || "Fresh Issue")
                                            : (dealData.issue_size.data.fresh_issue?.label_name || "Fresh Issue")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.data !== null && dealData.issue_size.data.fresh_issue?.data !== undefined && dealData.issue_size.data.fresh_issue?.data !== ""
                                                ? `₹${formatNumber(dealData.issue_size.data.fresh_issue.data)} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.fresh_issue !== null && dealData.issue_size.data.fresh_issue !== undefined && dealData.issue_size.data.fresh_issue !== ""
                                                ? `₹${formatNumber(dealData.issue_size.data.fresh_issue)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.label_name || "Offer for Sale")
                                            : (dealData.issue_size.data.offer_for_sale?.label_name || "Offer for Sale")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.data !== null && dealData.issue_size.data.offer_for_sale?.data !== undefined && dealData.issue_size.data.offer_for_sale?.data !== ""
                                                ? `₹${formatNumber(dealData.issue_size.data.offer_for_sale.data)} Cr`
                                                : "NIL")
                                            : (dealData.issue_size.data.offer_for_sale !== null && dealData.issue_size.data.offer_for_sale !== undefined && dealData.issue_size.data.offer_for_sale !== ""
                                                ? `₹${formatNumber(dealData.issue_size.data.offer_for_sale)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    )}

                </div>
            </Collapse>
        </div>
    );
};

export default IPOCollapse;