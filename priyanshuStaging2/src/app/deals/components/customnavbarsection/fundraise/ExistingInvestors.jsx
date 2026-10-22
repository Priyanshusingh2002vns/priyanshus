"use client";
import React, { useState, useEffect } from "react";
import styles from "./ExistingInvestors.module.css";
import { ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { transformObservationHtml } from "@/app/utils/formatUtils";

// Helper function to resolve backend file paths to full URLs
const toAbsoluteImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";
  // If already a complete URL or blob, return directly
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "").replace(/^public\//, "");
  return baseUrl ? `${baseUrl}/admin/${cleanPath}` : `/admin/${cleanPath}`;
};

export default function ExistingInvestors({ isPrivateDeal, dealDetails }) {
  // 1. All hooks called unconditionally at top level
  const [isOpen, setIsOpen] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const existingInvestorsData =
    dealDetails?.data?.fundraise_future_plans?.existing_investor ||
    dealDetails?.data?.fundraise_future_plans?.existing_investors ||
    dealDetails?.data?.existing_investor ||
    dealDetails?.data?.existing_investors ||
    null;

  // Helper to extract files / images
  const extractFiles = (data) => {
    if (!data) return [];
    const rawList =
      data.files ||
      data.images ||
      data.investor_logos ||
      data.logos ||
      (Array.isArray(data.data) ? data.data : null);

    if (Array.isArray(rawList)) {
      return rawList
        .map((item, idx) => {
          if (!item) return null;
          if (typeof item === "string") {
            const url = toAbsoluteImageUrl(item);
            return url ? { id: `file-${idx}`, url, fileName: `Investor file ${idx + 1}` } : null;
          }
          // Prioritize url/path over temporary local blob preview
          const rawUrl = item.url || item.path || item.fileName || item.image || item.image_url || item.preview || "";
          const url = toAbsoluteImageUrl(rawUrl);
          return url
            ? {
                id: item.id || `file-${idx}`,
                url,
                fileName: item.fileName || item.name || `Investor file ${idx + 1}`,
              }
            : null;
        })
        .filter(Boolean);
    }

    const singleImage = data.image || data.image_url || data.banner;
    if (singleImage) {
      const url = toAbsoluteImageUrl(typeof singleImage === "string" ? singleImage : singleImage.url || singleImage.path);
      return url ? [{ id: "single-file", url, fileName: "Investor file" }] : [];
    }

    return [];
  };

  const filesList = extractFiles(existingInvestorsData);

  // Hook 3: Close modal with ESC key and support arrow key navigation (always called)
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : filesList.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) => (prev < filesList.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImageIndex, filesList.length]);

  // 2. Conditional returns after all hooks
  // If status is false or missing, do not show the existing investor section on UI
  if (
    !existingInvestorsData ||
    existingInvestorsData.status === false ||
    existingInvestorsData.status === "false" ||
    existingInvestorsData.status === 0
  ) {
    return null;
  }

  // Map label_name (Section Header Title)
  const sectionTitle = existingInvestorsData.label_name || "Existing Investors";

  // Map existing_investor_observation_label_name (Observations Card Title)
  const observationTitle =
    existingInvestorsData.existing_investor_observation_label_name ||
    existingInvestorsData.observation_label_name ||
    "OBSERVATIONS & INSIGHTS";

  // Map data (Rich text HTML string) or fallback observations array
  const rawData = existingInvestorsData.data;
  const isHtmlObservation = typeof rawData === "string" && rawData.trim().length > 0;

  const rawObservationsList =
    existingInvestorsData.observations ||
    existingInvestorsData.observations_and_insights ||
    (Array.isArray(rawData) ? rawData : null);

  const hasObservationsList = Array.isArray(rawObservationsList) && rawObservationsList.length > 0;
  const hasObservations = isHtmlObservation || hasObservationsList;

  // If there are no files, no observations, and no custom label, do not render an empty section
  if (!filesList.length && !hasObservations && !existingInvestorsData.label_name) {
    return null;
  }

  return (
    <div className={isPrivateDeal ? styles.privateContainer : styles.container}>
      <div
        className={styles.titleHeader}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <h3 className={`${styles.title} ${isPrivateDeal ? styles.privateTitle : ""}`}>
          {sectionTitle}
        </h3>
        <div className={styles.chevronIcon}>
          {isOpen ? (
            <ChevronUp size={22} color={isPrivateDeal ? "#FFFFFF" : "#1F2937"} />
          ) : (
            <ChevronDown size={22} color={isPrivateDeal ? "#FFFFFF" : "#1F2937"} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className={styles.contentWrapper}>
          {/* Media / Files Image Cards */}
          {filesList.length > 0 && (
            <div className={styles.imagesGrid}>
              {filesList.map((file, idx) => (
                <div
                  key={file.id}
                  className={`${styles.imageCard} ${
                    isPrivateDeal ? styles.privateImageCard : ""
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                  role="button"
                  tabIndex={0}
                  title="Click to view full image"
                >
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className={styles.investorImage}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Fullscreen Image Modal / Lightbox */}
          {selectedImageIndex !== null && filesList[selectedImageIndex] && (
            <div
              className={styles.modalOverlay}
              onClick={() => setSelectedImageIndex(null)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelectedImageIndex(null)}
                  aria-label="Close full view"
                >
                  <X size={22} />
                </button>

                {filesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.navBtn} ${styles.prevBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev > 0 ? prev - 1 : filesList.length - 1
                        );
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.navBtn} ${styles.nextBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev < filesList.length - 1 ? prev + 1 : 0
                        );
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <img
                  src={filesList[selectedImageIndex].url}
                  alt={filesList[selectedImageIndex].fileName}
                  className={styles.fullImage}
                />

                {filesList.length > 1 && (
                  <div className={styles.imageCounter}>
                    {selectedImageIndex + 1} / {filesList.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observations Card matching Financial Highlights */}
          {hasObservations && (
            <div
              className={`${styles.observationsCard} ${
                isPrivateDeal ? styles.privateObservationsCard : ""
              }`}
            >
              <h4
                className={`${styles.observationsTitle} ${
                  isPrivateDeal ? styles.privateObservationsTitle : ""
                }`}
              >
                {observationTitle}
              </h4>

              {isHtmlObservation ? (
                <div
                  className={`${styles.observationsHtmlContent} ${
                    isPrivateDeal ? styles.privateObservationsHtmlContent : ""
                  }`}
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: isPrivateDeal ? "#fff" : "#1F2937",
                  }}
                  dangerouslySetInnerHTML={{ __html: transformObservationHtml(rawData) }}
                />
              ) : (
                <ul
                  className={`${styles.observationsList} ${
                    isPrivateDeal ? styles.privateObservationsList : ""
                  }`}
                >
                  {rawObservationsList.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
