"use client";
import React from "react";
import Link from "next/link";
import styles from "./viewAll.module.css";
import { useDeals } from "@/app/context/DealContext";
import { formatDealCountText } from "@/app/utils/formatUtils";

const ViewAllAnimation = () => {
  const { totalDeals } = useDeals();
  console.log("ViewAllAnimation totalDeals:", totalDeals);

  return (
    <div className={`${styles.card} ${styles.simple}`}>
      <div className={styles.newDeals}>
        <div className={styles.newDealsHeading}>
          <div className={styles.greenDot}></div>
          <div className={styles.plusDeals}>{formatDealCountText(totalDeals)}</div>
        </div>

        <Link
          href="/deals"
          className={styles.viewAllBtnContainer}
        >
          <p className={styles.ViewAllText}>View All</p>
          <img
            src="/assets/pictures/redirect.svg"
            alt="redirect"
            className={styles.upperRightArrow}
          />
        </Link>
      </div>
    </div>
  );
};

export default ViewAllAnimation;
