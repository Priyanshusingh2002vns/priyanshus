"use client";
import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";

const LastCarousel = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;
  const companyImages = dealData?.company_intro_images;

  // 🧠 Get the company name for alt text
  const companyName =
    dealDetails?.data?.deal_setpData?.company_name || "Company";

  // Helper function to build absolute image path
  const toAbsoluteImagePath = (path) => {
    if (!path) return "/assets/pictures/placeholder.png";
    if (typeof path === "string" && path.startsWith("http")) return path;

    const base = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/+$/, "");
    const cleaned = (path || "").replace(/^\/+/, "").replace(/^public\//, "");
    return `${base}/admin/${cleaned}`;
  };

  // Extract images safely
  const images =
    companyImages?.status && Array.isArray(companyImages?.data)
      ? companyImages.data.map((img) => toAbsoluteImagePath(img.path))
      : [];

  const [index, setIndex] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images]);

  // If no images available, show nothing
  if (!companyImages?.status || images.length === 0) return null;

  return (
    <div className="custom-carousel-wrapper lastcarousel">
      <h3>Company Gallery</h3>

      <Carousel
        activeIndex={index}
        onSelect={() => {}}
        controls={false}
        indicators={false}
        interval={null}
      >
        {images.map((img, i) => (
          <Carousel.Item key={i}>
            <img
              className="carouselImage"
              src={img}
              alt={`${companyName} - Company Gallery Image ${i + 1}`}
              style={{
                height: "340px",
                objectFit: "contain",
                width: "100%",
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {images.length > 1 && (
        <div className="d-flex mt-3 buttons justify-content-center align-items-center lastbtns">
          {/* Prev */}
          <button
            className="custom-carousel-prev"
            onClick={() =>
              setIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
              )
            }
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1L1.5 6L6.5 11"
                stroke="#B18C07"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Indicators */}
          <div className="custom-carousel-indicators mx-3 d-flex justify-content-center align-items-center">
            {images.map((_, i) => (
              <span
                key={i}
                className={`indicator-shape ${index === i ? "active" : ""}`}
                onClick={() => setIndex(i)}
              ></span>
            ))}
          </div>

          {/* Next */}
          <button
            className="custom-carousel-next"
            onClick={() =>
              setIndex((prevIndex) => (prevIndex + 1) % images.length)
            }
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 11L6.5 6L1.5 1"
                stroke="#B18C07"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LastCarousel;
