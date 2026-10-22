"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useDealStore } from "@/store/dealStore";
import styles from "./RHPDocument.module.css";

const RHPDocument = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const rhpData = dealDetails?.data?.deal_overview?.rhp_deck;

  const toAbsoluteFilePath = (filePath) => {
    if (!filePath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_USER_BASE;
    const cleanBaseUrl = baseUrl?.replace(/\/$/, "");
    const cleanFilePath = filePath.replace(/^public\//, "");
    return `${cleanBaseUrl}/admin/${cleanFilePath}`;
  };

  const docUrl =
    rhpData?.status && rhpData?.data?.[0]?.path
      ? toAbsoluteFilePath(rhpData.data[0].path)
      : null;

  const handleDocumentClick = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (!rhpData?.status || !docUrl) return null;

  return (
    <div className={styles.container}>
      <div
        className={isPrivateDeal ? styles.docButtonDark : styles.docButtonLight}
        onClick={() => handleDocumentClick(docUrl)}
      >
        <p className={isPrivateDeal ? styles.docTextDark : styles.docTextLight}>
          DRHP/RHP DOC
        </p>
        <ChevronRight
          size={isPrivateDeal ? 18 : 20}
          className={isPrivateDeal ? styles.chevronDark : styles.chevronLight}
        />
      </div>
    </div>
  );
};

export default RHPDocument;
