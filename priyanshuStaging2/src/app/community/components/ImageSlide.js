"use client";
import React, { useRef, useState, useEffect } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import Styles from "./imageSide.module.css";

// import required modules
import { Pagination, Autoplay } from "swiper/modules";
import { X, ChevronLeft, ChevronRight, Maximize2, ExternalLink } from "lucide-react";

export default function ImageSlide({ images, title, isOpenPost = false }) {
  const baseLabel =
    (title || "Community media").replace(/<[^>]*>/g, "").trim() ||
    "Community media";

  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Helper function to convert API paths to absolute URLs
  const toAbsoluteImageUrl = (path) => {
    if (!path) return null;
    // If already a full URL, return as is
    if (typeof path === "string" && path.startsWith("http")) return path;

    // Get base URL from environment and ensure no trailing slash
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/+$/, "");

    // Remove leading slashes and public/ prefix from path
    const cleanPath = path.replace(/^\/+/, "").replace(/^public\//, "");

    // Construct full URL: baseUrl/admin/uploads/filename
    return `${baseUrl}/admin/${cleanPath}`;
  };

  const normalizeImages = (input) => {
    if (!input) return [];
    let raw = input;
    try {
      if (typeof input === "string") {
        raw = JSON.parse(input);
      }
    } catch (_e) {
      // if it's a single string url
      if (typeof input === "string") {
        const url = input;
        const inferredType = /\.mp4|\.webm|\.ogg$/i.test(url) ? "video" : "image";
        const absUrl =
          !url.startsWith("http") && !url.startsWith("/assets")
            ? toAbsoluteImageUrl(url)
            : url;
        return [{ url: absUrl, type: inferredType }];
      }
      return [];
    }

    if (Array.isArray(raw)) {
      return raw
        .map((item) => {
          const urlRaw =
            typeof item === "string" ? item : item?.url || item?.path;
          if (!urlRaw) return null;
          const typeRaw = typeof item === "string" ? undefined : item?.type;
          const absUrl =
            !urlRaw.startsWith("http") && !urlRaw.startsWith("/assets")
              ? toAbsoluteImageUrl(urlRaw)
              : urlRaw;
          const inferredType =
            typeRaw || (/\.mp4|\.webm|\.ogg$/i.test(absUrl) ? "video" : "image");
          return { url: absUrl, type: inferredType };
        })
        .filter((m) => m && typeof m.url === "string" && m.url.length > 0);
    }

    return [];
  };

  const [carouselItems, setCarouselItems] = useState(() => normalizeImages(images));

  useEffect(() => {
    setCarouselItems(normalizeImages(images));
  }, [images]);

  // Keyboard navigation & body scroll locking for lightbox modal
  useEffect(() => {
    if (lightboxIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setLightboxIndex(null);
        } else if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) =>
            prev > 0 ? prev - 1 : carouselItems.length - 1
          );
        } else if (e.key === "ArrowRight") {
          setLightboxIndex((prev) =>
            prev < carouselItems.length - 1 ? prev + 1 : 0
          );
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [lightboxIndex, carouselItems.length]);

  const handleOpenImage = (e, index) => {
    if (!isOpenPost) {
      // In community feed, do not intercept; allow click to bubble to parent post card to open the post
      return;
    }
    e.stopPropagation();
    setLightboxIndex(index);
  };

  return (
    <>
      <Swiper
        pagination={{ clickable: true, dynamicBullets: true }}
        loop={carouselItems.length > 1}
        modules={[Pagination, Autoplay]}
        className="mySwiper"
      >
        {carouselItems?.length > 0 &&
          carouselItems.map((media, index) => {
            const slideLabel = `${baseLabel} - media ${index + 1}`;
            return (
              <SwiperSlide key={index}>
                <div className={Styles.CarouselimageContainer}>
                  {media.type === "video" ? (
                    <video
                      src={media.url}
                      className={Styles.Carouselimage}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={slideLabel}
                    />
                  ) : (
                    <div
                      className={`${Styles.imageSlideWrapper} ${
                        isOpenPost ? Styles.zoomable : Styles.feedItem
                      }`}
                      onClick={(e) => handleOpenImage(e, index)}
                      title={isOpenPost ? "Click to view full image" : "Click to open post"}
                      role={isOpenPost ? "button" : undefined}
                      tabIndex={isOpenPost ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isOpenPost && (e.key === "Enter" || e.key === " ")) {
                          handleOpenImage(e, index);
                        }
                      }}
                    >
                      <img
                        src={media.url}
                        alt={slideLabel}
                        title={slideLabel}
                        className={Styles.sliderImg}
                        loading="lazy"
                        width={600}
                        height={338}
                      />
                      {isOpenPost && (
                        <div className={Styles.zoomBadge}>
                          <Maximize2 size={13} />
                          <span>View</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
      </Swiper>

      {/* Fullscreen Image Lightbox Modal */}
      {isOpenPost && lightboxIndex !== null && carouselItems[lightboxIndex] && (
        <div
          className={Styles.modalOverlay}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size image view"
        >
          <div
            className={Styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls: Open in new tab & Close */}
            <div className={Styles.modalHeaderBar}>
              {carouselItems[lightboxIndex].url && (
                <button
                  type="button"
                  className={Styles.iconBtn}
                  onClick={() =>
                    window.open(carouselItems[lightboxIndex].url, "_blank")
                  }
                  title="Open original image in new tab"
                  aria-label="Open original in new tab"
                >
                  <ExternalLink size={18} />
                </button>
              )}
              <button
                type="button"
                className={Styles.iconBtn}
                onClick={() => setLightboxIndex(null)}
                title="Close full view (Esc)"
                aria-label="Close full view"
              >
                <X size={20} />
              </button>
            </div>

            {/* Previous & Next arrows if multiple items exist */}
            {carouselItems.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${Styles.navBtn} ${Styles.prevBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev > 0 ? prev - 1 : carouselItems.length - 1
                    );
                  }}
                  title="Previous image (Left arrow)"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  className={`${Styles.navBtn} ${Styles.nextBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev < carouselItems.length - 1 ? prev + 1 : 0
                    );
                  }}
                  title="Next image (Right arrow)"
                  aria-label="Next image"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}

            {/* Fullscreen media element */}
            {carouselItems[lightboxIndex].type === "video" ? (
              <video
                src={carouselItems[lightboxIndex].url}
                className={Styles.fullVideo}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={carouselItems[lightboxIndex].url}
                alt={`${baseLabel} full view`}
                className={Styles.fullImage}
              />
            )}

            {/* Multi-image counter */}
            {carouselItems.length > 1 && (
              <div className={Styles.imageCounter}>
                {lightboxIndex + 1} / {carouselItems.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
