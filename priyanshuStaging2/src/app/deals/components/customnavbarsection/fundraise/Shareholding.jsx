"use client";
import { useEffect, useState } from "react";
import Fundamentals from "../fundamentals/fundamentals";
import ExistingInvestors from "./ExistingInvestors";
import styles from "./Shareholding.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDealStore } from "@/store/dealStore";

export default function Shareholding({ isPrivateDeal, dealDetails: dealDetailsProp }) {
  const [showshareholding, setShowshareholding] = useState(true);
  const [preprogressbar, setPreprogressbar] = useState(0);
  const [postprogressbar, setPostprogressbar] = useState(0);

  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const shareholdingPattern =
    dealDetails?.data?.fundraise_future_plans?.shareholding_pattern || {};


  const promoters =
    shareholdingPattern?.data?.promoters?.data ||
    shareholdingPattern?.promoters?.data ||
    [];

  const additionalShareholders =
    shareholdingPattern?.data?.additional_shareholders?.data ||
    shareholdingPattern?.additional_shareholders?.data ||
    [];

  // calculate totals safely
  const totalPromoterPre = promoters.reduce(
    (acc, curr) => acc + parseFloat(curr.pre_issue_share || 0),
    0
  );
  const totalPromoterPost = promoters.reduce(
    (acc, curr) => acc + parseFloat(curr.post_issue_share || 0),
    0
  );

  const totalAdditionalPre = additionalShareholders.reduce(
    (acc, curr) => acc + parseFloat(curr.pre_issue_share || 0),
    0
  );
  const totalAdditionalPost = additionalShareholders.reduce(
    (acc, curr) => acc + parseFloat(curr.post_issue_share || 0),
    0
  );

  const totalPreShares = totalPromoterPre + totalAdditionalPre;
  const totalPostShares = totalPromoterPost + totalAdditionalPost;
  
  const hasPostIssueData = totalPostShares > 0;

  useEffect(() => {
    setTimeout(() => setPreprogressbar(Number.isFinite(totalPromoterPre) ? totalPromoterPre : 0), 100);
    setTimeout(() => setPostprogressbar(Number.isFinite(totalPromoterPost) ? totalPromoterPost : 0), 100);
  }, [totalPromoterPre, totalPromoterPost]);

  const isccps = dealDetails?.data?.deal_type === "ccps";
  console.log("ccps true or false",isccps);
  
  // hide the whole section if not enabled at fundraise level
  if (dealDetails?.data?.fundraise_future_plans?.status === false) {
    return null;
  }

  const hasShareholdingData = promoters.length > 0 || additionalShareholders.length > 0;

  if (!hasShareholdingData) {
    return (
      <div className={isPrivateDeal ? styles.privateContainer : styles.container}>
        <ExistingInvestors isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
        {!isPrivateDeal && <Fundamentals isPrivateDeal={isPrivateDeal} />}
      </div>
    );
  }

  return (
    <div className={isPrivateDeal ? styles.privateContainer : styles.container}>
      <div
        className={styles.title}
        onClick={() => setShowshareholding(!showshareholding)}
        style={{ cursor: "pointer" }}
      >
        <h3>Shareholding</h3>
        <div>
          {showshareholding ? (
            <ChevronUp color={isPrivateDeal ? "white" : "black"} />
          ) : (
            <ChevronDown color={isPrivateDeal ? "white" : "black"} />
          )}
        </div>
      </div>

      {showshareholding && (
        <>
          {/* Pre-Issue */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Pre-issue shareholding</h4>
              <p className={styles.progressLabel}>
                Promoter Holding <strong>{preprogressbar?.toFixed(1)}%</strong>
              </p>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.actualprecentage}
                style={{ width: `${Math.min(preprogressbar, 100)}%` }}
              ></div>
              <div
                className={styles.remaingpercentage}
                style={{ width: `${100 - Math.min(preprogressbar, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Post-Issue */}
          {hasPostIssueData && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4>Post-Issue Shareholding</h4>
                <p className={styles.progressLabel}>
                  Promoter Holding <strong>{postprogressbar?.toFixed(1)}%</strong>
                </p>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.actualprecentage}
                  style={{ width: `${Math.min(postprogressbar, 100)}%` }}
                ></div>
                <div
                  className={styles.remaingpercentage}
                  style={{ width: `${100 - Math.min(postprogressbar, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        

          {/* Table */}
          <div className={styles.table}>
            <div className={styles.tableInner}>
              <div className={styles.header}>
                <span>Category</span>
                <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                  <span className={styles.preIssue}>Pre-Issue%</span>
                  {hasPostIssueData && <span className={styles.postIssue}>Post-Issue%</span>}
                </div>
              </div>

            {/* Promoters Section */}
            {promoters.length > 0 && (
                <>
                  <div className={styles.subHeader}>Promoters</div>
                  {promoters.map((promoter, index) => {
                    const rowPre = parseFloat(promoter.pre_issue_share || 0);
                    const rowPost = parseFloat(promoter.post_issue_share || 0);
                    return (
                      <div className={styles.row} key={index}>
                        <span className={styles.name}>
                          <span className={styles.squarePromoter}></span>
                          {promoter.promoter_name}
                        </span>
                        <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                          <span className={styles.preIssue}>{rowPre.toFixed(1)}%</span>
                          {hasPostIssueData && <span className={styles.postIssue}>{rowPost.toFixed(1)}%</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className={`${styles.row} ${styles.totalRow}`}>
                    <span>Total Promoter Holding</span>
                    <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                      <span className={styles.preIssue}>{totalPromoterPre.toFixed(1)}%</span>
                      {hasPostIssueData && <span className={styles.postIssue}>{totalPromoterPost.toFixed(1)}%</span>}
                    </div>
                  </div>
                </>
              )}

            {/* Additional Shareholders Section */}
            {additionalShareholders.length > 0 && (
                <>
                  <div className={styles.subHeader}>
                    Additional Shareholders
                  </div>
                  {additionalShareholders.map((holder, index) => {
                    const rowPre = parseFloat(holder.pre_issue_share || 0);
                    const rowPost = parseFloat(holder.post_issue_share || 0);
                    return (
                      <div className={styles.row} key={index}>
                        <span className={styles.name}>
                          <span className={styles.squareAdditional }></span>
                          {holder.shareholder_name}
                        </span>
                        <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                          <span className={styles.preIssue}>{rowPre.toFixed(1)}%</span>
                          {hasPostIssueData && <span className={styles.postIssue}>{rowPost.toFixed(1)}%</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className={`${styles.row} ${styles.totalRow}`}>
                    <span>Total Additional Holding</span>
                    <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                      <span className={styles.preIssue}>{totalAdditionalPre.toFixed(1)}%</span>
                      {hasPostIssueData && <span className={styles.postIssue}>{totalAdditionalPost.toFixed(1)}%</span>}
                    </div>
                  </div>
                </>
              )}

            {/* Grand Total */}
            {(promoters.length > 0 || additionalShareholders.length > 0) && (
              <div className={`${styles.row} ${styles.grandTotal}`}>
                <span>Total Shareholding</span>
                <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                  <span className={styles.preIssue}>{totalPreShares.toFixed(1)}%</span>
                  {hasPostIssueData && <span className={styles.postIssue}>{totalPostShares.toFixed(1)}%</span>}
                </div>
              </div>
            )}
            </div>
          </div>
        </>
      )}

      <ExistingInvestors isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />

      {!isPrivateDeal && <Fundamentals isPrivateDeal={isPrivateDeal} />}
    </div>
  );
}
