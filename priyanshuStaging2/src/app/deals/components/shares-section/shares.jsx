"use client";
import React from "react";
import { useDealStore } from "@/store/dealStore";

const Shares = ({ isPrivateDeal, isccps }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_setpData;

  const shareAllocation = dealData?.share_allocation?.data;

  if (!dealData?.share_allocation?.status || !shareAllocation) return null;

  const preIssue = shareAllocation.pre_issue_shareholding;
  const postIssue = shareAllocation.post_issue_shareholding;

  const totalShares = postIssue?.total_shares_post_issue || 0;
  const outstandingPreIssue = postIssue?.outstanding_shares_pre_issue || 0;
  const newIssueShares = postIssue?.new_issue_shares || 0;

  const oldSharesPercent =
    totalShares > 0 ? (outstandingPreIssue / totalShares) * 100 : 0;
  const newSharesPercent = 100 - oldSharesPercent;
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };


  return (
    <div className={`shares-card ${isPrivateDeal ? "private" : "public"}`}>
      {/* Header */}
      <div className="shares-header">
        <div className="shares-title">
          {dealData?.share_allocation?.label_name || "Pre-Issue Shareholding"}: Promoters – {preIssue?.promoters_percent ?? "N/A"}%, Others –{" "}
          {preIssue?.other_percent ?? "N/A"}%
        </div>

        {!isccps ? <><div className="shares-title">{postIssue?.label_name || "Total Shares Post Issue"}
          {/* : 
          {formatNumber(totalShares)} */}
          </div></> : ""}

      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-fill old-shares"
          style={{ width: `${oldSharesPercent}%` }}
        ></div>
        <div
          className="progress-fill new-shares"
          style={{ width: `${newSharesPercent}%` }}
        ></div>
      </div>

      {/* Visual Representation */}
      <div className="shares-section">
        <svg width="286" height="16" viewBox="0 0 286 16" fill="none">
          <line x1="0.5" y1="0" x2="0.5" y2="16" stroke="#E5E7EB" />
          <line y1="7.5" x2="286" y2="7.5" stroke="#E5E7EB" />
        </svg>

        <span className="total-shares">{formatNumber(totalShares)} shares</span>

        <svg width="287" height="16" viewBox="0 0 287 16" fill="none">
          <line y1="7.5" x2="286" y2="7.5" stroke="#E5E7EB" />
          <line x1="286.5" y1="0" x2="286.5" y2="16" stroke="#E5E7EB" />
        </svg>
      </div>

      {/* Labels */}
      <div className="labels">
        <div className="label-item">
          <span className="dot new-shares-dot"></span>
          <div>
            <p className="label-title"> {isccps ? "Promoters (Pre-Issue)" : "Outstanding Shares (Pre-Issue)"}</p>
            <p className="label-value">{formatNumber(outstandingPreIssue)} shares</p>
          </div>
        </div>

        <div className="label-item">
          <span className="dot old-shares-dot "></span>
          <div>
            <p className="label-title">{isccps ? "Others" : "New Issue Shares"} </p>
            <p className="label-value">{formatNumber(newIssueShares)} shares</p>
          </div>
        </div>
      </div>
      {isccps ? (
        <section className="fundraising" aria-labelledby="fundraising-heading">
          <p>
            The Company is currently in the process of raising a pre-IPO round of
            <strong> ₹7.5 Cr </strong>
            through the issuance of Compulsorily Convertible Preference Shares "CCPS".
          </p>

          <ul>
            <li>
              <strong>Conversion Clause:</strong>
              {" "}CCPS to be converted such that the Investor achieves an Internal Rate of Return (IRR) of <strong>35%</strong> on the total capital invested.
            </li>

            <li>
              <strong>IPO Plans:</strong> The Company intends to launch its IPO in
              <strong> May'27</strong>, targeting a fundraise of approximately
              <strong> ₹35 Cr</strong> based on a PAT ARR of
              <strong> ₹8 Cr</strong> on Sep'26 actuals or Mar'27 projected.
            </li>

            <li>
              <strong>Use of Funds:</strong> Physical studio expansion, development of
              a cricket super-app, online retail expansion, and expanding the
              manufacturing facility for <em>SWAR</em>.
            </li>
          </ul>
        </section>
      ) : null}

    </div>
  );
};

export default Shares;
