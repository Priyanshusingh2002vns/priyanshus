import React from "react";
import styles from "./FundAndTimeline.module.css";
import { useDealStore } from "@/store/dealStore";

const DonutChart = ({ data }) => {
  // Filter out segments with 0 percentage to ensure visual gaps are calculated only for active segments
  const activeData = data.filter(item => (parseFloat(item.percentage) || 0) > 0);
  
  const colors = ["#927127", "#DACC7C", "#1A1A1A", "#E8E7EE", "#B59131"];
  
  // Outer radius: 80 + 12 = 92
  // Inner radius: 80 - 12 = 68
  // We want a corner radius of 4px.
  // We'll use a stroke-width of 8px to get a 4px corner radius.
  // So the path dimensions must be:
  // outerRadius = 92 - 4 = 88
  // innerRadius = 68 + 4 = 72
  const rOut = 95;
  const rIn = 70;
  const cornerRadius = 7;
  const strokeWidth = cornerRadius * 1.9; // 14px
  
  const gapAngle = activeData.length > 1 ? (5 * Math.PI / 180) : 0; // 5 degrees gap between segments
  const totalGapAngle = activeData.length * gapAngle;
  const usableAngle = 2 * Math.PI - totalGapAngle;

  let currentAngle = 0;

  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getSegmentPath = (cx, cy, rOut, rIn, startAngle, endAngle) => {
    const startOuter = polarToCartesian(cx, cy, rOut, startAngle);
    const endOuter = polarToCartesian(cx, cy, rOut, endAngle);
    const startInner = polarToCartesian(cx, cy, rIn, startAngle);
    const endInner = polarToCartesian(cx, cy, rIn, endAngle);

    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
      `Z`,
    ].join(" ");
  };

  return (
    <div className={styles.donutContainer}>
      <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        {activeData.map((item, index) => {
          const percentage = parseFloat(item.percentage) || 0;
          const segmentAngle = (percentage / 100) * usableAngle;
          const startAngle = currentAngle;
          const endAngle = startAngle + segmentAngle;

          // Update currentAngle for the next segment
          currentAngle = endAngle + gapAngle;

          // Find the original index of this item in the raw data array to preserve its assigned color
          const originalIndex = data.findIndex(d => d.label === item.label);
          const strokeColor = colors[originalIndex !== -1 ? originalIndex % colors.length : index % colors.length];

          // If there is only one active segment, render a full circle to avoid SVG arc math artifacts at 360 degrees
          if (activeData.length === 1) {
            return (
              <circle
                key={index}
                cx="110"
                cy="110"
                r="80"
                fill="transparent"
                stroke={strokeColor}
                strokeWidth="24"
              />
            );
          }

          const rCenter = (rOut + rIn) / 2;
          const overlapAngle = cornerRadius / rCenter;
          const pathStartAngle = startAngle + overlapAngle;
          const pathEndAngle = Math.max(pathStartAngle + 0.001, endAngle - overlapAngle);

          const pathD = getSegmentPath(110, 110, rOut, rIn, pathStartAngle, pathEndAngle);

          return (
            <path
              key={index}
              d={pathD}
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.sourceLabel}>Source:</span>
        <span className={styles.sourceValue}>Company DRHP</span>
      </div>
    </div>
  );
};

export default function FundAndTimeline() {
  const dealDetails = useDealStore((state) => state.dealDetails);
  
  // Extract Fund Allocation Data
  const utilFundsApi = dealDetails?.data?.deal_overview?.utilisation_of_funds;
  const legacyFundAlloc = dealDetails?.data?.fundraise_future_plans?.fund_allocation?.data;

  const fundAllocationRaw = utilFundsApi?.status && Array.isArray(utilFundsApi?.data) 
    ? utilFundsApi.data 
    : (Array.isArray(legacyFundAlloc) ? legacyFundAlloc : []);

  const totalAmountCr = fundAllocationRaw.reduce((sum, item) => sum + (parseFloat(item.amount_in_cr) || 0), 0);

  const fundAllocation = fundAllocationRaw.map((item) => {
    const amount = parseFloat(item.amount_in_cr) || 0;
    const percentage = totalAmountCr > 0 ? (amount / totalAmountCr) * 100 : 0;
    return {
      label: item.label_name || item.category || "Unknown",
      amount_in_cr: amount,
      percentage: percentage,
    };
  });
  
  const colors = ["#927127", "#DACC7C", "#1A1A1A", "#E8E7EE", "#B59131"];
  const legendData = fundAllocation.map((item, index) => ({
    color: colors[index % colors.length],
    label: item.label,
    value: item.amount_in_cr.toFixed(1),
    percent: `${item.percentage.toFixed(1)}%`
  }));

  // Extract Timeline Data
  const _dealOverview = dealDetails?.data?.deal_overview || {};
  const _dealStepData = dealDetails?.data?.deal_setpData || {};
  const _ipoTimelineRaw = _dealOverview?.ipo_timeline || _dealStepData?.ipo_timeline;
  const ipoTimeline = _ipoTimelineRaw?.data || {};
  
  const timelineConfig = [
    { key: "ipo_open_date", label: "IPO Open Date" },
    { key: "ipo_close_date", label: "IPO Close Date" },
    { key: "tentative_allotment", label: "Tentative Allotment" },
    { key: "initiation_of_refunds", label: "Initiation of Refunds" },
    { key: "credit_of_shares_to_demat", label: "Credit of Shares to Demat" },
    { key: "tentative_listing_date", label: "Tentative Listing Date" },
    // { key: "cut_off_time_for_upi_mandate_confirmation", label: "Cut-off time for UPI mandate confirmation" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "null") return "To Be Announced";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const timelineData = timelineConfig.map(config => {
    const value = ipoTimeline[config.key];
    const isDatePassed = value && new Date(value) < new Date();
    return {
      label: config.label,
      date: formatDate(value),
      completed: !!(value && isDatePassed)
    };
  });

  return (
    <div className={styles.container}>
      {/* Left Card: Fund Allocation */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.title}>Fund Allocation</h3>
          <span className={styles.totalValue}>Total: ₹{totalAmountCr % 1 === 0 ? totalAmountCr.toFixed(0) : totalAmountCr.toFixed(1)} Cr</span>
        </div>

        <div className={styles.chartArea}>
          <DonutChart data={fundAllocation} />
        </div>

        <div className={styles.legendWrapper}>
          {legendData.map((item, i) => (
            <div key={i} className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span className={styles.dot} style={{ backgroundColor: item.color }}></span>
                <span className={styles.legendLabel}>{item.label}</span>
              </div>
              <div className={styles.legendRight}>
                <span className={styles.legendVal}>{item.value}</span>
                <span className={styles.legendPercent}>({item.percent})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Card: Timeline */}
      <div className={styles.card}>
        <h3 className={styles.title}>Timeline</h3>
        
        <div className={styles.timelineWrapper}>
          {timelineData.map((step, i) => {
            const isLast = i === timelineData.length - 1;
             return (
               <div key={i} className={`${styles.timelineStep} ${step.completed ? styles.completed : ''}`}>
                 <div className={styles.timelineIconWrapper}>
                   {step.completed ? (
                      <div className={styles.checkIcon}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                   ) : (
                      <div className={styles.grayCirc}></div>
                   )}
                   {!isLast && <div className={`${styles.line} ${step.completed ? styles.lineGold : styles.lineGray}`}></div>}
                 </div>
                 
                 <div className={styles.timelineContent}>
                   <div className={styles.stepLabel}>{step.label}</div>
                   <div className={styles.stepDate}>{step.date}</div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}
