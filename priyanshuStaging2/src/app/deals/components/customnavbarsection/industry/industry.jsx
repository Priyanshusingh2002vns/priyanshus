"use client";
import React, { useState } from "react";
import styles from "./industry.module.css";
import { useDealStore } from "@/store/dealStore";
import { ChevronDown, ChevronUp, X } from "lucide-react";

// ✅ Reusable SafeImage component
const SafeImage = ({ src, alt, className, style }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isVisible || !src) return null;

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, cursor: "pointer" }}
        onClick={handleImageClick}
        onError={(e) => {
          e.target.onerror = null;
          setIsVisible(false);
        }}
      />
      {isModalOpen && (
        <div 
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            cursor: "zoom-out"
          }}
        >
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#fff",
              cursor: "pointer",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100000,
              transition: "background-color 0.2s, transform 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={24} strokeWidth={2} />
          </button>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "80%",
              maxHeight: "80%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "default"
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                padding: "8px"
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// 🔹 UNIVERSAL SAFE DATA EXTRACTOR
const getValue = (value) => {
  // ✅ Case 1 — object with {status,data}
  if (
    value &&
    typeof value === "object" &&
    "data" in value
  ) {
    const data = value.data;

    // null, undefined, empty array → return "-"
    if (data === null || data === undefined) return "-";

    // array or stringified JSON array
    if (Array.isArray(data)) return data;

    // primitive
    if (typeof data === "string" || typeof data === "number") return data;

    return "-";
  }

  // ✅ Case 2 — stringified JSON array
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // ✅ Case 3 — direct primitive
  if (value === null || value === undefined) return "-";

  return value;
};


// 🔹 NORMALIZE PEER COMPARISON INTO ALWAYS AN ARRAY
// Always return a valid peer comparison array
const getPeerArray = (peer) => {
  const extracted = getValue(peer);

  // Case 1 — Already array
  if (Array.isArray(extracted)) return extracted;

  // Case 2 — { status, data: [...] }
  if (
    extracted &&
    typeof extracted === "object" &&
    "status" in extracted &&
    extracted.status === true &&
    Array.isArray(extracted.data)
  ) {
    return extracted.data;
  }

  // Fallback → avoid crash
  return [];
};


const Industry = ({ isPrivateDeal, dealDetails: dealDetailsProp }) => {
  const [showGrowth, setShowGrowth] = useState(true);
  const [showPolicy, setShowPolicy] = useState(true);
  const [showPeer, setShowPeer] = useState(true);

  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const overview = dealDetails?.data?.industry_overview ?? {};
  const isOfs = dealDetails?.data?.deal_type === "ofs";
  const companyName = dealDetails?.data?.deal_setpData?.company_name || "Company";

  const renderFiles = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) return null;

    return (
      <div className={styles.clients} style={{ marginTop: "16px", marginBottom: "16px" }}>
        {files.map((file, idx) => {
          const isImage = file?.mimeType?.startsWith("image/");
          const isVideo = file?.mimeType?.startsWith("video/");
          
          const cleanedPath = file?.path ? file.path.replace(/^\/+/, "").replace(/^public\//, "") : "";
          const baseUrl = process.env.NEXT_PUBLIC_USER_BASE || "";
          const baseAdmin = baseUrl.endsWith("/") ? `${baseUrl}admin` : `${baseUrl}/admin`;
          const normalizedPath = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;
          const fileUrl = `${baseAdmin}${normalizedPath}`;

          const altText = `${file.fileName || "Media"} - ${companyName}`;

          return (
            <div key={idx} className={styles.card} style={{ height: "150px" }}>
              <div className={styles.imageWrapper}>
                {isImage ? (
                  <SafeImage
                    src={fileUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                ) : isVideo ? (
                  <video
                    src={fileUrl}
                    controls
                    className={styles.cardImage}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ----- INDUSTRY DRIVERS -----
  const industryDriver = getValue(overview?.industry_drivers?.data) || [];

  // ----- GOVERNMENT POLICY -----
  const governmentPolicy = getValue(overview?.government_policy_support?.data);

  // ----- PEER COMPARISON -----
  const peerRaw = overview?.peer_comparison?.data; // may be array or object
  const peerData = getPeerArray(peerRaw); // ALWAYS returns array

  // Format numbers safely
  const asFixed = (value, digits = 1) => {
    const num = Number(getValue(value));
    return Number.isFinite(num) ? num.toFixed(digits) : "-";
  };

  // Prepare Company Data (Safe Peer Comparison)
  const companies = (peerData || []).map((item) => {
    let rawLogo = item?.company_logo?.data || item?.company_logo;

    // Try JSON.parse if it's a stringified array
    let logoArray = [];
    try {
      if (typeof rawLogo === "string" && rawLogo.trim().startsWith("[")) {
        logoArray = JSON.parse(rawLogo);
      } else if (Array.isArray(rawLogo)) {
        logoArray = rawLogo;
      }
    } catch (e) {
      console.warn("Invalid logo JSON:", rawLogo);
    }

    let logo = "/assets/pictures/default.png";

    if (Array.isArray(logoArray) && logoArray.length > 0) {
      const file = logoArray[0];
      const cleanPath = file?.path?.replace("public", "") || "";

      if (cleanPath) {
        logo = `${process.env.NEXT_PUBLIC_USER_BASE}/admin${cleanPath}`;
      }
    }


    return {
      name: getValue(item.company_name),
      logo,
      revenue: asFixed(item.revenue_in_cr),
      profit: asFixed(item.net_profit_in_cr),
      ebitda: asFixed(item.ebitda_margin_percent),
      roce: asFixed(item.roce_percent),
      roe: asFixed(item.roe_percent),
      pe: asFixed(item.pe_ratio),
    };
  });

  const metrics = [
    { label: "Revenue (₹ Cr)", key: "revenue" },
    { label: "Net Profit (₹ Cr)", key: "profit" },
    { label: "EBITDA Margin (%)", key: "ebitda" },
    { label: "ROE (%)", key: "roe" },
    { label: "ROCE (%)", key: "roce" },
    { label: "P/E Ratio", key: "pe" },
  ];

  return (
    <div className={isPrivateDeal ? styles.privateIndustryContainer : styles.industryContainer}>
      {/* INDUSTRY DRIVERS */}
      {!isOfs && overview?.industry_drivers?.status && (
        <>
          <section className={styles.growthSection}>
            <h3 
              className={styles.growthHeading} 
              onClick={() => setShowGrowth(!showGrowth)}
              role="button"
              tabIndex={0}
              aria-expanded={showGrowth}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowGrowth(!showGrowth); } }}
            >
              {overview?.industry_drivers?.label_name}
              <div>{showGrowth ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </h3>

            {showGrowth && (
              <div>
                {industryDriver?.length > 0 ? (
                  industryDriver.map((item, idx) => (
                    <div key={idx} className={styles.growthItem}>
                      <h4 className={styles.subTitle}>{getValue(item.label_name)}</h4>
                      <div
                        className={styles.p}
                        dangerouslySetInnerHTML={{ __html: getValue(item.description) }}
                      />
                      {renderFiles(item.files)}
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No data available</p>
                )}
              </div>
            )}
          </section>
          <hr className={styles.seperator} />
        </>
      )}


      {!isOfs && overview?.government_policy_support?.status && (
        <>
          <section className={styles.growthSection}>
            <h3 
              className={styles.growthHeading} 
              onClick={() => setShowPolicy(!showPolicy)}
              role="button"
              tabIndex={0}
              aria-expanded={showPolicy}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowPolicy(!showPolicy); } }}
            >
              {overview?.government_policy_support?.label_name || "Government Policy Support"}
              <div>{showPolicy ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </h3>

            {showPolicy && (
              <div>
                {(governmentPolicy && governmentPolicy !== "-") || (overview?.government_policy_support?.files && overview.government_policy_support.files.length > 0) ? (
                  <div className={styles.growthItem}>
                    {governmentPolicy && governmentPolicy !== "-" && (
                      <div
                        className={styles.p}
                        dangerouslySetInnerHTML={{ __html: governmentPolicy }}
                      />
                    )}
                    {renderFiles(overview?.government_policy_support?.files)}
                  </div>
                ) : (
                  <p className={styles.noData}>No data available</p>
                )}
              </div>
            )}
          </section>
          <hr className={styles.seperator} />
        </>
      )}

      {/* PEER COMPARISON */}
      {/* {overview?.peer_comparison?.status && (
        <section className={styles.peerSection}>
          <h2 className={styles.PeerHeading} onClick={() => setShowPeer(!showPeer)}>
            <div>Peer Comparison</div>
            <div>{showPeer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </h2>

          {showPeer && (
            <div className={styles.tableWrapper}>
              <table className={styles.PeerTable}>
                <thead>
                  <tr>
                    <th className={styles.firstHeading}>Metric</th>
                    {companies.map((company, i) => (
                      <th key={i}>
                        <div className={styles.tableHeading}>
                          <span>{company.name}</span>
                          <img src={company.logo} alt={company.name} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {metrics.map((metric, idx) => (
                    <tr key={idx}>
                      <td>{metric.label}</td>
                      {companies.map((c, i) => (
                        <td key={i}>{c[metric.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )} */}
    </div>
  );
};

export default Industry;
