"use client";
import React from "react";
import styles from "./UtilisationFunds.module.css";
import { useDealStore } from "@/store/dealStore";

export default function UtilisationFunds({ isPrivateDeal }) {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;

  const utilisationFunds = dealData?.utilisation_of_funds;

  // If data is missing or status is false, return nothing
  if (!utilisationFunds?.status || !utilisationFunds?.data || !Array.isArray(utilisationFunds.data) || utilisationFunds.data.length === 0) {
    return null;
  }

  const fundsArray = utilisationFunds.data;

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <div className={`${styles.card} ${isPrivateDeal ? styles.privateDeal : ""}`}>
      <h3 className={styles.heading}>{utilisationFunds.label_name || "Utilisation of Funds"}</h3>

      <div className={styles.table}>
        {/* Table header */}
        <div className={styles.rowHeader}>
          <span className={styles.colPurpose}>Purpose</span>
          <span>Crores (%)</span>
        </div>

        {/* Table body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          {fundsArray.map((item, index) => (
            <div key={index}>
              <div className={styles.row}>
                <div className={styles.purpose}>
                  <span
                    className={styles.colorBox}
                    style={{
                      backgroundColor: [
                        "#927127",
                        "#E8E7EE",
                        "#D1BD56",
                        "#EF4444",
                      ][index % 4], // color rotation
                    }}
                  ></span>
                  {item.label_name}
                </div>
                <span className={styles.amount}>₹{formatNumber(item.amount_in_cr)} Cr ({formatNumber(item.amount_in_percent)}%)</span>
              </div>

              {/* Show description if available (Optional as per legacy, safely hidden if not present) */}
              {item.description && item.description.replace(/<[^>]*>/g, "").trim() !== "" && (
                <div
                  className={styles.text}
                  style={{ marginTop: "4px", paddingLeft: "22px" }}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
