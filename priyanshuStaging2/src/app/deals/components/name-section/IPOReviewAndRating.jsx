import React, { useState, useEffect, useRef } from "react";
import "./ipo-review.css";
import { ChevronDown, ChevronUp } from "lucide-react";

const dummyReviewData = [
  {
    id: "fundamentals",
    parameter: "Company Fundamentals",
    weight: "30%",
    score: "8.5/10",
    keyFactors: "Strong Revenue Growth, Improving EBITDA Margins, Asset-Light Model",
    details: {
      analysis: "The company demonstrates exceptional fundamental strength with robust revenue growth trajectory and consistently improving EBITDA margins. The asset-light business model provides significant operational flexibility and scalability potential.",
      strengths: [
        "Year-over-year revenue growth of 45%",
        "EBITDA margins improved from 12% to 18%",
        "Asset-light model reduces capital requirements",
        "Strong free cash flow generation"
      ],
      risks: [
        "High growth dependent on market conditions",
        "Competitive pressure may impact margins"
      ],
      outlook: "Expected to maintain strong growth momentum over the next 2-3 years with continued margin expansion as operational efficiencies improve."
    }
  },
  {
    id: "industry",
    parameter: "Industry",
    weight: "20%",
    score: "8.5/10",
    keyFactors: "Market Size, Cycle Stage, Regulatory Environment.",
    details: null
  },
  {
    id: "management",
    parameter: "Management",
    weight: "15%",
    score: "8.5/10",
    keyFactors: "Promoter Quality, Board Composition, Governance",
    details: null
  },
  {
    id: "valuation",
    parameter: "Valuation Metrics",
    weight: "15%",
    score: "8.5/10",
    keyFactors: "P/E Vs Peers, EV/EBITDA, Price-To-Book, GMP",
    details: null
  },
  {
    id: "merchant",
    parameter: "Merchant Banker Track Record",
    weight: "15%",
    score: "8.5/10",
    keyFactors: "Listing Performance, Oversubscription History",
    details: null
  },
  {
    id: "market",
    parameter: "Market Sentiment",
    weight: "20%",
    score: "8.5/10",
    keyFactors: "Subscription Rate, Macros, Sector Momentum",
    details: null
  }
];

const CircularRating = ({ score }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  // Score is out of 5. Stroke dashoffset = circumference - (percent * circumference)
  const rawPercent = score ? (parseFloat(score) / 5) : 0;
  const percent = Math.min(Math.max(rawPercent, 0), 1);
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className="ipo-circular-rating">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <defs>
          <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(116.57 0.5 0.5)">
            <stop offset="0%" stopColor="#B59131" />
            <stop offset="133.33%" stopColor="#FFC733" />
          </linearGradient>
        </defs>
        {/* Background track circle */}
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="6"
        />
        {/* Progress active circle */}
        <circle
          className="ipo-progress-circle"
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="url(#ratingGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ 
            '--circumference': circumference,
            '--target-offset': strokeDashoffset 
          }}
          transform="rotate(-90 42 42)" // Start from top
        />
      </svg>
      <div className="ipo-circular-rating-text">
        <span className="ipo-rating-num">{score || "N/A"}</span>
        <span className="ipo-rating-sub">out of 5</span>
      </div>
    </div>
  );
};

const IPOReviewAndRating = ({ reviewData }) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("180px");

  useEffect(() => {
    if (contentRef.current) {
      if (isMainOpen) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
        const timer = setTimeout(() => {
          setMaxHeight("none");
        }, 400); // Wait for transition of 0.4s to finish
        return () => clearTimeout(timer);
      } else {
        // If it was "none", we must temporarily set it to the actual scrollHeight
        // so the browser can animate the transition down to 180px.
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
        const timer = setTimeout(() => {
          setMaxHeight("180px");
        }, 20);
        return () => clearTimeout(timer);
      }
    }
  }, [isMainOpen, reviewData]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isStatusValid = reviewData?.status === true || reviewData?.status === "true";
  if (!reviewData || !isStatusValid) return null;

  const currentScore = reviewData.weighted_composite_score || "0";
  const breakdown = reviewData.review_breakdown || [];

  return (
    <div className="ipo-review-container">
      {/* Header bar */}
      <div className="ipo-review-header-flex">
        <h2 className="ipo-review-title">{reviewData.label_name || "IPO Review and Rating"}</h2>
        <div className="ipo-review-badge-col">
          {reviewData.badge_text?.status && (
            <div className="ipo-review-badge">
              <span className="ipo-review-badge-dot"></span>
              {reviewData.badge_text.value}
            </div>
          )}
          {reviewData.badge_subtext?.status && (
            <span className="ipo-review-badge-caption">{reviewData.badge_subtext.value}</span>
          )}
        </div>
      </div>

      <div className="ipo-review-summaryBox">
        <CircularRating score={currentScore} />
        <div className="ipo-review-summary-text">
          <h3>{reviewData.overall_recommendation || "Overall Recommendation"}</h3>
          {reviewData.recommendation_description && (
            <div 
              className="ipo-recommendation-p"
              dangerouslySetInnerHTML={{ __html: reviewData.recommendation_description }}
            />
          )}
        </div>
      </div>

      <div className="ipo-review-breakdown-wrapper">
        <div 
          className={`ipo-review-collapsible-content ${isMainOpen ? "expanded" : "collapsed"}`}
          style={{ maxHeight: maxHeight }}
        >
          <div ref={contentRef}>
            <div className="ipo-review-table-header">
              <div className="ipo-col param-col">PARAMETER</div>
              <div className="ipo-col weight-col">WEIGHT</div>
              <div className="ipo-col score-col">SCORE</div>
              <div className="ipo-col factors-col">KEY FACTORS</div>
            </div>

            <div className="ipo-review-table-body">
              {breakdown.map((row, index) => {
                const isRowExpanded = expandedRows[index];
                const hasDetails = !!row.detailed_analysis;

                return (
                  <div key={index} className="ipo-review-row-group">
                    <div className="ipo-review-row">
                      <div className="ipo-col param-col strong-col">{row.parameter}</div>
                      <div className="ipo-col weight-col">{row.weight}%</div>
                      <div className="ipo-col score-col">
                        <span className="ipo-score-pill">{row.score}/5</span>
                      </div>
                      <div className="ipo-col factors-col key-factor-col">
                        <div className="ipo-key-factor-text">{row.key_factors}</div>
                        {hasDetails && (
                          <div 
                            className="ipo-show-more-btn" 
                            onClick={() => toggleRow(index)}
                          >
                            {isRowExpanded ? 'Show Less' : 'Show more'}
                            {isRowExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Nested Details with Grid-based Transition */}
                    <div className={`ipo-review-nested-details-wrapper ${isRowExpanded && hasDetails ? "open" : ""}`}>
                      <div className="ipo-review-nested-details-inner">
                        <div className="ipo-review-nested-details">
                          <div className="ipo-nested-block">
                            <h4>Detailed Analysis</h4>
                            <div dangerouslySetInnerHTML={{ __html: row.detailed_analysis }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* TOTAL Row */}
              <div className="ipo-review-row total-row">
                <div className="ipo-col param-col strong-col">TOTAL</div>
                <div className="ipo-col weight-col">100%</div>
                <div className="ipo-col score-col">
                  <span className="ipo-score-pill">{currentScore}/5</span>
                </div>
                <div className="ipo-col factors-col italic-col">Weighted Composite Score</div>
              </div>
            </div>
          </div>

          {/* Blur overlay (fades out dynamically when expanded) */}
          <div className={`ipo-review-blur-overlay ${isMainOpen ? "expanded" : ""}`}></div>
        </div>

        {/* Toggle section: centered button with lines on both sides */}
        <div className="ipo-review-accordion-toggle-wrapper">
          <div className="ipo-accordion-line"></div>
          <button 
            className="ipo-review-accordion-toggle-btn" 
            onClick={() => setIsMainOpen(!isMainOpen)}
          >
            {isMainOpen ? 'Hide detailed breakdown' : 'View detailed breakdown'}
            {isMainOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className="ipo-accordion-line"></div>
        </div>
      </div>

    </div>
  );
};

export default IPOReviewAndRating;
